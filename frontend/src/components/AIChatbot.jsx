import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotAPI } from '../utils/api';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi, I\'m here to help. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await chatbotAPI.sendMessage(userMessage, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I\'m having trouble connecting right now. Please try again or reach out to your emergency contacts if you need immediate help.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="floating-chatbot">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="chatbot-window"
                    >
                        <div className="chatbot-header">
                            <div className="flex-between">
                                <span>AI Support</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 'var(--font-size-lg)' }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: 'var(--space-md)',
                                        textAlign: msg.role === 'user' ? 'right' : 'left'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            padding: 'var(--space-sm) var(--space-md)',
                                            borderRadius: 'var(--radius-md)',
                                            background: msg.role === 'user' ? 'var(--primary)' : 'var(--gray-100)',
                                            color: msg.role === 'user' ? 'white' : 'var(--gray-900)',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ textAlign: 'left' }}>
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSend} className="chatbot-input-container">
                            <input
                                type="text"
                                className="form-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                                Send
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
            >
                💬
            </motion.button>
        </div>
    );
};

export default AIChatbot;
