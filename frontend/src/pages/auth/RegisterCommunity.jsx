import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../utils/api';

const SECRET_CODES = {
    'POLICE': 'POL-AUTH$01',
    'INFRASTRUCTURE': 'INFRA-CTRL$02',
    'CYBERSECURITY': 'CYB-AUTH$03',
    'EMERGENCY': 'EMRG-CTRL$04'
};

const RegisterCommunity = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'POLICE',
        secret_code: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.registerCommunity(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-wrapper">
                <div className="page-content flex-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card text-center"
                        style={{ maxWidth: '500px' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>✓</div>
                        <h2>Registration Successful!</h2>
                        <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-md)' }}>
                            Your account is pending admin approval. You'll be able to login once approved.
                        </p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: 'var(--space-xl)' }}>
                            Go to Login
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="page-content flex-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ maxWidth: '500px', width: '100%' }}
                >
                    <h2 className="text-center">Community Registration</h2>
                    <p className="text-center" style={{ color: 'var(--gray-600)' }}>Register as Police, Infrastructure, Cybersecurity, or Emergency</p>

                    {error && (
                        <div style={{ padding: 'var(--space-md)', background: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-lg)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-xl)' }}>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                name="role"
                                className="form-select"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="POLICE">Police</option>
                                <option value="INFRASTRUCTURE">Infrastructure</option>
                                <option value="CYBERSECURITY">Cybersecurity</option>
                                <option value="EMERGENCY">Emergency Response</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Secret Code</label>
                            <input
                                type="text"
                                name="secret_code"
                                className="form-input"
                                value={formData.secret_code}
                                onChange={handleChange}
                                required
                                placeholder="Enter department secret code"
                            />
                            <small style={{ color: 'var(--gray-500)', display: 'block', marginTop: 'var(--space-xs)' }}>
                                Contact your department administrator for the secret code
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterCommunity;
