import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { policeAPI } from '../../utils/api';

const COLORS = {
    CRITICAL: '#DC2626',
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
    primary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

const PoliceDashboard = () => {
    const { logout } = useAuth();
    const [sosEvents, setSosEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const [sosData, statsData] = await Promise.all([
                policeAPI.getSOSFeed(),
                policeAPI.getDashboardStats()
            ]);
            setSosEvents(sosData.sos_events || []);
            setStats(statsData.stats);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel) => COLORS[riskLevel] || COLORS.info;

    if (loading) {
        return (
            <div className="page-wrapper">
                <nav className="navbar">
                    <div className="navbar-container container">
                        <div className="navbar-brand">SafeSpace Police</div>
                        <ul className="navbar-nav">
                            <li><Link to="/police" className="nav-link active">Dashboard</Link></li>
                            <li><Link to="/police/mark-zones" className="nav-link">Mark Zones</Link></li>
                            <li><Link to="/police/connect" className="nav-link">Connect</Link></li>
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
                    <div className="navbar-brand">SafeSpace Police</div>
                    <ul className="navbar-nav">
                        <li><Link to="/police" className="nav-link active">Dashboard</Link></li>
                        <li><Link to="/police/mark-zones" className="nav-link">Mark Zones</Link></li>
                        <li><Link to="/police/connect" className="nav-link">Connect</Link></li>
                        <li><button onClick={logout} className="btn btn-sm btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        🚔 Police Command Center
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xl)' }}>
                        Real-time monitoring and analytics dashboard
                    </p>
                </motion.div>

                {/* Key Metrics Cards */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* SOS Alerts Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            borderLeft: '4px solid var(--danger)'
                        }}
                    >
                        <div className="flex-between mb-md">
                            <div style={{ fontSize: '3rem' }}>🚨</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--danger)' }}>
                                    {stats?.sos.active || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Active SOS Alerts
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div className="flex-between">
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Total: {stats?.sos.total || 0}</span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                                    +{stats?.sos.recent || 0} this week
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* High Risk Zones Card */}
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
                            <div style={{ fontSize: '3rem' }}>🚩</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>
                                    {stats?.zones.active || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Active Risk Zones
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div className="flex-between">
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)' }}>
                                    Critical: {stats?.zones.critical || 0}
                                </span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)' }}>
                                    High: {stats?.zones.high || 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Infrastructure Issues Card */}
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
                                    {stats?.issues.pending || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Pending Issues
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div className="flex-between">
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>In Progress: {stats?.issues.accepted || 0}</span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>
                                    Done: {stats?.issues.completed || 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Resolved Cases Card */}
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
                                    {stats?.sos.resolved || 0}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Resolved SOS
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', textAlign: 'right' }}>
                                Total Cases: {stats?.sos.total || 0}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    {/* SOS Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            📊 SOS Alerts Trend (Last 7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats?.trends.daily_sos || []}>
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
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke={COLORS.danger} 
                                    strokeWidth={3}
                                    dot={{ fill: COLORS.danger, r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="SOS Alerts"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Risk Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card"
                    >
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            🎯 Risk Zones Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats?.trends.risk_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ level, count, percent }) => `${level}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {(stats?.trends.risk_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.level)} />
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

                {/* High Risk Areas Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card"
                    style={{ marginBottom: 'var(--space-2xl)' }}
                >
                    <div className="flex-between mb-lg">
                        <h3 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            🚩 High Risk Areas Alert
                        </h3>
                        <Link to="/police/mark-zones" className="btn btn-primary btn-sm">
                            View All on Map
                        </Link>
                    </div>
                    
                    {stats?.high_risk_areas && stats.high_risk_areas.length > 0 ? (
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                            {stats.high_risk_areas.map((zone, index) => (
                                <motion.div
                                    key={zone.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.05 }}
                                    className="glass-card-dark"
                                    style={{
                                        padding: 'var(--space-md)',
                                        borderLeft: `4px solid ${getRiskColor(zone.risk_level)}`,
                                        background: `linear-gradient(135deg, ${getRiskColor(zone.risk_level)}15 0%, transparent 100%)`
                                    }}
                                >
                                    <div className="flex-between mb-sm">
                                        <span className="badge" style={{ 
                                            background: getRiskColor(zone.risk_level),
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {zone.risk_level}
                                        </span>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                            Zone #{zone.id}
                                        </span>
                                    </div>
                                    <p style={{ 
                                        fontSize: 'var(--font-size-sm)', 
                                        marginBottom: 'var(--space-xs)',
                                        fontWeight: '600',
                                        color: getRiskColor(zone.risk_level)
                                    }}>
                                        ⚠️ {zone.reason}
                                    </p>
                                    {zone.description && (
                                        <p style={{ 
                                            fontSize: 'var(--font-size-xs)', 
                                            color: 'var(--gray-600)',
                                            marginBottom: 'var(--space-xs)'
                                        }}>
                                            {zone.description}
                                        </p>
                                    )}
                                    <div style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--gray-500)',
                                        borderTop: '1px solid rgba(0,0,0,0.1)',
                                        paddingTop: 'var(--space-xs)',
                                        marginTop: 'var(--space-xs)'
                                    }}>
                                        <div>👮 {zone.police_name}</div>
                                        <div>📅 {new Date(zone.timestamp).toLocaleDateString()}</div>
                                        <div>📍 {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--gray-500)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>✅</div>
                            <p>No high risk areas currently flagged</p>
                        </div>
                    )}
                </motion.div>

                {/* Active SOS Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card"
                >
                    <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        🚨 Active SOS Events
                    </h3>
                    
                    {sosEvents.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--gray-500)' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>✅</div>
                            <h3>No Active SOS Events</h3>
                            <p style={{ fontSize: 'var(--font-size-base)' }}>
                                All clear! Real-time alerts will appear here when triggered.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                            {sosEvents.filter(sos => sos.status === 'ACTIVE').map((sos, index) => (
                                <motion.div
                                    key={sos.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + index * 0.05 }}
                                    className="glass-card-dark"
                                    style={{
                                        borderLeft: '4px solid var(--danger)',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                    }}
                                >
                                    <div className="flex-between mb-md">
                                        <h4 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            👤 {sos.woman_name}
                                        </h4>
                                        <span className="badge badge-danger" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                                            🚨 ACTIVE
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <strong>📞 Phone:</strong> {sos.woman_phone}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <strong>🔋 Battery:</strong> {sos.battery_percentage}%
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <strong>🕐 Time:</strong> {new Date(sos.timestamp).toLocaleString()}
                                    </p>

                                    <Link 
                                        to={`/police/sos/${sos.id}`} 
                                        className="btn btn-danger btn-sm"
                                        style={{ marginTop: 'var(--space-sm)', width: '100%' }}
                                    >
                                        View Details & Respond
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PoliceDashboard;
