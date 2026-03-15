import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            login(response.user, response.token);

            const roleRoutes = {
                'WOMAN': '/woman',
                'POLICE': '/police',
                'INFRASTRUCTURE': '/infrastructure',
                'CYBERSECURITY': '/cybersecurity',
                'EMERGENCY': '/emergency',
                'ADMIN': '/admin'
            };
            navigate(roleRoutes[response.user.role] || '/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url("/cover.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: 'var(--space-xl)'
        }}>
            <div className="container" style={{ maxWidth: '1200px', width: '100%', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                    {/* Perfectly centered container */}
                    <div style={{ maxWidth: '480px', width: '100%' }}>

                        {/* Branding text moved above or subtle */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}
                        >
                            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '800', marginBottom: 'var(--space-xs)', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                HerAssist
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', fontWeight: '500' }}>Your Shield, Your Voice</p>
                        </motion.div>

                        {/* 1. PRIMARY: WOMEN LOGIN */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card"
                            style={{
                                padding: 'var(--space-2xl)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255, 255, 255, 0.85)', // More opaque for readability
                                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                                borderRadius: 'var(--radius-xl)'
                            }}
                        >
                            <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                                <h2 style={{ color: 'var(--gray-900)', fontSize: '1.8rem', fontWeight: '700', marginBottom: 'var(--space-xs)' }}>Women Login</h2>
                                <p style={{ color: 'var(--gray-600)', fontWeight: '500' }}>Access your safety dashboard</p>
                            </div>

                            {error && (
                                <div style={{
                                    padding: 'var(--space-md)',
                                    background: '#fee2e2',
                                    border: '1px solid #ef4444',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#b91c1c',
                                    marginBottom: 'var(--space-lg)',
                                    fontSize: '0.9rem'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '5px', color: '#4a4a4a' }}>Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        style={{ background: 'white', color: '#1a1a1a', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '5px', color: '#4a4a4a' }}>Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={{ background: 'white', color: '#1a1a1a', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: 'var(--space-md)', background: 'var(--primary)', color: 'white' }}
                                >
                                    {loading ? '⏳ Processing...' : 'Login'}
                                </button>
                            </form>

                            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 'var(--space-lg)' }}>
                                <p style={{ color: '#666', marginBottom: 'var(--space-sm)', fontSize: '0.85rem' }}>New to HerAssist?</p>
                                <Link to="/register/woman" className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: '600' }}>
                                    Create New Account
                                </Link>
                            </div>
                        </motion.div>

                        {/* 2. SECONDARY: COMMUNITY */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                            style={{
                                padding: 'var(--space-lg)',
                                background: 'rgba(31, 41, 55, 0.8)', // Darker for contrast
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 'var(--space-md)',
                                marginTop: 'var(--space-xl)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div style={{ color: 'white' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>🏢 Community Access</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Police & Support Teams</p>
                            </div>
                            <Link to="/register/community" className="btn btn-secondary btn-sm" style={{ background: 'white', color: '#1f2937' }}>
                                Register / Login
                            </Link>
                        </motion.div>

                        {/* 3. TERTIARY: ADMIN */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}
                        >
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                Admin
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        textDecoration: 'underline',
                                        marginLeft: 'var(--space-xs)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Admin Portal
                                </button>
                            </p>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
