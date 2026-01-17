import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';

const AdminApprovals = () => {
    const { logout } = useAuth();
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            const data = await adminAPI.getPendingApprovals();
            setPendingUsers(data.pending_approvals || []);
        } catch (error) {
            console.error('Failed to load pending users:', error);
        }
    };

    const handleApprove = async (id, name) => {
        if (confirm(`Approve ${name}?`)) {
            try {
                await adminAPI.approveUser(id);
                loadPendingUsers();
            } catch (error) {
                console.error('Failed to approve user:', error);
            }
        }
    };

    const handleReject = async (id, name) => {
        if (confirm(`Reject ${name}? This will delete their registration.`)) {
            try {
                await adminAPI.rejectUser(id);
                loadPendingUsers();
            } catch (error) {
                console.error('Failed to reject user:', error);
            }
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Admin</div>
                    <ul className="navbar-nav">
                        <li><Link to="/admin" className="nav-link active">Approvals</Link></li>
                        <li><Link to="/admin/flagged-users" className="nav-link">Flagged Users</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <h1>Community Approvals</h1>
                <p style={{ color: 'var(--gray-600)' }}>Review and approve community member registrations</p>

                {pendingUsers.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)', marginTop: 'var(--space-xl)' }}>
                        <h3>No Pending Approvals</h3>
                        <p style={{ color: 'var(--gray-600)' }}>All community registrations have been processed</p>
                    </div>
                ) : (
                    <div className="grid grid-2" style={{ marginTop: 'var(--space-xl)' }}>
                        {pendingUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card"
                            >
                                <div className="flex-between mb-md">
                                    <h4>{user.name}</h4>
                                    <span className="badge badge-warning">{user.role}</span>
                                </div>

                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Phone:</strong> {user.phone}</p>
                                <p><small style={{ color: 'var(--gray-500)' }}>Registered: {new Date(user.created_at).toLocaleString()}</small></p>

                                <div className="flex" style={{ gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                    <button
                                        onClick={() => handleApprove(user.id, user.name)}
                                        className="btn btn-success btn-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(user.id, user.name)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApprovals;
