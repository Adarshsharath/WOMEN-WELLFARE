import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';

const COLORS = {
    WOMEN: '#EC4899',
    POLICE: '#7C3AED',
    INFRASTRUCTURE: '#3B82F6',
    EMERGENCY: '#EF4444',
    CYBERSECURITY: '#10B981',
    primary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

const AdminDashboard = () => {
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
            const statsData = await adminAPI.getDashboardStats();
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
                        <div className="navbar-brand">SafeSpace Admin</div>
                        <ul className="navbar-nav">
                            <li><Link to="/admin" className="nav-link active">Dashboard</Link></li>
                            <li><Link to="/admin/approvals" className="nav-link">Approvals</Link></li>
                            <li><Link to="/admin/flagged-users" className="nav-link">Flagged Users</Link></li>
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

    const systemHealth = stats?.health?.status === 'healthy';

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Admin</div>
                    <ul className="navbar-nav">
                        <li><Link to="/admin" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/admin/approvals" className="nav-link">Approvals</Link></li>
                        <li><Link to="/admin/flagged-users" className="nav-link">Flagged Users</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        👑 Admin Control Center
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                        System-wide monitoring and management
                    </p>
                </motion.div>

                {/* System Health Alert */}
                {!systemHealth && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            marginBottom: 'var(--space-xl)',
                            padding: 'var(--space-lg)',
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            borderLeft: '4px solid var(--danger)'
                        }}
                    >
                        <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>⚠️ Attention Required</h3>
                        <p style={{ marginBottom: 0 }}>
                            {stats?.health?.active_sos > 0 && `${stats.health.active_sos} active SOS alerts. `}
                            {stats?.health?.pending_flags > 0 && `${stats.health.pending_flags} users flagged for review. `}
                            {stats?.health?.pending_approvals > 0 && `${stats.health.pending_approvals} pending approvals.`}
                        </p>
                    </motion.div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>👥</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--primary)' }}>{stats?.users.total || 0}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Total Users</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)', borderLeft: '4px solid #EC4899' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>👩</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: '#EC4899' }}>{stats?.users.women || 0}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Women Users</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>⏳</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>{stats?.users.pending_approvals || 0}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pending Approvals</div>
                        <Link to="/admin/approvals" className="btn btn-sm btn-warning" style={{ marginTop: 'var(--space-sm)', width: '100%' }}>Review</Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', borderLeft: '4px solid var(--danger)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🚫</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.flags.pending || 0}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Flagged Users</div>
                        <Link to="/admin/flagged-users" className="btn btn-sm btn-danger" style={{ marginTop: 'var(--space-sm)', width: '100%' }}>Review</Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>✅</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: systemHealth ? 'var(--success)' : 'var(--danger)' }}>
                            {systemHealth ? 'Healthy' : 'Alert'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>System Status</div>
                    </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* User Distribution */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>👥 User Role Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats?.trends.role_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ role, count, percent }) => `${role}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {(stats?.trends.role_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.role] || COLORS.primary} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Community Members */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>🛡️ Community Members</h3>
                        <div style={{ padding: 'var(--space-md)' }}>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>👮 Police Officers</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: COLORS.POLICE }}>{stats?.users.police || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.users.police || 0) > 0 ? 100 : 0}%`, background: COLORS.POLICE, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>🏗️ Infrastructure</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: COLORS.INFRASTRUCTURE }}>{stats?.users.infrastructure || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.users.infrastructure || 0) > 0 ? 100 : 0}%`, background: COLORS.INFRASTRUCTURE, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>🚨 Emergency Team</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: COLORS.EMERGENCY }}>{stats?.users.emergency || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.users.emergency || 0) > 0 ? 100 : 0}%`, background: COLORS.EMERGENCY, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>🔒 Cybersecurity</span>
                                    <strong style={{ fontSize: 'var(--font-size-lg)', color: COLORS.CYBERSECURITY }}>{stats?.users.cybersecurity || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.users.cybersecurity || 0) > 0 ? 100 : 0}%`, background: COLORS.CYBERSECURITY, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* System Statistics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>📊 System-Wide Statistics</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🚨</div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.system.active_sos || 0}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Active SOS</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>Total: {stats?.system.total_sos || 0}</div>
                        </div>

                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🚩</div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning)' }}>{stats?.system.total_zones || 0}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Risk Zones</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>Active</div>
                        </div>

                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🔧</div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--info)' }}>{stats?.system.pending_issues || 0}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pending Issues</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>Total: {stats?.system.total_issues || 0}</div>
                        </div>

                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🚫</div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.users.suspended || 0}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Suspended Users</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>Flagged: {stats?.flags.total || 0}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>⚡ Quick Actions</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                        <Link to="/admin/approvals" className="glass-card-dark" style={{ padding: 'var(--space-lg)', textDecoration: 'none', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>✅</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Approve Members</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                {stats?.users.pending_approvals || 0} pending approvals
                            </p>
                        </Link>

                        <Link to="/admin/flagged-users" className="glass-card-dark" style={{ padding: 'var(--space-lg)', textDecoration: 'none', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🚫</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>Review Flagged Users</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                {stats?.flags.pending || 0} users need review
                            </p>
                        </Link>

                        <div className="glass-card-dark" style={{ padding: 'var(--space-lg)', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📊</div>
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>System Overview</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 0 }}>
                                All systems {systemHealth ? 'operational' : 'need attention'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
