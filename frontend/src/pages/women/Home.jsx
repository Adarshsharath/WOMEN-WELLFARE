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
                    <h1>Welcome, {user?.name}!</h1>
                    <p style={{ color: 'var(--gray-600)' }}>Your safety is our priority</p>

                    <div className="grid grid-2" style={{ marginTop: 'var(--space-2xl)' }}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                        >
                            <h3>🚨 Emergency SOS</h3>
                            <p>Trigger emergency alert to all your contacts</p>
                            <button onClick={handleSOSClick} className="btn btn-danger" style={{ marginTop: 'var(--space-md)' }}>
                                Trigger SOS
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                            onClick={() => navigate('/woman/safe-routes')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>🗺️ Safe Routes</h3>
                            <p>Find the safest route to your destination</p>
                            <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                                View Routes
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                            onClick={() => navigate('/woman/emergency-contacts')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>👥 Emergency Contacts</h3>
                            <p>Manage your emergency contacts ({contacts.length})</p>
                            <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                                Manage Contacts
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                            onClick={() => navigate('/woman/fake-call')}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>📞 Fake Call</h3>
                            <p>Simulate a phone call to exit uncomfortable situations</p>
                            <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                                Start Fake Call
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Floating SOS Button */}
            <button onClick={handleSOSClick} className="floating-sos-btn">
                SOS
            </button>

            {/* AI Chatbot */}
            <AIChatbot />
        </div>
    );
};

export default WomenHome;
