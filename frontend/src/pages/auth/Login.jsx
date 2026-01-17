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

            // Redirect based on role
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
        <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="page-content flex-center" style={{ width: '100%', padding: 'var(--space-xl)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="glass-card"
                    style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-2xl)' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ 
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent',
                                fontSize: 'var(--font-size-4xl)',
                                fontWeight: 'bold',
                                marginBottom: 'var(--space-sm)'
                            }}
                        >
                            🛡️ SafeSpace
                        </motion.h1>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
                            Welcome back! Sign in to continue.
                        </p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ 
                                padding: 'var(--space-md)', 
                                background: 'linear-gradient(135deg, var(--danger) 0%, var(--danger-light) 100%)', 
                                color: 'white', 
                                borderRadius: 'var(--radius-lg)', 
                                marginBottom: 'var(--space-lg)',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                📧 Email Address
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                🔒 Password
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading} 
                            style={{ 
                                width: '100%', 
                                padding: 'var(--space-lg)',
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: '600',
                                marginTop: 'var(--space-md)'
                            }}
                        >
                            {loading ? '⏳ Logging in...' : '🚀 Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-md)' }}>
                            Don't have an account?
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <Link to="/register/woman" className="btn btn-outline" style={{ width: '100%' }}>
                                👩 Register as Woman
                            </Link>
                            <Link to="/register/community" className="btn btn-secondary" style={{ width: '100%' }}>
                                🏢 Community Registration
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
