import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { policeAPI, subscribeToSOSUpdates } from '../../utils/api';

const PoliceDashboard = () => {
    const { user, logout } = useAuth();
    const [sosEvents, setSOSEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSOSFeed();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToSOSUpdates((update) => {
            if (update.type === 'NEW_SOS') {
                setSOSEvents(prev => [update.data, ...prev]);
            } else if (update.type === 'LOCATION_UPDATE') {
                setSOSEvents(prev => prev.map(sos =>
                    sos.id === update.data.sos_id ? { ...sos, latitude: update.data.latitude, longitude: update.data.longitude } : sos
                ));
            }
        });

        return () => unsubscribe();
    }, []);

    const loadSOSFeed = async () => {
        try {
            const data = await policeAPI.getSOSFeed();
            setSOSEvents(data.sos_events || []);
        } catch (error) {
            console.error('Failed to load SOS feed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Police</div>
                    <ul className="navbar-nav">
                        <li><Link to="/police" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/police/mark-zones" className="nav-link">Mark Zones</Link></li>
                        <li><Link to="/police/connect" className="nav-link">Connect</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        🚔 Police Dashboard
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        Real-time SOS monitoring and emergency response
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex-center" style={{ minHeight: '300px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        {sosEvents.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card text-center" 
                                style={{ padding: 'var(--space-2xl)' }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>✅</div>
                                <h3>No Active SOS Events</h3>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
                                    All clear! Real-time alerts will appear here when triggered.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-2">
                                {sosEvents.map((sos, index) => (
                                    <motion.div
                                        key={sos.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="glass-card"
                                        style={{ 
                                            borderLeft: sos.status === 'ACTIVE' ? '4px solid var(--danger)' : '4px solid var(--gray-300)',
                                            background: sos.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.95)'
                                        }}
                                    >
                                        <div className="flex-between mb-md">
                                            <h4 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                👤 {sos.woman_name}
                                            </h4>
                                            <span className={`badge ${sos.status === 'ACTIVE' ? 'badge-danger' : 'badge-gray'}`}>
                                                {sos.status === 'ACTIVE' ? '🚨 ACTIVE' : sos.status}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                            <strong>📞 Phone:</strong> {sos.woman_phone}
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                            <strong>🔋 Battery:</strong> {sos.battery_percentage}%
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                            <strong>🕐 Time:</strong> {new Date(sos.timestamp).toLocaleString()}
                                        </p>

                                        <a
                                            href={`https://maps.google.com/?q=${sos.latitude},${sos.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary btn-sm"
                                            style={{ marginTop: 'var(--space-md)' }}
                                        >
                                            📍 View Location
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PoliceDashboard;
