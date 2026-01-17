import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { cybersecurityAPI } from '../../utils/api';

const COLORS = {
    PENDING: '#F59E0B',
    REVIEWED: '#10B981',
    primary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

const CybersecurityDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const statsData = await cybersecurityAPI.getDashboardStats();
            setStats(statsData.stats);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <nav className="navbar">
                    <div className="navbar-container container">
                        <div className="navbar-brand">SafeSpace Cybersecurity</div>
                        <ul className="navbar-nav">
                            <li><Link to="/cybersecurity" className="nav-link active">Dashboard</Link></li>
                            <li><Link to="/cybersecurity/monitoring" className="nav-link">Monitoring</Link></li>
                            <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                        </ul>
                    </div>
                </nav>
                <div className="page-content container" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <h2>Loading dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Cybersecurity</div>
                    <ul className="navbar-nav">
                        <li><Link to="/cybersecurity" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/cybersecurity/monitoring" className="nav-link">Monitoring</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        🔒 Cybersecurity Command Center
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                        Real-time monitoring and threat detection
                    </p>
                </motion.div>

                {/* Alert Banner */}
                {(stats?.alerts.active_sos > 0 || stats?.alerts.pending_flags > 0) && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card"
                        style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', borderLeft: '4px solid var(--danger)' }}>
                        <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>🚨 Active Alerts</h3>
                        <p style={{ marginBottom: 0 }}>
                            {stats.alerts.active_sos > 0 && `${stats.alerts.active_sos} active SOS alerts. `}
                            {stats.alerts.pending_flags > 0 && `${stats.alerts.pending_flags} users flagged for admin review.`}
                        </p>
                    </motion.div>
                )}

                {/* Key Metrics */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', borderLeft: '4px solid var(--info)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>👁️</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--info)' }}>{stats?.monitoring.active || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Active Monitoring</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Total monitored: {stats?.monitoring.total || 0}</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)', borderLeft: '4px solid var(--warning)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>⚠️</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>{stats?.flags.pending || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pending Review</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>Reviewed: {stats?.flags.reviewed || 0}</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', borderLeft: '4px solid var(--danger)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>🚫</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.monitoring.suspended || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Suspended</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Total flags: {stats?.flags.total || 0}</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '4px solid var(--success)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>📈</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>+{stats?.flags.recent || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>This Week</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Recent activity</div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>📊 Flagging Trend (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats?.trends.daily_flags || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="flags" stroke={COLORS.warning} strokeWidth={3} dot={{ fill: COLORS.warning, r: 5 }} name="Flags" />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>🎯 Flag Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats?.trends.status_distribution || []} cx="50%" cy="50%" labelLine={false}
                                    label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100} fill="#8884d8" dataKey="count">
                                    {(stats?.trends.status_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || COLORS.info} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* System Health */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>🛡️ Security Status</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--info)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <span>🔍</span> Monitoring Coverage
                            </h4>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--info)', marginBottom: 'var(--space-sm)' }}>
                                {((stats?.monitoring.active / stats?.monitoring.total * 100) || 0).toFixed(0)}%
                            </div>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                {stats?.monitoring.active} out of {stats?.monitoring.total} users under active monitoring
                            </p>
                        </div>

                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--success)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <span>✅</span> Response Rate
                            </h4>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)', marginBottom: 'var(--space-sm)' }}>
                                {((stats?.flags.reviewed / stats?.flags.total * 100) || 0).toFixed(0)}%
                            </div>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                {stats?.flags.reviewed} flags reviewed out of {stats?.flags.total} total
                            </p>
                        </div>

                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--danger)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <span>🚨</span> Active Threats
                            </h4>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>
                                {(stats?.alerts.active_sos || 0) + (stats?.alerts.pending_flags || 0)}
                            </div>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                Requires immediate attention
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>⚡ Quick Actions</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                        <Link to="/cybersecurity/monitoring" className="glass-card-dark" style={{ padding: 'var(--space-lg)', textDecoration: 'none', borderLeft: '4px solid var(--info)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🔍</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>View Monitoring</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                Review user activity patterns
                            </p>
                        </Link>

                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>⚠️</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Flag User</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                Report suspicious activity
                            </p>
                        </div>

                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📊</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Generate Report</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                Export security analytics
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CybersecurityDashboard;
