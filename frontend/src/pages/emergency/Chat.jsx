import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { emergencyAPI } from '../../utils/api';

const EmergencyChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await emergencyAPI.getBroadcastMessages();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await emergencyAPI.broadcastMessage(newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <h1>Emergency Broadcast</h1>
                    <Link to="/emergency" className="btn btn-secondary">← Back</Link>
                </div>

                <div className="glass-card">
                    <h3>Broadcast Messages</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        Send broadcast messages to all emergency channels
                    </p>

                    <div style={{ maxHeight: '650px', overflowY: 'auto', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                        {messages.map((msg, index) => (
                            <div key={index} className="glass-card-dark" style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-md)' }}>
                                <div className="flex-between mb-sm">
                                    <strong>{msg.sender_name}</strong>
                                    <small style={{ color: 'var(--gray-500)' }}>{new Date(msg.timestamp).toLocaleString()}</small>
                                </div>
                                <p style={{ marginBottom: 0 }}>{msg.message_text}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label className="form-label">Broadcast Message</label>
                            <textarea
                                className="form-textarea"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your broadcast message..."
                                rows="3"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Send Broadcast</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmergencyChat;
