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
        <div className="page-wrapper">
            <div className="page-content flex-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card"
                    style={{ maxWidth: '450px', width: '100%' }}
                >
                    <h1 className="text-center" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SafeSpace
                    </h1>
                    <p className="text-center" style={{ color: 'var(--gray-600)' }}>Welcome back. Please login to your account.</p>

                    {error && (
                        <div style={{ padding: 'var(--space-md)', background: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-lg)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-xl)' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                        <p>Don't have an account?</p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <Link to="/register/woman" className="btn btn-outline" style={{ flex: 1 }}>Register as Woman</Link>
                            <Link to="/register/community" className="btn btn-outline" style={{ flex: 1 }}>Community Registration</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
