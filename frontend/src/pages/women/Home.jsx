import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { womenAPI } from '../../utils/api';
import AIChatbot from '../../components/AIChatbot';

const WomenHome = () => {
    const { user, logout } = useAuth();
    const [contacts, setContacts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await womenAPI.getEmergencyContacts();
            setContacts(data.contacts || []);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    };

    const handleSOSClick = () => {
        if (contacts.length === 0) {
            alert('Please add emergency contacts before triggering SOS');
            navigate('/woman/emergency-contacts');
        } else {
            navigate('/woman/sos-confirm');
        }
    };

    return (
        <div className="page-wrapper">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace</div>
                    <ul className="navbar-nav">
                        <li><Link to="/woman" className="nav-link active">Home</Link></li>
                        <li><Link to="/woman/fake-call" className="nav-link">Fake Call</Link></li>
                        <li><Link to="/woman/safe-routes" className="nav-link">Safe Routes</Link></li>
                        <li><Link to="/woman/emergency-contacts" className="nav-link">Contacts</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            {/* Content */}
            <div className="page-content container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h1 style={{ 
                            fontSize: 'var(--font-size-4xl)', 
                            marginBottom: 'var(--space-sm)',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Welcome, {user?.name}! 👋
                        </h1>
                        <p style={{ color: 'var(--gray-700)', fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>
                            Your safety is our priority 🛡️
                        </p>
                    </div>

                    <div className="grid grid-2" style={{ marginTop: 'var(--space-2xl)' }}>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-card hover-lift"
                            style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                borderLeft: '4px solid var(--danger)',
                                cursor: 'pointer'
                            }}
                            onClick={handleSOSClick}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🚨</div>
                            <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>Emergency SOS</h3>
                            <p style={{ color: 'var(--gray-700)', fontWeight: '500', marginBottom: 'var(--space-lg)' }}>
                                Trigger emergency alert to all your contacts
                            </p>
                            <button onClick={handleSOSClick} className="btn btn-danger" style={{ width: '100%', pointerEvents: 'none' }}>
                                🆘 Trigger SOS
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-card hover-lift"
                            onClick={() => navigate('/woman/safe-routes')}
                            style={{ 
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%)',
                                borderLeft: '4px solid var(--primary)'
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🗺️</div>
                            <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--space-sm)' }}>Safe Routes</h3>
                            <p style={{ color: 'var(--gray-700)', fontWeight: '500', marginBottom: 'var(--space-lg)' }}>
                                Find the safest route to your destination
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%', pointerEvents: 'none' }}>
                                🛣️ View Routes
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-card hover-lift"
                            onClick={() => navigate('/woman/emergency-contacts')}
                            style={{ 
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                borderLeft: '4px solid var(--success)'
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>👥</div>
                            <h3 style={{ color: 'var(--success)', marginBottom: 'var(--space-sm)' }}>Emergency Contacts</h3>
                            <p style={{ color: 'var(--gray-700)', fontWeight: '500', marginBottom: 'var(--space-lg)' }}>
                                Manage your emergency contacts ({contacts.length})
                            </p>
                            <button className="btn btn-success" style={{ width: '100%', pointerEvents: 'none' }}>
                                📇 Manage Contacts
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-card hover-lift"
                            onClick={() => navigate('/woman/fake-call')}
                            style={{ 
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                borderLeft: '4px solid var(--warning)'
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📞</div>
                            <h3 style={{ color: 'var(--warning)', marginBottom: 'var(--space-sm)' }}>Fake Call</h3>
                            <p style={{ color: 'var(--gray-700)', fontWeight: '500', marginBottom: 'var(--space-lg)' }}>
                                Simulate a phone call to exit uncomfortable situations
                            </p>
                            <button className="btn btn-warning" style={{ width: '100%', pointerEvents: 'none' }}>
                                ☎️ Start Fake Call
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Floating SOS Button */}
            <motion.button 
                onClick={handleSOSClick} 
                className="floating-sos-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                    boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.7)',
                        '0 0 0 20px rgba(239, 68, 68, 0)',
                    ]
                }}
                transition={{ 
                    boxShadow: { duration: 2, repeat: Infinity }
                }}
                style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    fontWeight: '800',
                    fontSize: '1.2rem'
                }}
            >
                🆘 SOS
            </motion.button>

            {/* AI Chatbot */}
            <AIChatbot />
        </div>
    );
};

export default WomenHome;
