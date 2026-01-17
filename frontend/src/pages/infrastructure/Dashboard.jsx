import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { infrastructureAPI } from '../../utils/api';

const InfrastructureDashboard = () => {
    const { logout } = useAuth();
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadIssues();
    }, [filter]);

    const loadIssues = async () => {
        try {
            const statusFilter = filter === 'ALL' ? '' : filter;
            const data = await infrastructureAPI.getAllIssues(statusFilter);
            setIssues(data.issues || []);
        } catch (error) {
            console.error('Failed to load issues:', error);
        }
    };

    const handleAccept = async (id) => {
        try {
            await infrastructureAPI.acceptIssue(id);
            loadIssues();
        } catch (error) {
            console.error('Failed to accept issue:', error);
        }
    };

    const handleComplete = async (id) => {
        try {
            await infrastructureAPI.completeIssue(id);
            loadIssues();
        } catch (error) {
            console.error('Failed to complete issue:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Infrastructure</div>
                    <button onClick={logout} className="btn btn-sm btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="page-content container">
                <h1>Infrastructure Dashboard</h1>
                <p style={{ color: 'var(--gray-600)' }}>Manage reported issues</p>

                <div className="flex mb-lg" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                    {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {issues.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)' }}>
                        <h3>No {filter !== 'ALL' ? filter.toLowerCase() : ''} issues</h3>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {issues.map((issue, index) => (
                            <motion.div
                                key={issue.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card"
                            >
                                <div className="flex-between mb-md">
                                    <h4>Issue #{issue.id}</h4>
                                    <span className={`badge ${issue.status === 'COMPLETED' ? 'badge-success' : issue.status === 'ACCEPTED' ? 'badge-info' : 'badge-warning'}`}>
                                        {issue.status}
                                    </span>
                                </div>

                                <p><strong>Reported by:</strong> {issue.reporter_name}</p>
                                <p>{issue.description}</p>
                                {issue.location && <p><strong>Location:</strong> {issue.location}</p>}
                                <p><small style={{ color: 'var(--gray-500)' }}>{new Date(issue.timestamp).toLocaleString()}</small></p>

                                <div className="flex" style={{ gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                    {issue.status === 'PENDING' && (
                                        <button onClick={() => handleAccept(issue.id)} className="btn btn-primary btn-sm">
                                            Accept Issue
                                        </button>
                                    )}
                                    {issue.status === 'ACCEPTED' && issue.assigned_to_name && (
                                        <button onClick={() => handleComplete(issue.id)} className="btn btn-success btn-sm">
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfrastructureDashboard;
