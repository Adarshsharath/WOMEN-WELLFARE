import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { cybersecurityAPI } from '../../utils/api';

const CybersecurityMonitoring = () => {
    const { logout } = useAuth();
    const [monitoring, setMonitoring] = useState([]);

    useEffect(() => {
        loadMonitoring();
    }, []);

    const loadMonitoring = async () => {
        try {
            const data = await cybersecurityAPI.getMonitoring();
            setMonitoring(data.monitoring || []);
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
        }
    };

    const handleFlagUser = async (userId, womanName) => {
        const reason = prompt(`Enter reason for flagging ${womanName}:`);
        if (!reason) return;

        try {
            await cybersecurityAPI.flagUser({ user_id: userId, reason });
            alert('User flagged for admin review');
            loadMonitoring();
        } catch (error) {
            console.error('Failed to flag user:', error);
            alert(error.message || 'Failed to flag user');
        }
    };

    const isAbnormal = (data) => {
        return data.sos_count > 10 || data.fake_call_count > 20;
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">SafeSpace Cybersecurity</div>
                    <button onClick={logout} className="btn btn-sm btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="page-content container">
                <h1>Abuse Monitoring</h1>
                <p style={{ color: 'var(--gray-600)' }}>Monitor SOS and fake call usage patterns</p>

                <div style={{ marginTop: 'var(--space-xl)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 var(--space-sm)' }}>
                        <thead>
                            <tr style={{ background: 'var(--gray-100)', textAlign: 'left' }}>
                                <th style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>Name</th>
                                <th style={{ padding: 'var(--space-md)' }}>Phone</th>
                                <th style={{ padding: 'var(--space-md)' }}>SOS Count</th>
                                <th style={{ padding: 'var(--space-md)' }}>Fake Call Count</th>
                                <th style={{ padding: 'var(--space-md)' }}>Last Updated</th>
                                <th style={{ padding: 'var(--space-md)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monitoring.map((data, index) => (
                                <motion.tr
                                    key={data.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        background: isAbnormal(data) ? 'rgba(220, 38, 38, 0.1)' : 'var(--white)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <td style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                                        <strong>{data.woman_name}</strong>
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>{data.woman_phone}</td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <span className={`badge ${data.sos_count > 10 ? 'badge-danger' : 'badge-gray'}`}>
                                            {data.sos_count}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <span className={`badge ${data.fake_call_count > 20 ? 'badge-warning' : 'badge-gray'}`}>
                                            {data.fake_call_count}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        {new Date(data.last_updated).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                                        {!data.is_flagged && (
                                            <button
                                                onClick={() => handleFlagUser(data.woman_id, data.woman_name)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Flag User
                                            </button>
                                        )}
                                        {data.is_flagged && (
                                            <span className="badge badge-danger">Flagged</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {monitoring.length === 0 && (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)', marginTop: 'var(--space-xl)' }}>
                        <h3>No monitoring data available</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CybersecurityMonitoring;
