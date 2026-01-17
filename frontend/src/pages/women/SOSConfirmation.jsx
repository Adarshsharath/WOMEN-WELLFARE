import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SOSConfirmation = () => {
    const [countdown, setCountdown] = useState(3);
    const [cancelled, setCancelled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (cancelled) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, navigate to SOS Active
            navigate('/woman/sos-active');
        }
    }, [countdown, cancelled, navigate]);

    const handleCancel = () => {
        setCancelled(true);
        navigate('/woman');
    };

    return (
        <div className="page-wrapper" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
            <div className="page-content flex-center" style={{ minHeight: '100vh' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card text-center"
                    style={{ 
                        maxWidth: '600px', 
                        padding: 'var(--space-3xl)',
                        background: 'rgba(255, 255, 255, 0.98)',
                        boxShadow: '0 20px 80px 0 rgba(220, 38, 38, 0.5)'
                    }}
                >
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        style={{ fontSize: '6rem', marginBottom: 'var(--space-md)' }}
                    >
                        🚨
                    </motion.div>
                    
                    <motion.h1 
                        animate={{ 
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                            duration: 1,
                            repeat: Infinity,
                        }}
                        style={{ 
                            fontSize: '8rem', 
                            color: 'var(--danger)', 
                            marginBottom: 'var(--space-md)',
                            fontWeight: '900',
                            textShadow: '0 4px 20px rgba(220, 38, 38, 0.5)'
                        }}
                    >
                        {countdown}
                    </motion.h1>
                    
                    <h2 style={{ 
                        fontSize: 'var(--font-size-2xl)', 
                        color: 'var(--danger)',
                        marginBottom: 'var(--space-sm)',
                        fontWeight: '700'
                    }}>
                        SOS Triggering in {countdown} {countdown === 1 ? 'second' : 'seconds'}
                    </h2>
                    
                    <p style={{ 
                        color: 'var(--gray-700)', 
                        marginTop: 'var(--space-md)',
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '500'
                    }}>
                        ⚠️ Emergency alerts will be sent to all your contacts
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="btn btn-lg"
                        style={{
                            marginTop: 'var(--space-2xl)',
                            background: 'linear-gradient(135deg, var(--gray-700) 0%, var(--gray-900) 100%)',
                            color: 'white',
                            width: '100%',
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: '800',
                            padding: 'var(--space-xl)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        ❌ CANCEL SOS
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default SOSConfirmation;
