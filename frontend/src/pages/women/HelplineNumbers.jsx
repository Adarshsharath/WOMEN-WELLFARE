import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HelplineNumbers = () => {
    const [copiedNumber, setCopiedNumber] = useState(null);

    const helplines = [
        {
            category: '🚨 Emergency Services',
            numbers: [
                { name: 'Police Emergency', number: '100', icon: '👮', description: 'For immediate police assistance' },
                { name: 'Ambulance', number: '102', icon: '🚑', description: 'Medical emergency services' },
                { name: 'Fire Brigade', number: '101', icon: '🚒', description: 'Fire and rescue services' },
                { name: 'Disaster Management', number: '108', icon: '⛑️', description: 'Natural disaster response' },
            ]
        },
        {
            category: '👩 Women Safety Helplines',
            numbers: [
                { name: 'Women Helpline', number: '1091', icon: '👩‍⚖️', description: '24x7 support for women in distress' },
                { name: 'Women Helpline (Domestic Abuse)', number: '181', icon: '🆘', description: 'Support for domestic violence victims' },
                { name: 'National Commission for Women', number: '7827-170-170', icon: '📞', description: 'NCW helpline for women' },
                { name: 'Cyber Crime Against Women', number: '1930', icon: '💻', description: 'Report cyber crimes against women' },
            ]
        },
        {
            category: '🆘 Child & Senior Helplines',
            numbers: [
                { name: 'Child Helpline', number: '1098', icon: '👶', description: 'Help for children in need' },
                { name: 'Senior Citizens Helpline', number: '14567', icon: '👴', description: 'Assistance for elderly citizens' },
                { name: 'Missing Children', number: '1094', icon: '🔍', description: 'Report missing children' },
            ]
        },
        {
            category: '🏥 Health & Mental Support',
            numbers: [
                { name: 'Mental Health Helpline', number: '1800-599-0019', icon: '🧠', description: 'Free mental health support' },
                { name: 'COVID-19 Helpline', number: '1075', icon: '😷', description: 'COVID-19 related queries' },
                { name: 'National Health Portal', number: '1800-180-1104', icon: '🏥', description: 'General health information' },
            ]
        },
        {
            category: '📱 Other Important Helplines',
            numbers: [
                { name: 'Railway Helpline', number: '139', icon: '🚂', description: 'Railway enquiry and emergency' },
                { name: 'Road Accident Emergency', number: '1073', icon: '🚗', description: 'Road accident assistance' },
                { name: 'Tourist Helpline', number: '1363', icon: '🗺️', description: 'Help for tourists in India' },
                { name: 'LPG Emergency', number: '1906', icon: '🔥', description: 'LPG leak and emergency' },
            ]
        }
    ];

    const copyToClipboard = (number, name) => {
        navigator.clipboard.writeText(number).then(() => {
            setCopiedNumber(number);
            setTimeout(() => setCopiedNumber(null), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    const callNumber = (number) => {
        window.location.href = `tel:${number}`;
    };

    return (
        <div className="page-wrapper">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">📞 Emergency Helplines</div>
                    <ul className="navbar-nav">
                        <li><Link to="/woman" className="nav-link">← Back to Home</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h1 style={{ 
                            fontSize: 'var(--font-size-4xl)', 
                            marginBottom: 'var(--space-sm)',
                            background: 'linear-gradient(135deg, var(--danger) 0%, var(--warning) 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent'
                        }}>
                            🚨 Emergency Helpline Numbers
                        </h1>
                        <p style={{ color: 'var(--gray-700)', fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>
                            Save these numbers - they could save a life
                        </p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                            borderLeft: '4px solid var(--danger)',
                            marginBottom: 'var(--space-xl)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ fontSize: '2rem' }}>⚠️</div>
                            <div>
                                <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-xs)' }}>In Case of Emergency</h3>
                                <p style={{ color: 'var(--gray-700)', fontWeight: '500', margin: 0 }}>
                                    Click on any number to call directly. These helplines are available 24/7 across India.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {helplines.map((category, catIndex) => (
                        <motion.div
                            key={catIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.1 }}
                            style={{ marginBottom: 'var(--space-xl)' }}
                        >
                            <h2 style={{ 
                                marginBottom: 'var(--space-lg)', 
                                color: 'var(--primary)',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '800'
                            }}>
                                {category.category}
                            </h2>

                            <div className="grid grid-2">
                                {category.numbers.map((helpline, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="glass-card hover-lift"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.06) 0%, rgba(0, 153, 255, 0.03) 100%)',
                                            borderLeft: '4px solid var(--primary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                                            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{helpline.icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ 
                                                    color: 'var(--primary)', 
                                                    marginBottom: 'var(--space-xs)',
                                                    fontSize: 'var(--font-size-lg)',
                                                    fontWeight: '700'
                                                }}>
                                                    {helpline.name}
                                                </h4>
                                                <p style={{ 
                                                    color: 'var(--gray-600)', 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    marginBottom: 'var(--space-md)',
                                                    lineHeight: 1.4
                                                }}>
                                                    {helpline.description}
                                                </p>
                                                
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 'var(--space-md)',
                                                    marginTop: 'var(--space-md)'
                                                }}>
                                                    <div style={{
                                                        fontSize: 'var(--font-size-2xl)',
                                                        fontWeight: '800',
                                                        color: 'var(--primary)',
                                                        fontFamily: 'monospace',
                                                        letterSpacing: '1px'
                                                    }}>
                                                        {helpline.number}
                                                    </div>
                                                </div>

                                                <div style={{ 
                                                    display: 'flex', 
                                                    gap: 'var(--space-sm)', 
                                                    marginTop: 'var(--space-md)' 
                                                }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => callNumber(helpline.number)}
                                                        className="btn btn-sm btn-danger"
                                                        style={{ flex: 1 }}
                                                    >
                                                        📞 Call Now
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => copyToClipboard(helpline.number, helpline.name)}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        {copiedNumber === helpline.number ? '✅ Copied!' : '📋 Copy'}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            borderLeft: '4px solid var(--success)',
                            textAlign: 'center',
                            marginTop: 'var(--space-2xl)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>💡</div>
                        <h3 style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }}>Safety Tips</h3>
                        <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                            <ul style={{ color: 'var(--gray-700)', fontWeight: '500', lineHeight: 1.8 }}>
                                <li>Save important numbers in your phone contacts</li>
                                <li>Share your location with trusted contacts when traveling</li>
                                <li>Keep your phone charged and have emergency contacts readily accessible</li>
                                <li>Don't hesitate to call for help when you feel unsafe</li>
                                <li>Use the SOS feature to alert all your emergency contacts instantly</li>
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default HelplineNumbers;
