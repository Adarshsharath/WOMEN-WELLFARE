import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { policeAPI } from '../../utils/api';

const PoliceConnect = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState({ description: '', location: '' });
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'issues'
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        loadChat();
        loadIssues();
        const interval = setInterval(() => {
            if (activeTab === 'chat') loadChat();
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const loadChat = async () => {
        try {
            const data = await policeAPI.getChatMessages();
            setChatMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const loadIssues = async () => {
        try {
            const data = await policeAPI.getIssues();
            setIssues(data.issues || []);
        } catch (error) {
            console.error('Failed to load issues:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await policeAPI.sendChatMessage(newMessage);
            setNewMessage('');
            loadChat();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleReportIssue = async (e) => {
        e.preventDefault();
        try {
            await policeAPI.reportIssue(newIssue);
            setNewIssue({ description: '', location: '' });
            loadIssues();
            alert('Issue reported successfully');
        } catch (error) {
            console.error('Failed to report issue:', error);
        }
    };

    return (
        <div className="page-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="page-content container" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--space-lg) var(--space-lg) 0' }}>
                <div className="flex-between mb-lg">
                    <h1 style={{ marginBottom: 0 }}>Police Connect</h1>
                    <div className="flex" style={{ gap: 'var(--space-md)' }}>
                        {activeTab === 'chat' && (
                            <button
                                onClick={() => setIsChatExpanded(!isChatExpanded)}
                                className="btn btn-secondary"
                                title={isChatExpanded ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isChatExpanded ? '⤓' : '⤢'}
                            </button>
                        )}
                        <Link to="/police" className="btn btn-secondary">← Back</Link>
                    </div>
                </div>

                <div className="flex mb-lg" style={{ gap: 'var(--space-md)' }}>
                    <button
                        onClick={() => { setActiveTab('chat'); setIsChatExpanded(false); }}
                        className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        💬 Interagency Intel Hub
                    </button>
                    <button
                        onClick={() => { setActiveTab('issues'); setIsChatExpanded(false); }}
                        className={`btn ${activeTab === 'issues' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🔧 Infrastructure Coordination
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card"
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: isChatExpanded ? 'var(--space-lg)' : 'var(--space-xl)',
                                marginBottom: 'var(--space-lg)',
                                maxHeight: isChatExpanded ? 'calc(100vh - 180px)' : 'calc(100vh - 220px)',
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
                                    <span>🚔</span> Police Communication Channel
                                </h3>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                    Internal chat for police officers • Real-time updates
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
                                        <p style={{ fontSize: 'var(--font-size-lg)' }}>No messages yet. Start the conversation!</p>
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
                                                borderLeft: '3px solid var(--primary)'
                                            }}
                                        >
                                            <div className="flex-between mb-sm">
                                                <strong style={{ fontSize: 'var(--font-size-base)', color: 'var(--primary)' }}>
                                                    👮 {msg.sender_name}
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
                    )}

                    {activeTab === 'issues' && (
                        <motion.div
                            key="issues"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ flex: 1, overflow: 'auto', paddingBottom: 'var(--space-lg)' }}
                        >
                            <div className="glass-card mb-lg">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <span>🔧</span> Report Issue to Infrastructure
                                </h3>
                                <form onSubmit={handleReportIssue} style={{ marginTop: 'var(--space-lg)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            value={newIssue.description}
                                            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                            placeholder="Describe the infrastructure issue..."
                                            required
                                            rows="4"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newIssue.location}
                                            onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                                            placeholder="Location of the issue"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">📋 Report Issue</button>
                                </form>
                            </div>

                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Reported Issues</h3>
                            <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                                {issues.length === 0 ? (
                                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)' }}>
                                        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-lg)' }}>No issues reported yet</p>
                                    </div>
                                ) : (
                                    issues.map((issue, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="glass-card"
                                        >
                                            <div className="flex-between mb-md">
                                                <h4 style={{ marginBottom: 0 }}>Issue #{issue.id}</h4>
                                                <span className={`badge ${issue.status === 'COMPLETED' ? 'badge-success' : issue.status === 'ACCEPTED' ? 'badge-info' : 'badge-warning'}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 'var(--font-size-base)', lineHeight: '1.6' }}>{issue.description}</p>
                                            {issue.location && (
                                                <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    <strong>📍 Location:</strong> {issue.location}
                                                </p>
                                            )}
                                            <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                                {new Date(issue.timestamp).toLocaleString()}
                                            </small>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PoliceConnect;
