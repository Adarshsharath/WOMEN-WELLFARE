import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { womenAPI } from '../../utils/api';

const CALLERS = [
    { id: 'mom', name: 'Mom', icon: '👩', color: '#FF69B4' },
    { id: 'dad', name: 'Dad', icon: '👨', color: '#4169E1' },
    { id: 'friend', name: 'Friend', icon: '👱‍♀️', color: '#32CD32' },
    { id: 'brother', name: 'Brother', icon: '👦', color: '#FFA500' }
];

const FakeCall = () => {
    const [status, setStatus] = useState('IDLE'); // IDLE, SCHEDULED, RINGING, IN_CALL
    const [selectedCaller, setSelectedCaller] = useState(CALLERS[0]);
    const [seconds, setSeconds] = useState(5);
    const [countdown, setCountdown] = useState(0);
    const [callTimer, setCallTimer] = useState(0);
    const navigate = useNavigate();
    const API_BASE = 'http://localhost:5000';

    // Refs for audio and timers
    const timerRef = useRef(null);
    const callDurationRef = useRef(null);
    const ringtoneRef = useRef(null);
    const recordingRef = useRef(null);

    // Audio paths - the backend serves /audio directly
    const RINGTONE_URL = `${API_BASE}/audio/ringtone/ringtone.mp3`;
    const GET_RECORDING_URL = (id) => `${API_BASE}/audio/recordings/${id === 'brother' ? 'brother' : 'brother'}.mp3`;

    // Handle Countdown
    useEffect(() => {
        if (status === 'SCHEDULED' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'SCHEDULED' && countdown === 0) {
            setStatus('RINGING');
        }
    }, [status, countdown]);

    // Handle Ringtone
    useEffect(() => {
        if (status === 'RINGING') {
            ringtoneRef.current = new Audio(RINGTONE_URL);
            ringtoneRef.current.loop = true;
            ringtoneRef.current.play().catch(e => console.error("Ringtone error:", e));
        } else {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current = null;
            }
        }

        return () => {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current = null;
            }
        };
    }, [status]);

    // Handle Call Timer and Recording
    useEffect(() => {
        if (status === 'IN_CALL') {
            // Start recording playback
            const url = GET_RECORDING_URL(selectedCaller.id);
            recordingRef.current = new Audio(url);
            recordingRef.current.play().catch(e => console.error("Recording error:", e));

            // Start timer
            callDurationRef.current = setInterval(() => {
                setCallTimer(prev => prev + 1);
            }, 1000);

            return () => {
                clearInterval(callDurationRef.current);
                if (recordingRef.current) {
                    recordingRef.current.pause();
                    recordingRef.current = null;
                }
            };
        }
    }, [status, selectedCaller]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartCall = async (instant = false) => {
        if (instant) {
            setStatus('RINGING');
        } else {
            setCountdown(seconds);
            setStatus('SCHEDULED');
        }

        try {
            await womenAPI.logFakeCall();
        } catch (error) {
            console.error('Failed to log fake call:', error);
        }
    };

    const handleAccept = () => {
        setStatus('IN_CALL');
        setCallTimer(0);
    };

    const handleEndCall = () => {
        if (callDurationRef.current) clearInterval(callDurationRef.current);
        setStatus('IDLE');
        setCallTimer(0);
        navigate('/woman');
    };

    if (status === 'RINGING') {
        return (
            <div className="page-wrapper" style={{ background: '#000', color: 'white' }}>
                <div className="page-content flex-center" style={{ height: '100vh', padding: 0 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                        style={{ width: '100%', maxWidth: '400px' }}
                    >
                        <div style={{ marginTop: '20%' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                margin: '0 auto var(--space-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '4rem'
                            }}>
                                {selectedCaller.icon}
                            </div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>{selectedCaller.name}</h1>
                            <p style={{ color: 'var(--gray-400)', fontSize: '1.2rem' }}>Mobile</p>
                        </div>

                        <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 2rem' }}>
                            <div className="text-center">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleEndCall}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'var(--danger)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '2rem',
                                        marginBottom: 'var(--space-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </motion.button>
                                <p style={{ fontSize: 'var(--font-size-sm)' }}>Decline</p>
                            </div>
                            <div className="text-center">
                                <motion.button
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleAccept}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'var(--success)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '2rem',
                                        marginBottom: 'var(--space-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📞
                                </motion.button>
                                <p style={{ fontSize: 'var(--font-size-sm)' }}>Accept</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (status === 'IN_CALL') {
        return (
            <div className="page-wrapper" style={{ background: '#1a1a1a', color: 'white' }}>
                <div className="page-content flex-center" style={{ height: '100vh', padding: 0 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                        style={{ width: '100%', maxWidth: '400px' }}
                    >
                        <div style={{ marginTop: '20%' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '50%',
                                margin: '0 auto var(--space-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                {selectedCaller.icon}
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>{selectedCaller.name}</h2>
                            <p style={{ color: 'var(--success)', fontSize: '1.2rem', fontWeight: '500' }}>{formatTime(callTimer)}</p>
                        </div>

                        <div className="grid grid-3" style={{ marginTop: 'var(--space-2xl)', padding: '0 2rem', gap: 'var(--space-xl)' }}>
                            {['mute', 'keypad', 'speaker', 'add call', 'FaceTime', 'contacts'].map(btn => (
                                <div key={btn} className="text-center">
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--space-xs)',
                                        fontSize: '1.5rem',
                                        opacity: 0.7
                                    }}>
                                        {btn === 'mute' && '🎙️'}
                                        {btn === 'keypad' && '🔢'}
                                        {btn === 'speaker' && '🔊'}
                                        {btn === 'add call' && '➕'}
                                        {btn === 'FaceTime' && '📹'}
                                        {btn === 'contacts' && '👤'}
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>{btn}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleEndCall}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'var(--danger)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                📞
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <h1>Fake Call Settings</h1>
                    <button onClick={() => navigate('/woman')} className="btn btn-secondary">← Back</button>
                </div>

                <div className="grid grid-2" style={{ alignItems: 'start' }}>
                    <div className="glass-card">
                        <h3>1. Select Caller</h3>
                        <div className="grid grid-2" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                            {CALLERS.map(caller => (
                                <motion.div
                                    key={caller.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCaller(caller)}
                                    style={{
                                        padding: 'var(--space-lg)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: selectedCaller.id === caller.id ? `2px solid var(--primary)` : '2px solid transparent',
                                        background: selectedCaller.id === caller.id ? 'var(--gray-50)' : 'white',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>{caller.icon}</div>
                                    <div style={{ fontWeight: '600' }}>{caller.name}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3>2. Call Timing</h3>
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Delay (Seconds)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={seconds}
                                    onChange={(e) => setSeconds(Math.max(1, parseInt(e.target.value) || 0))}
                                    placeholder="Enter seconds..."
                                />
                                <small style={{ color: 'var(--gray-500)' }}>Call will ring after this many seconds</small>
                            </div>

                            <div className="flex" style={{ flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                                <button
                                    onClick={() => handleStartCall(false)}
                                    className="btn btn-primary btn-lg"
                                    disabled={status === 'SCHEDULED'}
                                >
                                    {status === 'SCHEDULED' ? `Ringing in ${countdown}s...` : 'Schedule Call'}
                                </button>
                                <button
                                    onClick={() => handleStartCall(true)}
                                    className="btn btn-secondary"
                                >
                                    Instant Call
                                </button>
                            </div>
                        </div>

                        {status === 'SCHEDULED' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    marginTop: 'var(--space-lg)',
                                    padding: 'var(--space-md)',
                                    background: 'var(--primary-light)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}
                            >
                                Calling {selectedCaller.name} in {countdown}s...
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    style={{ background: 'none', border: 'none', color: 'white', textDecoration: 'underline', marginLeft: 'var(--space-md)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FakeCall;
