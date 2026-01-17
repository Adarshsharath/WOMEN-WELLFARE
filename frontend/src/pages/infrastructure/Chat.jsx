import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { infrastructureAPI } from '../../utils/api';

const InfrastructureChat = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        loadChat();
        const interval = setInterval(() => {
            loadChat();
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const loadChat = async () => {
        try {
            const data = await infrastructureAPI.getChatMessages();
            setChatMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await infrastructureAPI.sendChatMessage(newMessage);
            setNewMessage('');
            loadChat();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="page-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="page-content container" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--space-lg) var(--space-lg) 0' }}>
                <div className="glass-card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--white)', padding: 'var(--space-xl)' }}>
                    <div className="flex-between">
                        <h1 style={{ marginBottom: 0 }}>Infrastructure Team Chat</h1>
                        <div className="flex" style={{ gap: 'var(--space-md)' }}>
                            <button
                                onClick={() => setIsChatExpanded(!isChatExpanded)}
                                className="btn btn-secondary"
                                title={isChatExpanded ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isChatExpanded ? '⤓' : '⤢'}
                            </button>
                            <Link to="/infrastructure" className="btn btn-secondary">← Back</Link>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: isChatExpanded ? 'var(--space-lg)' : 'var(--space-xl)',
                        marginBottom: 'var(--space-lg)',
                        maxHeight: isChatExpanded ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)',
                        position: isChatExpanded ? 'fixed' : 'relative',
                        top: isChatExpanded ? 'var(--space-lg)' : 'auto',
                        left: isChatExpanded ? 'var(--space-lg)' : 'auto',
                        right: isChatExpanded ? 'var(--space-lg)' : 'auto',
                        bottom: isChatExpanded ? 'var(--space-lg)' : 'auto',
                        zIndex: isChatExpanded ? 1000 : 1,
                        width: isChatExpanded ? 'calc(100% - var(--space-xl))' : 'auto'
                    }}
                >
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <span>🏗️</span> Infrastructure Department Communication
                        </h3>
                        <p style={{ color: 'var(--gray-700)', fontWeight: '500', fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                            Internal chat for infrastructure team members • Coordinate and collaborate
                        </p>
                    </div>

                    <div
                        ref={chatContainerRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            marginBottom: 'var(--space-lg)',
                            paddingRight: 'var(--space-sm)'
                        }}
                    >
                        {chatMessages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--gray-500)' }}>
                                <p style={{ fontSize: 'var(--font-size-lg)' }}>💬 No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            chatMessages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card-dark"
                                    style={{
                                        marginBottom: 'var(--space-md)',
                                        padding: 'var(--space-lg)',
                                        borderRadius: 'var(--radius-lg)',
                                        borderLeft: '3px solid var(--info)'
                                    }}
                                >
                                    <div className="flex-between mb-sm">
                                        <strong style={{ fontSize: 'var(--font-size-base)', color: 'var(--info)' }}>
                                            👷 {msg.sender_name}
                                        </strong>
                                        <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </small>
                                    </div>
                                    <p style={{ marginBottom: 0, fontSize: 'var(--font-size-base)', lineHeight: '1.6' }}>
                                        {msg.message_text}
                                    </p>
                                </motion.div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{ marginTop: 'auto' }}>
                        <div className="flex" style={{ gap: 'var(--space-md)', alignItems: 'flex-end' }}>
                            <input
                                type="text"
                                className="form-input"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message here..."
                                style={{
                                    flex: 1,
                                    padding: 'var(--space-md)',
                                    fontSize: 'var(--font-size-base)',
                                    marginBottom: 0
                                }}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!newMessage.trim()}
                            >
                                Send 📤
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default InfrastructureChat;
