import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI } from '../../utils/api';

const COLORS = {
    ACTIVE: '#EF4444',
    RESOLVED: '#10B981',
    CANCELLED: '#6B7280',
    primary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

const EmergencyDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [sosEvents, setSosEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 15000); // More frequent for emergencies
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsData, sosData] = await Promise.all([
                emergencyAPI.getDashboardStats(),
                emergencyAPI.getSOSEvents('ACTIVE')
            ]);
            setStats(statsData.stats);
            setSosEvents(sosData.sos_events || []);
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
                        <div className="navbar-brand">SafeSpace Emergency</div>
                        <ul className="navbar-nav">
                            <li><Link to="/emergency" className="nav-link active">Dashboard</Link></li>
                            <li><Link to="/emergency/chat" className="nav-link">Chat</Link></li>
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
                    <div className="navbar-brand">SafeSpace Emergency</div>
                    <ul className="navbar-nav">
                        <li><Link to="/emergency" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/emergency/chat" className="nav-link">Chat</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        🚨 Emergency Response Center
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                        Real-time emergency monitoring and coordination
                    </p>
                </motion.div>

                {/* Active Alerts Banner */}
                {stats?.sos.active > 0 && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card"
                        style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', borderLeft: '4px solid var(--danger)', animation: 'pulse 2s ease-in-out infinite' }}>
                        <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>🚨 {stats.sos.active} ACTIVE SOS ALERTS</h3>
                        <p style={{ marginBottom: 0, fontWeight: '600' }}>
                            Immediate response required! {stats.sos.active_24h} new alerts in last 24 hours.
                        </p>
                    </motion.div>
                )}

                {/* Key Metrics */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', borderLeft: '4px solid var(--danger)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>🚨</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.sos.active || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Active SOS</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)' }}>+{stats?.sos.active_24h || 0} in last 24h</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '4px solid var(--success)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>✅</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>{stats?.sos.resolved || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Resolved</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>Rate: {stats?.response.rate || 0}%</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)', borderLeft: '4px solid var(--warning)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>🚩</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>{stats?.zones.total || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Risk Zones</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)' }}>Critical: {stats?.zones.critical || 0}</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', borderLeft: '4px solid var(--info)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>👩</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--info)' }}>{stats?.users.total_women || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Protected</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Total registered</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)', borderLeft: '4px solid var(--primary)' }}>
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>📊</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--primary)' }}>{stats?.sos.recent_24h || 0}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Last 24h</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Total: {stats?.sos.total || 0}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>📈 SOS Activity (Last 12 Hours)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.trends.hourly_sos || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="hour" stroke="#6B7280" style={{ fontSize: '11px' }} />
                                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="count" fill={COLORS.danger} radius={[8, 8, 0, 0]} name="SOS Alerts" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>🎯 SOS Status Distribution</h3>
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

                {/* Active SOS Events */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <div className="flex-between mb-lg">
                        <h3 style={{ marginBottom: 0 }}>🚨 Active SOS Events</h3>
                        <Link to="/emergency/chat" className="btn btn-danger btn-sm">Emergency Chat</Link>
                    </div>
                    
                    {sosEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--gray-500)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>✅</div>
                            <h3>No Active Emergencies</h3>
                            <p>All systems clear. Standing by for any alerts.</p>
                        </div>
                    ) : (
                        <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                            {sosEvents.map((sos, index) => (
                                <motion.div key={sos.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + index * 0.05 }}
                                    className="glass-card-dark" style={{ borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', animation: 'pulse 2s ease-in-out infinite' }}>
                                    <div className="flex-between mb-md">
                                        <h4 style={{ marginBottom: 0 }}>👤 {sos.woman_name}</h4>
                                        <span className="badge badge-danger">🚨 ACTIVE</span>
                                    </div>
                                    <p style={{ fontSize: 'var(--font-size-sm)' }}><strong>📞 Phone:</strong> {sos.woman_phone}</p>
                                    <p style={{ fontSize: 'var(--font-size-sm)' }}><strong>🔋 Battery:</strong> {sos.battery_percentage}%</p>
                                    <p style={{ fontSize: 'var(--font-size-sm)' }}><strong>🕐 Time:</strong> {new Date(sos.timestamp).toLocaleString()}</p>
                                    <button className="btn btn-danger btn-sm" style={{ marginTop: 'var(--space-sm)', width: '100%' }}>
                                        View Details & Respond
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Response Metrics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>📊 Response Performance</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--success) 0%, var(--info) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--space-md)' }}>
                                {stats?.response.rate || 0}%
                            </div>
                            <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)', fontWeight: '600' }}>Resolution Rate</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-sm)' }}>
                                {stats?.response.total_resolved || 0} cases successfully resolved
                            </div>
                        </div>

                        <div style={{ padding: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Quick Stats</h4>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div className="flex-between mb-sm">
                                    <span>Total Cases</span>
                                    <strong>{stats?.sos.total || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '100%', background: 'var(--primary)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div className="flex-between mb-sm">
                                    <span>Resolved</span>
                                    <strong style={{ color: 'var(--success)' }}>{stats?.sos.resolved || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.sos.resolved / stats?.sos.total * 100) || 0}%`, background: 'var(--success)' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex-between mb-sm">
                                    <span>Active</span>
                                    <strong style={{ color: 'var(--danger)' }}>{stats?.sos.active || 0}</strong>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(stats?.sos.active / stats?.sos.total * 100) || 0}%`, background: 'var(--danger)' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default EmergencyDashboard;
