import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { infrastructureAPI } from '../../utils/api';

const COLORS = {
    PENDING: '#F59E0B',
    ACCEPTED: '#3B82F6',
    COMPLETED: '#10B981',
    primary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

const InfrastructureDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const statsData = await infrastructureAPI.getDashboardStats();
            setStats(statsData.stats);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => COLORS[status] || COLORS.info;

    if (loading) {
        return (
            <div className="page-wrapper">
                <nav className="navbar">
                    <div className="navbar-container container">
                        <div className="navbar-brand">SafeSpace Infrastructure</div>
                        <ul className="navbar-nav">
                            <li><Link to="/infrastructure" className="nav-link active">Dashboard</Link></li>
                            <li><Link to="/infrastructure/issues-map" className="nav-link">Issues Map</Link></li>
                            <li><Link to="/infrastructure/chat" className="nav-link">Team Chat</Link></li>
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
                    <div className="navbar-brand">SafeSpace Infrastructure</div>
                    <ul className="navbar-nav">
                        <li><Link to="/infrastructure" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/infrastructure/issues-map" className="nav-link">Issues Map</Link></li>
                        <li><Link to="/infrastructure/chat" className="nav-link">Team Chat</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        🏗️ Infrastructure Control Center
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                        Track, manage, and complete infrastructure maintenance tasks
                    </p>
                </motion.div>

                {/* Key Metrics Cards */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* Total Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                            borderLeft: '4px solid var(--primary)'
                        }}
                    >
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>📋</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {stats?.overall.total || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Total Issues
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                +{stats?.recent.new_issues || 0} new this week
                            </div>
                        </div>
                    </motion.div>

                    {/* Pending Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
                            borderLeft: '4px solid var(--warning)'
                        }}
                    >
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>⏳</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>
                                    {stats?.overall.pending || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Pending
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <Link to="/infrastructure/issues-map" className="btn btn-sm btn-warning" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                                Accept Tasks
                            </Link>
                        </div>
                    </motion.div>

                    {/* In Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                            borderLeft: '4px solid var(--info)'
                        }}
                    >
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>🔧</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--info)' }}>
                                    {stats?.overall.accepted || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    In Progress
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                My assigned: {stats?.my_work.accepted || 0}
                            </div>
                        </div>
                    </motion.div>

                    {/* Completed Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            borderLeft: '4px solid var(--success)'
                        }}
                    >
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>✅</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>
                                    {stats?.overall.completed || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Completed
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                                +{stats?.recent.completed || 0} this week
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* Completion Rate Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>📈 Completion Rate</h3>
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                            <div style={{ 
                                fontSize: '5rem', 
                                fontWeight: 'bold', 
                                background: 'linear-gradient(135deg, var(--success) 0%, var(--info) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: 'var(--space-md)'
                            }}>
                                {stats?.overall.completion_rate || 0}%
                            </div>
                            <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--gray-600)' }}>
                                of all issues resolved
                            </div>
                            <div style={{ 
                                marginTop: 'var(--space-lg)',
                                padding: 'var(--space-md)',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: 'var(--radius-lg)'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                    <strong>Your contribution:</strong> {stats?.my_work.completed || 0} tasks completed
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* My Work Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>👷 My Workload</h3>
                        <div style={{ padding: 'var(--space-md)' }}>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Total Assigned</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--primary)' }}>
                                        {stats?.my_work.total || 0}
                                    </strong>
                                </div>
                                <div style={{ 
                                    height: '8px', 
                                    background: 'rgba(0,0,0,0.1)', 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(stats?.my_work.total || 0) > 0 ? 100 : 0}%`,
                                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--info) 100%)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>In Progress</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--info)' }}>
                                        {stats?.my_work.accepted || 0}
                                    </strong>
                                </div>
                                <div style={{ 
                                    height: '8px', 
                                    background: 'rgba(0,0,0,0.1)', 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(stats?.my_work.total || 0) > 0 ? ((stats?.my_work.accepted || 0) / stats.my_work.total * 100) : 0}%`,
                                        background: 'linear-gradient(90deg, var(--info) 0%, var(--primary) 100%)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Completed</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--success)' }}>
                                        {stats?.my_work.completed || 0}
                                    </strong>
                                </div>
                                <div style={{ 
                                    height: '8px', 
                                    background: 'rgba(0,0,0,0.1)', 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(stats?.my_work.total || 0) > 0 ? ((stats?.my_work.completed || 0) / stats.my_work.total * 100) : 0}%`,
                                        background: 'linear-gradient(90deg, var(--success) 0%, var(--info) 100%)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* Completion Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            📊 Completion Trend (Last 7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.trends.daily_completions || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: 'rgba(255,255,255,0.95)', 
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }} 
                                />
                                <Legend />
                                <Bar 
                                    dataKey="completed" 
                                    fill={COLORS.success} 
                                    radius={[8, 8, 0, 0]}
                                    name="Completed Issues"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Status Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            🎯 Issue Status Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats?.trends.status_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {(stats?.trends.status_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        background: 'rgba(255,255,255,0.95)', 
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '8px'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="glass-card"
                >
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>⚡ Quick Actions</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                        <Link to="/infrastructure/issues-map" className="glass-card-dark" style={{ 
                            padding: 'var(--space-lg)', 
                            textDecoration: 'none',
                            borderLeft: '4px solid var(--warning)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🗺️</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>View Issues Map</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                See all reported issues on interactive map
                            </p>
                        </Link>

                        <Link to="/infrastructure/issues-map" className="glass-card-dark" style={{ 
                            padding: 'var(--space-lg)', 
                            textDecoration: 'none',
                            borderLeft: '4px solid var(--info)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>✅</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Accept New Tasks</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                {stats?.overall.pending || 0} tasks waiting to be assigned
                            </p>
                        </Link>

                        <Link to="/infrastructure/chat" className="glass-card-dark" style={{ 
                            padding: 'var(--space-lg)', 
                            textDecoration: 'none',
                            borderLeft: '4px solid var(--success)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>💬</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Team Chat</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                Communicate with your team members
                            </p>
                        </Link>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default InfrastructureDashboard;
