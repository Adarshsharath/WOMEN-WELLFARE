import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI, subscribeToSOSUpdates } from '../../utils/api';

const EmergencyDashboard = () => {
    const { logout } = useAuth();
    const [sosEvents, setSOSEvents] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    useEffect(() => {
        loadSOSEvents();

        const unsubscribe = subscribeToSOSUpdates((update) => {
            if (update.type === 'NEW_SOS') {
                setSOSEvents(prev => [update.data, ...prev]);
            }
        });

        return () => unsubscribe();
    }, []);

    const loadSOSEvents = async () => {
        try {
            const data = await emergencyAPI.getSOSEvents();
            setSOSEvents(data.sos_events || []);
        } catch (error) {
            console.error('Failed to load SOS events:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Emergency</div>
                    <ul className="navbar-nav">
                        <li><Link to="/emergency" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/emergency/chat" className="nav-link">Broadcast</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>Emergency Response Dashboard</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Monitor all SOS events</p>
                    </div>
                    <div className="flex" style={{ gap: 'var(--space-sm)' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Map View
                        </button>
                    </div>
                </div>

                {sosEvents.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)' }}>
                        <h3>No SOS Events</h3>
                        <p style={{ color: 'var(--gray-600)' }}>You'll see all SOS events here</p>
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {sosEvents.map((sos, index) => (
                            <motion.div
                                key={sos.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card"
                                style={{ borderLeft: sos.status === 'ACTIVE' ? '4px solid var(--danger)' : '4px solid var(--success)' }}
                            >
                                <div className="flex-between mb-md">
                                    <h4>{sos.woman_name}</h4>
                                    <span className={`badge ${sos.status === 'ACTIVE' ? 'badge-danger' : 'badge-success'}`}>
                                        {sos.status}
                                    </span>
                                </div>

                                <p><strong>Phone:</strong> {sos.woman_phone}</p>
                                <p><strong>Battery:</strong> {sos.battery_percentage}%</p>
                                <p><strong>Time:</strong> {new Date(sos.timestamp).toLocaleString()}</p>

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
        </div>
    );
};

export default EmergencyDashboard;
