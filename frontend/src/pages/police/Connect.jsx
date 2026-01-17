import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { policeAPI } from '../../utils/api';

const PoliceConnect = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState({ description: '', location: '' });
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'issues'

    useEffect(() => {
        loadChat();
        loadIssues();
    }, []);

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
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <h1>Police Connect</h1>
                    <Link to="/police" className="btn btn-secondary">← Back</Link>
                </div>

                <div className="flex mb-lg" style={{ gap: 'var(--space-md)' }}>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Interagency Intel Hub
                    </button>
                    <button
                        onClick={() => setActiveTab('issues')}
                        className={`btn ${activeTab === 'issues' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Infrastructure Coordination
                    </button>
                </div>

                {activeTab === 'chat' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{ padding: 'var(--space-2xl)' }}
                    >
                        <h3>Police Communication Channel</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
                            Internal chat for police officers only
                        </p>

                        <div style={{ maxHeight: '850px', overflowY: 'auto', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                            {chatMessages.map((msg, index) => (
                                <div key={index} className="glass-card-dark" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                                    <div className="flex-between mb-sm">
                                        <strong style={{ fontSize: 'var(--font-size-lg)' }}>{msg.sender_name}</strong>
                                        <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                                    </div>
                                    <p style={{ marginBottom: 0, fontSize: 'var(--font-size-lg)', lineHeight: '1.5' }}>{msg.message_text}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage}>
                            <div className="flex" style={{ gap: 'var(--space-md)' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: 'var(--space-md)', fontSize: 'var(--font-size-lg)' }}
                                />
                                <button type="submit" className="btn btn-primary btn-lg">Send</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'issues' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="glass-card mb-lg">
                            <h3>Report Issue to Infrastructure</h3>
                            <form onSubmit={handleReportIssue} style={{ marginTop: 'var(--space-lg)' }}>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={newIssue.description}
                                        onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                        placeholder="Describe the infrastructure issue..."
                                        required
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
                                <button type="submit" className="btn btn-primary">Report Issue</button>
                            </form>
                        </div>

                        <h3>Reported Issues</h3>
                        <div className="grid grid-2" style={{ marginTop: 'var(--space-lg)' }}>
                            {issues.map((issue, index) => (
                                <div key={index} className="glass-card">
                                    <div className="flex-between mb-md">
                                        <h4>Issue #{issue.id}</h4>
                                        <span className={`badge ${issue.status === 'COMPLETED' ? 'badge-success' : issue.status === 'ACCEPTED' ? 'badge-info' : 'badge-warning'}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p>{issue.description}</p>
                                    {issue.location && <p><strong>Location:</strong> {issue.location}</p>}
                                    <small style={{ color: 'var(--gray-500)' }}>{new Date(issue.timestamp).toLocaleString()}</small>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PoliceConnect;
