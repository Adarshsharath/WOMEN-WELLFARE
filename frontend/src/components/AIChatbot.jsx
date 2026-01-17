import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotAPI } from '../utils/api';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi, I\'m here to help. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [callStatus, setCallStatus] = useState('Connecting...');
    const [callTimer, setCallTimer] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, loading]);

    // Timer for call
    useEffect(() => {
        let interval;
        if (isCalling) {
            interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
        } else {
            setCallTimer(0);
        }
        return () => clearInterval(interval);
    }, [isCalling]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOfflineResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();
        let response = "";

        if (msg.includes("auto")) {
            response = "I see you're in an auto. Please share the vehicle number if you can. Stay alert, I'll call you back in 5 minutes to check on you.";
        } else if (msg.includes("bus")) {
            response = "Buses can be crowded or lonely. Are you near the driver? Stay on the line if you feel uneasy. I will call you back in 5 minutes.";
        } else if (msg.includes("market") || msg.includes("place") || msg.includes("road")) {
            response = "That area can be busy. Keep your phone handy and stay in well-lit spots. I'm monitoring your status and will call back in 5 minutes.";
        } else {
            response = "I understand. When do you expect to be back home? I'll call you back in 5 minutes regardless to make sure you are safe.";
        }

        return response;
    };

    const handleSend = async (e, forcedMessage = null) => {
        if (e) e.preventDefault();
        const messageToSend = forcedMessage || input;
        if (!messageToSend.trim() || loading) return;

        // Force stop mic immediately when message starts sending
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (err) { }
        }

        const userMessage = messageToSend.trim();
        if (!forcedMessage) setInput('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await chatbotAPI.sendMessage(userMessage, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
            if (isCalling) speak(response.message);
        } catch (error) {
            console.error('Chatbot error:', error);
            const fallbackResponse = handleOfflineResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
            if (isCalling) speak(fallbackResponse);
        } finally {
            setLoading(false);
        }
    };


    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            if (!recognitionRef.current) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-IN'; // Set to Indian accent for recognition too
            }

            recognitionRef.current.onstart = () => {
                console.log("STT: Listening...");
                setIsListening(true);
                setInterimTranscript('');
            };

            recognitionRef.current.onresult = (event) => {
                // Ignore results if AI is currently speaking or thinking
                if (isSpeaking || loading) return;

                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const finalTranscript = event.results[i][0].transcript;
                        console.log("STT: Final Result ->", finalTranscript);
                        setInterimTranscript('');
                        handleSend(null, finalTranscript);
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                setInterimTranscript(interim);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // ONLY restart if mic is active AND AI is NOT speaking AND NOT loading
                if (isCalling && isMicActive && !isSpeaking && !loading) {
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            };

            recognitionRef.current.onerror = (event) => {
                if (event.error === 'no-speech') {
                    // Normal timeout, don't log as error
                    return;
                }
                console.error("STT Error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Mic access denied!");
                    setIsMicActive(false);
                    endCall();
                }
            };
        }
    }, [isCalling, isSpeaking, isMicActive]);

    // Handle Mic Toggle
    useEffect(() => {
        if (isMicActive && !isListening && !isSpeaking) {
            try { recognitionRef.current?.start(); } catch (e) { }
        } else if (!isMicActive && isListening) {
            try { recognitionRef.current?.stop(); } catch (e) { }
        }
    }, [isMicActive, isListening, isSpeaking]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            console.log("TTS: Speaking ->", text);
            setIsSpeaking(true);

            // Turn off mic while speaking
            if (isListening) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }

            const utterance = new SpeechSynthesisUtterance(text);

            // Prioritize high-quality "Natural" or "Google" voices with Indian accent preference
            const voices = window.speechSynthesis.getVoices();

            // 1. Try for high-quality Indian accent (Google or Natural)
            let bestVoice = voices.find(v => (v.lang.startsWith('en-IN')) && (v.name.includes('Google') || v.name.includes('Natural')));

            // 2. Fallback to any Indian accent
            if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en-IN'));

            // 3. Fallback to any high-quality English accent (Google/Natural)
            if (!bestVoice) bestVoice = voices.find(v => (v.lang.startsWith('en')) && (v.name.includes('Google') || v.name.includes('Natural')));

            if (bestVoice) {
                console.log("TTS: Using High-Quality Voice ->", bestVoice.name);
                utterance.voice = bestVoice;
            }

            utterance.rate = 0.9; // Slightly slower for better empathy/realism
            utterance.pitch = 1.0;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                console.log("TTS: Finished");
                setIsSpeaking(false);
            };
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const startCall = () => {
        setIsCalling(true);
        setIsMicActive(true);
        setCallStatus('In Call');
        const greet = "Hello, I am your SafeSpace assistant. Are you feeling safe?";
        setMessages(prev => [...prev, { role: 'assistant', content: greet }]);
        speak(greet);
    };

    const endCall = () => {
        setIsCalling(false);
        setIsMicActive(false);
        setIsSpeaking(false);
        window.speechSynthesis.cancel();
        try { recognitionRef.current?.stop(); } catch (e) { }
    };

    return (
        <div className="floating-chatbot">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="chatbot-window glass-card"
                        style={{ padding: 0, border: 'none', background: 'var(--white)' }}
                    >
                        {/* Custom Header */}
                        <div className="chatbot-header" style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                            padding: 'var(--space-md) var(--space-lg)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
                                <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>AI Safety Guardian</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <button onClick={startCall} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }}>📞 Call</button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                            </div>
                        </div>

                        {/* Call Overlay */}
                        <AnimatePresence>
                            {isCalling && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, #004d99 0%, #00264d 100%)',
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <motion.div
                                        animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                        transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '50px',
                                            marginBottom: '20px',
                                            boxShadow: isListening ? '0 0 40px rgba(16, 185, 129, 0.4)' : '0 0 40px rgba(255,255,255,0.1)',
                                            border: isListening ? '3px solid #10B981' : '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        {isSpeaking ? '🗣️' : (isListening ? '🎙️' : '🤖')}
                                    </motion.div>
                                    <h2 style={{ color: 'white', marginBottom: '10px' }}>
                                        {isSpeaking ? 'Speaking...' : (isListening ? 'Listening...' : callStatus)}
                                    </h2>

                                    {/* Interim Transcript / Live Feedback */}
                                    <div style={{ height: '40px', padding: '0 20px', textAlign: 'center', opacity: 0.9, color: '#10B981', fontWeight: '500' }}>
                                        {interimTranscript && `"${interimTranscript}..."`}
                                    </div>

                                    <div style={{ fontSize: '24px', opacity: 0.8, marginBottom: '40px' }}>{formatTime(callTimer)}</div>

                                    <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                                        {/* Mic Toggle Button */}
                                        <button
                                            onClick={() => setIsMicActive(!isMicActive)}
                                            style={{
                                                width: '60px', height: '60px', borderRadius: '50%',
                                                background: isMicActive ? '#10B981' : 'rgba(255,255,255,0.2)',
                                                border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                            title={isMicActive ? "Mute Mic" : "Unmute Mic"}
                                        >
                                            {isMicActive ? '🎙️' : '🔇'}
                                        </button>

                                        <button onClick={endCall} style={{
                                            width: '80px', height: '80px', borderRadius: '50%', background: '#EF4444',
                                            border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer',
                                            boxShadow: '0 10px 20px rgba(239, 68, 68, 0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>🔚</button>

                                        {/* Spacer to balance the mic button */}
                                        <div style={{ width: '60px' }}></div>
                                    </div>

                                    <div style={{ marginTop: '40px', padding: '0 20px', textAlign: 'center', fontStyle: 'italic', opacity: 0.7 }}>
                                        {isMicActive ? "The AI is listening to you." : "Microphone is muted. Click the icon to talk."}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="chatbot-messages" style={{
                            background: '#F8FAFC',
                            padding: 'var(--space-lg)',
                            flex: 1,
                            overflowY: 'auto'
                        }}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        marginBottom: 'var(--space-md)',
                                        textAlign: msg.role === 'user' ? 'right' : 'left'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            padding: '12px 16px',
                                            borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                            background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                            color: msg.role === 'user' ? 'white' : 'var(--gray-800)',
                                            maxWidth: '85%',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                            fontSize: '14px',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div style={{ textAlign: 'left' }}>
                                    <div className="spinner-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="chatbot-input-container" style={{
                            padding: 'var(--space-md)',
                            background: 'white',
                            borderTop: '1px solid var(--gray-200)',
                            display: 'flex',
                            gap: 'var(--space-sm)'
                        }}>
                            <input
                                type="text"
                                className="form-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, marginBottom: 0, borderRadius: '25px', padding: '10px 20px' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '45px', minWidth: '45px', padding: 0 }} disabled={loading}>
                                ➔
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="chatbot-toggle"
                style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    boxShadow: '0 10px 30px rgba(0, 102, 204, 0.4)'
                }}
            >
                <span style={{ fontSize: '30px' }}>💬</span>
            </motion.button>

            <style>{`
                .spinner-dots {
                    display: flex;
                    gap: 4px;
                    padding: 10px 15px;
                    background: white;
                    border-radius: 20px;
                    width: fit-content;
                }
                .spinner-dots span {
                    width: 8px;
                    height: 8px;
                    background: var(--gray-400);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .spinner-dots span:nth-child(1) { animation-delay: -0.32s; }
                .spinner-dots span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
            `}</style>
        </div>
    );
};

export default AIChatbot;
