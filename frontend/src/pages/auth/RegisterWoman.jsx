import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const RegisterWoman = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...data } = formData;
            const response = await authAPI.registerWoman(data);
            login(response.user, response.token);
            navigate('/woman');
        } catch (err) {
            setError(err.message || 'Registration failed');
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
                    style={{ maxWidth: '520px', width: '100%', padding: 'var(--space-2xl)' }}
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
                            👩 Register as Woman
                        </motion.h1>
                        <p style={{ color: 'var(--gray-700)', fontSize: 'var(--font-size-base)', fontWeight: '500' }}>
                            Create your SafeSpace account
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
                                👤 Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                📧 Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                📱 Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                🔒 Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                🔐 Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
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
                            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-700)', fontWeight: '500' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Login here</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterWoman;
