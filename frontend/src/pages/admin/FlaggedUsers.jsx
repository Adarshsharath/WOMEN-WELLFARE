import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../utils/api';

const AdminFlaggedUsers = () => {
    const [flaggedUsers, setFlaggedUsers] = useState([]);

    useEffect(() => {
        loadFlaggedUsers();
    }, []);

    const loadFlaggedUsers = async () => {
        try {
            const data = await adminAPI.getFlaggedUsers();
            setFlaggedUsers(data.flagged_users || []);
        } catch (error) {
            console.error('Failed to load flagged users:', error);
        }
    };

    const handleSuspend = async (userId, userName) => {
        if (confirm(`Suspend ${userName}? They will not be able to login or trigger SOS.`)) {
            try {
                await adminAPI.suspendUser(userId);
                loadFlaggedUsers();
            } catch (error) {
                console.error('Failed to suspend user:', error);
            }
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>Flagged Users</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Review users flagged by cybersecurity</p>
                    </div>
                    <Link to="/admin" className="btn btn-secondary">← Back to Approvals</Link>
                </div>

                {flaggedUsers.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)' }}>
                        <h3>No Flagged Users</h3>
                        <p style={{ color: 'var(--gray-600)' }}>All flagged users have been reviewed</p>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {flaggedUsers.map((flag, index) => (
                            <motion.div
                                key={flag.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card"
                                style={{ borderLeft: '4px solid var(--danger)' }}
                            >
                                <div className="flex-between mb-md">
                                    <h4>{flag.user_name}</h4>
                                    <span className="badge badge-danger">Flagged</span>
                                </div>

                                <p><strong>Phone:</strong> {flag.user_phone}</p>
                                <p><strong>Flagged by:</strong> {flag.flagged_by_name}</p>
                                <p><strong>Reason:</strong> {flag.reason}</p>
                                <p><small style={{ color: 'var(--gray-500)' }}>{new Date(flag.timestamp).toLocaleString()}</small></p>

                                <button
                                    onClick={() => handleSuspend(flag.user_id, flag.user_name)}
                                    className="btn btn-danger btn-sm"
                                    style={{ marginTop: 'var(--space-md)' }}
                                >
                                    Suspend User
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFlaggedUsers;
