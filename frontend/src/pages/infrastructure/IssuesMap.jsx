import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { infrastructureAPI } from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Red flag icon for issues
const redFlagIcon = L.divIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚩</div>`,
    className: 'custom-flag-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Green checkmark for completed
const completedIcon = L.divIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">✅</div>`,
    className: 'custom-completed-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const InfrastructureIssuesMap = () => {
    const [allIssues, setAllIssues] = useState([]);
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, ACCEPTED, COMPLETED

    useEffect(() => {
        loadIssues();
        const interval = setInterval(() => {
            loadIssues();
        }, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const loadIssues = async () => {
        try {
            const [allData, myData] = await Promise.all([
                infrastructureAPI.getAllIssues(),
                infrastructureAPI.getMyIssues()
            ]);
            setAllIssues(allData.issues || []);
            setMyIssues(myData.issues || []);
        } catch (error) {
            console.error('Failed to load issues:', error);
        }
    };

    const handleAccept = async (issueId) => {
        if (!window.confirm('Accept this issue? You will be responsible for fixing it.')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await infrastructureAPI.acceptIssue(issueId);
            setSuccess('Issue accepted successfully!');
            loadIssues();
        } catch (error) {
            setError(error.message || 'Failed to accept issue');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (issueId) => {
        if (!window.confirm('Mark this issue as completed? This will remove the red flag from the map.')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await infrastructureAPI.completeIssue(issueId);
            setSuccess('Issue marked as completed! Red flag removed from map.');
            loadIssues();
        } catch (error) {
            setError(error.message || 'Failed to complete issue');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'var(--success)';
            case 'ACCEPTED': return 'var(--info)';
            case 'PENDING': return 'var(--warning)';
            default: return 'var(--gray-500)';
        }
    };

    const getFilteredIssues = () => {
        if (filterStatus === 'ALL') return allIssues;
        return allIssues.filter(issue => issue.status === filterStatus);
    };

    const filteredIssues = getFilteredIssues();

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            🗺️ Infrastructure Issues Map
                        </h1>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-base)' }}>
                            View and manage infrastructure issues reported by police
                        </p>
                    </motion.div>
                    <Link to="/infrastructure" className="btn btn-secondary">← Back</Link>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ 
                            marginBottom: 'var(--space-lg)',
                            padding: 'var(--space-md)',
                            background: 'linear-gradient(135deg, var(--danger) 0%, var(--danger-light) 100%)',
                            color: 'white'
                        }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ 
                            marginBottom: 'var(--space-lg)',
                            padding: 'var(--space-md)',
                            background: 'linear-gradient(135deg, var(--success) 0%, var(--success-light) 100%)',
                            color: 'white'
                        }}
                    >
                        ✅ {success}
                    </motion.div>
                )}

                {/* Filter Buttons */}
                <div className="flex mb-lg" style={{ gap: 'var(--space-sm)' }}>
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        All Issues ({allIssues.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`btn ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-secondary'}`}
                    >
                        Pending ({allIssues.filter(i => i.status === 'PENDING').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('ACCEPTED')}
                        className={`btn ${filterStatus === 'ACCEPTED' ? 'btn-info' : 'btn-secondary'}`}
                    >
                        Accepted ({allIssues.filter(i => i.status === 'ACCEPTED').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={`btn ${filterStatus === 'COMPLETED' ? 'btn-success' : 'btn-secondary'}`}
                    >
                        Completed ({allIssues.filter(i => i.status === 'COMPLETED').length})
                    </button>
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', alignItems: 'start' }}>
                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ height: '700px', overflow: 'hidden' }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>
                            📍 Issues on Map
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                            🚩 Red flags = Pending/Accepted | ✅ Green = Completed
                        </p>
                        
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '600px', borderRadius: 'var(--radius-lg)' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* Show filtered issues */}
                            {filteredIssues.filter(issue => issue.latitude && issue.longitude).map((issue) => (
                                <Marker
                                    key={issue.id}
                                    position={[issue.latitude, issue.longitude]}
                                    icon={issue.status === 'COMPLETED' ? completedIcon : redFlagIcon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '280px' }}>
                                            <h4 style={{ 
                                                marginBottom: 'var(--space-sm)',
                                                color: getStatusColor(issue.status)
                                            }}>
                                                Issue #{issue.id}
                                            </h4>
                                            <span className={`badge ${
                                                issue.status === 'COMPLETED' ? 'badge-success' : 
                                                issue.status === 'ACCEPTED' ? 'badge-info' : 'badge-warning'
                                            }`} style={{ marginBottom: 'var(--space-sm)', display: 'inline-block' }}>
                                                {issue.status}
                                            </span>
                                            
                                            <div style={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                padding: 'var(--space-sm)',
                                                borderRadius: 'var(--radius-md)',
                                                marginBottom: 'var(--space-sm)',
                                                borderLeft: '4px solid var(--info)'
                                            }}>
                                                <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0, fontWeight: '600' }}>
                                                    📋 {issue.description}
                                                </p>
                                            </div>
                                            
                                            {issue.location && (
                                                <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                    <strong>📍 Location:</strong> {issue.location}
                                                </p>
                                            )}
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                                                👮 Reported by: {issue.reporter_name}
                                            </p>
                                            {issue.assigned_to_name && (
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                                                    👷 Assigned to: {issue.assigned_to_name}
                                                </p>
                                            )}
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-sm)' }}>
                                                🕐 {new Date(issue.timestamp).toLocaleString()}
                                            </p>
                                            
                                            {issue.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleAccept(issue.id)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ width: '100%' }}
                                                    disabled={loading}
                                                >
                                                    ✅ Accept Issue
                                                </button>
                                            )}
                                            
                                            {issue.status === 'ACCEPTED' && issue.assigned_to_id && (
                                                <button
                                                    onClick={() => handleComplete(issue.id)}
                                                    className="btn btn-sm btn-success"
                                                    style={{ width: '100%' }}
                                                    disabled={loading}
                                                >
                                                    ✔️ Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </motion.div>

                    {/* My Issues Section */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card"
                            style={{ marginBottom: 'var(--space-lg)' }}
                        >
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>
                                👷 My Assigned Issues ({myIssues.length})
                            </h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {myIssues.length === 0 ? (
                                    <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                                        No issues assigned to you yet
                                    </p>
                                ) : (
                                    myIssues.map((issue, index) => (
                                        <div
                                            key={index}
                                            className="glass-card-dark"
                                            style={{
                                                marginBottom: 'var(--space-sm)',
                                                padding: 'var(--space-md)',
                                                borderLeft: `4px solid ${getStatusColor(issue.status)}`
                                            }}
                                        >
                                            <div className="flex-between mb-sm">
                                                <strong style={{ color: getStatusColor(issue.status) }}>
                                                    Issue #{issue.id}
                                                </strong>
                                                <span className={`badge ${issue.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                {issue.description}
                                            </p>
                                            {issue.location && (
                                                <p style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-xs)' }}>
                                                    <strong>📍</strong> {issue.location}
                                                </p>
                                            )}
                                            <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                                                👮 Reported by: {issue.reporter_name}
                                            </small>
                                            
                                            {issue.status === 'ACCEPTED' && (
                                                <button
                                                    onClick={() => handleComplete(issue.id)}
                                                    className="btn btn-sm btn-success"
                                                    style={{ width: '100%' }}
                                                    disabled={loading}
                                                >
                                                    ✔️ Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Statistics */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                        >
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>📊 Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--warning)' }}>
                                        {allIssues.filter(i => i.status === 'PENDING').length}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--info)' }}>
                                        {allIssues.filter(i => i.status === 'ACCEPTED').length}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>In Progress</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>
                                        {allIssues.filter(i => i.status === 'COMPLETED').length}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Completed</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {myIssues.length}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>My Issues</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfrastructureIssuesMap;
