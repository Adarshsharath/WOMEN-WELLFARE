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
        <div className="page-wrapper">
            <div className="page-content flex-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card text-center"
                    style={{ maxWidth: '500px', padding: 'var(--space-2xl)' }}
                >
                    <h1 style={{ fontSize: '6rem', color: 'var(--danger)', marginBottom: 'var(--space-lg)' }}>
                        {countdown}
                    </h1>
                    <h2>SOS will be triggered in {countdown} seconds</h2>
                    <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-md)' }}>
                        Emergency alerts will be sent to all your contacts
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="btn btn-lg"
                        style={{
                            marginTop: 'var(--space-2xl)',
                            background: 'var(--gray-700)',
                            color: 'white',
                            width: '100%'
                        }}
                    >
                        CANCEL SOS
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default SOSConfirmation;
