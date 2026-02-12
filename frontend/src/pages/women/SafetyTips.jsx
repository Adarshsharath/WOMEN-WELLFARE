import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SafetyTips = () => {
    const tips = [
        {
            category: '🚶‍♀️ Walking Safety',
            icon: '🚶‍♀️',
            color: 'var(--primary)',
            tips: [
                'Stay aware of your surroundings - avoid using headphones in isolated areas',
                'Walk in well-lit, populated areas whenever possible',
                'Trust your instincts - if something feels wrong, it probably is',
                'Keep your phone charged and emergency contacts on speed dial',
                'Share your live location with trusted contacts when walking alone',
                'Carry a personal safety alarm or whistle',
                'Vary your routine - don\'t take the same route every day',
                'Walk confidently and purposefully'
            ]
        },
        {
            category: '🚗 Transportation Safety',
            icon: '🚗',
            color: 'var(--success)',
            tips: [
                'Always verify driver details and vehicle number before boarding',
                'Share trip details with family or friends',
                'Use the Ride Safety Timer feature in this app',
                'Sit in the back seat when taking a cab alone',
                'Keep emergency numbers handy',
                'Trust licensed taxis and verified ride-sharing services',
                'Avoid accepting rides from strangers',
                'Check door handles work before the ride starts'
            ]
        },
        {
            category: '🏠 Home Safety',
            icon: '🏠',
            color: 'var(--warning)',
            tips: [
                'Keep doors and windows locked, especially at night',
                'Install good quality locks and consider a peephole',
                'Don\'t open the door to strangers without verification',
                'Keep emergency numbers visible near the phone',
                'Have a safe room or escape plan',
                'Get to know your neighbors',
                'Install motion-sensor lights outside',
                'Don\'t advertise your absence on social media'
            ]
        },
        {
            category: '💻 Digital Safety',
            icon: '💻',
            color: 'var(--info)',
            tips: [
                'Use strong, unique passwords for all accounts',
                'Enable two-factor authentication wherever possible',
                'Be cautious about sharing personal information online',
                'Review your privacy settings regularly',
                'Don\'t share your real-time location publicly',
                'Be wary of friend requests from strangers',
                'Report and block harassers immediately',
                'Keep your devices and apps updated'
            ]
        },
        {
            category: '📱 Mobile Safety',
            icon: '📱',
            color: 'var(--danger)',
            tips: [
                'Always keep your phone charged above 20%',
                'Enable location services for emergency situations',
                'Save emergency contacts with ICE (In Case of Emergency) prefix',
                'Download safety apps like this one',
                'Set up emergency SOS features on your phone',
                'Keep important documents digitally backed up',
                'Don\'t use your phone in isolated areas at night',
                'Use a secure lock screen'
            ]
        },
        {
            category: '👥 Social Safety',
            icon: '👥',
            color: '#8B5CF6',
            tips: [
                'Let someone know where you\'re going and when you\'ll be back',
                'Meet new people in public places',
                'Stay with your friends in social gatherings',
                'Watch your drink at all times',
                'Have a buddy system for nights out',
                'Know the exits wherever you go',
                'Trust your gut feeling about people',
                'Don\'t feel obligated to be polite if you feel unsafe'
            ]
        }
    ];

    const emergencyChecklist = [
        { item: 'Emergency contacts saved in phone', icon: '📞' },
        { item: 'Her-Assist app installed and set up', icon: '🛡️' },
        { item: 'Location sharing enabled', icon: '📍' },
        { item: 'Personal alarm or whistle', icon: '🔔' },
        { item: 'Pepper spray (where legal)', icon: '🌶️' },
        { item: 'Emergency cash hidden in wallet', icon: '💵' },
        { item: 'Medical information card', icon: '🏥' },
        { item: 'Power bank for phone', icon: '🔋' }
    ];

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">💡 Safety Tips</div>
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
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            💡 Safety Tips & Guidelines
                        </h1>
                        <p style={{ color: 'var(--gray-700)', fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>
                            Empower yourself with knowledge and stay safe
                        </p>
                    </div>

                    {/* Emergency Preparedness Checklist */}
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
                        <h2 style={{ color: 'var(--danger)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <span style={{ fontSize: '2rem' }}>✅</span> Emergency Preparedness Checklist
                        </h2>
                        <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                            {emergencyChecklist.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.03 }}
                                    style={{
                                        padding: 'var(--space-md)',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                    <span style={{ color: 'var(--gray-700)', fontWeight: '500' }}>{item.item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Safety Tips by Category */}
                    {tips.map((category, catIndex) => (
                        <motion.div
                            key={catIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.15 }}
                            style={{ marginBottom: 'var(--space-xl)' }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="glass-card"
                                style={{
                                    background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)`,
                                    borderLeft: `4px solid ${category.color}`
                                }}
                            >
                                <h2 style={{
                                    color: category.color,
                                    marginBottom: 'var(--space-lg)',
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)'
                                }}>
                                    <span style={{ fontSize: '2.5rem' }}>{category.icon}</span>
                                    {category.category}
                                </h2>

                                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                    {category.tips.map((tip, tipIndex) => (
                                        <motion.div
                                            key={tipIndex}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: catIndex * 0.15 + tipIndex * 0.05 }}
                                            whileHover={{ x: 8 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 'var(--space-md)',
                                                padding: 'var(--space-md)',
                                                background: 'rgba(255, 255, 255, 0.5)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{
                                                minWidth: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: category.color,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '800',
                                                fontSize: 'var(--font-size-sm)',
                                                marginTop: '2px'
                                            }}>
                                                {tipIndex + 1}
                                            </div>
                                            <p style={{
                                                color: 'var(--gray-700)',
                                                fontWeight: '500',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>
                                                {tip}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Important Reminder */}
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
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🛡️</div>
                        <h3 style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }}>Remember</h3>
                        <p style={{
                            color: 'var(--gray-700)',
                            fontWeight: '600',
                            fontSize: 'var(--font-size-lg)',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: 1.8
                        }}>
                            Your safety is the top priority. These tips are guidelines, but always trust your instincts.
                            If something doesn't feel right, remove yourself from the situation immediately.
                            Don't hesitate to use the SOS feature or call for help when needed.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default SafetyTips;
