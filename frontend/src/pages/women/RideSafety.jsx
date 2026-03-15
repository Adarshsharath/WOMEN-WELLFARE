import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { womenAPI } from '../../utils/api';

const RideSafety = () => {
    const [activeTimer, setActiveTimer] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [formData, setFormData] = useState({
        duration_minutes: 30,
        destination_name: '',
        ride_type: '',
        vehicle_number: '',
        driver_name: '',
        start_latitude: null,
        start_longitude: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        checkActiveTimer();
        const interval = setInterval(checkActiveTimer, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTimer && activeTimer.expires_at) {
            updateTimeRemaining(activeTimer);
            const timerInterval = setInterval(() => {
                updateTimeRemaining(activeTimer);
            }, 1000);
            
            // Periodic location updates every 30 seconds
            const locationInterval = setInterval(async () => {
                try {
                    const location = await getCurrentLocation();
                    await womenAPI.updateRideLocation(activeTimer.ride_id, location.latitude, location.longitude);
                } catch (err) {
                    console.error('Location update failed:', err);
                }
            }, 30000);

            return () => {
                clearInterval(timerInterval);
                clearInterval(locationInterval);
            };
        }
    }, [activeTimer]);

    const checkActiveTimer = async () => {
        try {
            const response = await womenAPI.getActiveRideTimer();
            if (response.timer) {
                setActiveTimer(response.timer);
                setTimeRemaining(null); // Reset before updating
                setTimeout(() => updateTimeRemaining(response.timer), 100);
                
                if (response.expired || response.timer.status === 'SOS_TRIGGERED') {
                    alert('🚨 SOS Sent! Your ride timer expired and help has been notified.');
                    navigate('/woman/sos-active');
                }
            } else {
                setActiveTimer(null);
                setTimeRemaining(null);
            }
        } catch (error) {
            console.error('Failed to check active timer:', error);
        }
    };

    const updateTimeRemaining = (timer) => {
        const timerToUse = timer || activeTimer;
        if (!timerToUse || !timerToUse.expires_at) return;
        
        const expiresAt = new Date(timerToUse.expires_at);
        const now = new Date();
        
        // JS Date.getTime() is always UTC epoch ms.
        const diff = expiresAt.getTime() - now.getTime();
        
        if (diff <= 0) {
            setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeRemaining({ hours, minutes, seconds, expired: false });
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    (error) => reject(error)
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    };

    const handleStartTimer = async (e) => {
        e.preventDefault();
        try {
            // Get current location
            const location = await getCurrentLocation();
            
            const data = {
                ...formData,
                latitude: location.latitude,
                longitude: location.longitude
            };

            const response = await womenAPI.startRideTimer(data);
            setActiveTimer(response.timer);
            setShowForm(false);
            setFormData({
                duration_minutes: 30,
                destination_name: '',
                ride_type: '',
                vehicle_number: '',
                driver_name: '',
                start_latitude: null,
                start_longitude: null
            });
        } catch (error) {
            console.error('Failed to start timer:', error);
            alert(error.message || 'Failed to start ride timer');
        }
    };

    const handleCheckIn = async () => {
        if (!activeTimer) return;
        
        if (confirm('Are you sure you want to check in? This will confirm you are safe.')) {
            try {
                await womenAPI.checkInRideTimer(activeTimer.ride_id);
                alert('✅ Checked in successfully! Stay safe!');
                setActiveTimer(null);
                setTimeRemaining(null);
            } catch (error) {
                console.error('Failed to check in:', error);
                alert('Failed to check in');
            }
        }
    };

    const handleCancelTimer = async () => {
        if (!activeTimer) return;
        
        if (confirm('Are you sure you want to cancel this timer?')) {
            try {
                await womenAPI.cancelRideTimer(activeTimer.ride_id);
                setActiveTimer(null);
                setTimeRemaining(null);
            } catch (error) {
                console.error('Failed to cancel timer:', error);
                alert('Failed to cancel timer');
            }
        }
    };

    const formatTime = (time) => {
        if (!time) return '00:00:00';
        const h = String(time.hours).padStart(2, '0');
        const m = String(time.minutes).padStart(2, '0');
        const s = String(time.seconds).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="page-wrapper">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">🛡️ Ride Safety</div>
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
                            🚗 Ride Safety Timer
                        </h1>
                        <p style={{ color: 'var(--gray-700)', fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>
                            Set a timer for your ride. If you don't check in, we'll automatically alert your emergency contacts.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTimer ? (
                            <motion.div
                                key="active-timer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <motion.div
                                    className="glass-card"
                                    animate={{
                                        boxShadow: timeRemaining?.minutes < 5 ? [
                                            '0 0 20px rgba(245, 158, 11, 0.5)',
                                            '0 0 40px rgba(245, 158, 11, 0.8)',
                                            '0 0 20px rgba(245, 158, 11, 0.5)',
                                        ] : undefined
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        background: timeRemaining?.minutes < 5 
                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
                                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                        borderLeft: `6px solid ${timeRemaining?.minutes < 5 ? 'var(--warning)' : 'var(--success)'}`,
                                        textAlign: 'center'
                                    }}
                                >
                                    <motion.div
                                        animate={{ rotate: timeRemaining?.minutes < 5 ? [0, 10, -10, 0] : 0 }}
                                        transition={{ duration: 0.5, repeat: timeRemaining?.minutes < 5 ? Infinity : 0 }}
                                        style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}
                                    >
                                        {timeRemaining?.minutes < 5 ? '⚠️' : '✅'}
                                    </motion.div>

                                    <h2 style={{ 
                                        color: (timeRemaining?.hours === 0 && timeRemaining?.minutes < 5) ? 'var(--warning)' : 'var(--success)', 
                                        marginBottom: 'var(--space-md)',
                                        fontWeight: '800'
                                    }}>
                                        {(timeRemaining?.hours === 0 && timeRemaining?.minutes < 5) ? '⏰ TIMER ENDING SOON!' : '🔒 Ride Timer Active'}
                                    </h2>

                                    <div style={{
                                        fontSize: '4rem',
                                        fontWeight: '900',
                                        color: (timeRemaining?.hours === 0 && timeRemaining?.minutes < 5) ? 'var(--warning)' : 'var(--primary)',
                                        marginBottom: 'var(--space-lg)',
                                        fontFamily: 'monospace',
                                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {formatTime(timeRemaining)}
                                    </div>

                                    {(timeRemaining?.hours === 0 && timeRemaining?.minutes < 5) && (
                                        <p style={{ 
                                            color: 'var(--warning)', 
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: '700',
                                            marginBottom: 'var(--space-lg)'
                                        }}>
                                            ⚠️ Please check in soon or SOS will be triggered automatically!
                                        </p>
                                    )}

                                    {activeTimer.destination_name && (
                                        <div className="glass-card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'left' }}>
                                            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--primary)' }}>📍 Ride Details</h4>
                                            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                                                {activeTimer.destination_name && (
                                                    <p style={{ margin: 0 }}><strong>Destination:</strong> {activeTimer.destination_name}</p>
                                                )}
                                                {activeTimer.ride_type && (
                                                    <p style={{ margin: 0 }}><strong>Ride Type:</strong> {activeTimer.ride_type}</p>
                                                )}
                                                {activeTimer.vehicle_number && (
                                                    <p style={{ margin: 0 }}><strong>Vehicle:</strong> {activeTimer.vehicle_number}</p>
                                                )}
                                                {activeTimer.driver_name && (
                                                    <p style={{ margin: 0 }}><strong>Driver:</strong> {activeTimer.driver_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCheckIn}
                                            className="btn btn-success btn-lg"
                                            style={{ flex: 1, fontSize: 'var(--font-size-xl)', fontWeight: '800' }}
                                        >
                                            ✅ I'm Safe - Check In
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCancelTimer}
                                            className="btn btn-secondary"
                                            style={{ fontSize: 'var(--font-size-base)' }}
                                        >
                                            ❌ Cancel
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-timer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {!showForm ? (
                                    <div>
                                        <motion.div 
                                            className="glass-card"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 153, 255, 0.04) 100%)',
                                                borderLeft: '4px solid var(--info)',
                                                marginBottom: 'var(--space-xl)'
                                            }}
                                        >
                                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--info)' }}>
                                                💡 How It Works
                                            </h3>
                                            <ol style={{ marginTop: 'var(--space-md)', paddingLeft: 'var(--space-lg)' }}>
                                                <li style={{ marginBottom: 'var(--space-sm)', color: 'var(--gray-700)', fontWeight: '500' }}>
                                                    Set a timer before boarding any ride (taxi, auto, bus, etc.)
                                                </li>
                                                <li style={{ marginBottom: 'var(--space-sm)', color: 'var(--gray-700)', fontWeight: '500' }}>
                                                    Add ride details like vehicle number and driver name (optional)
                                                </li>
                                                <li style={{ marginBottom: 'var(--space-sm)', color: 'var(--gray-700)', fontWeight: '500' }}>
                                                    Check in when you reach safely
                                                </li>
                                                <li style={{ color: 'var(--gray-700)', fontWeight: '500' }}>
                                                    If you don't check in, an automatic SOS alert is sent to all emergency contacts with ride details
                                                </li>
                                            </ol>
                                        </motion.div>

                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowForm(true)}
                                            className="btn btn-primary btn-lg"
                                            style={{ 
                                                width: '100%',
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: '800',
                                                padding: 'var(--space-xl)'
                                            }}
                                        >
                                            🚀 Start Ride Safety Timer
                                        </motion.button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card"
                                    >
                                        <h3 style={{ marginBottom: 'var(--space-xl)', color: 'var(--primary)' }}>⏱️ Setup Ride Timer</h3>
                                        
                                        <form onSubmit={handleStartTimer}>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                                    ⏰ Duration (minutes) *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={formData.duration_minutes}
                                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                                    min="1"
                                                    max="480"
                                                    required
                                                />
                                                <small style={{ color: 'var(--gray-600)', marginTop: 'var(--space-xs)' }}>
                                                    How long do you expect the ride to take?
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                                    📍 Destination
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.destination_name}
                                                    onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                                                    placeholder="Where are you going?"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                                    🚗 Ride Type
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={formData.ride_type}
                                                    onChange={(e) => setFormData({ ...formData, ride_type: e.target.value })}
                                                >
                                                    <option value="">Select ride type</option>
                                                    <option value="Taxi">Taxi</option>
                                                    <option value="Auto Rickshaw">Auto Rickshaw</option>
                                                    <option value="Uber/Ola">Uber/Ola</option>
                                                    <option value="Bus">Bus</option>
                                                    <option value="Private Car">Private Car</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                                    🚙 Vehicle Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.vehicle_number}
                                                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                                                    placeholder="e.g., MH12AB1234"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                                    👤 Driver Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.driver_name}
                                                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                                                    placeholder="Driver's name (if known)"
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                                    🚀 Start Timer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowForm(false)}
                                                    className="btn btn-secondary"
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default RideSafety;
