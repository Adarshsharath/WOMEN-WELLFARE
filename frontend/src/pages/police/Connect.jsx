import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { policeAPI } from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Red flag icon for pending issues
const redFlagIcon = L.divIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚩</div>`,
    className: 'custom-flag-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const PoliceConnect = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [issues, setIssues] = useState([]);
    const [allIssues, setAllIssues] = useState([]);
    const [newIssue, setNewIssue] = useState({ description: '', location: '', latitude: '', longitude: '' });
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'issues'
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    
    // Map state
    const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showIssueForm, setShowIssueForm] = useState(false);

    useEffect(() => {
        loadChat();
        loadIssues();
        loadAllIssues();
        const interval = setInterval(() => {
            if (activeTab === 'chat') loadChat();
            if (activeTab === 'issues') {
                loadIssues();
                loadAllIssues();
            }
        }, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const loadChat = async () => {
        try {
            const data = await policeAPI.getChatMessages();
            setChatMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const loadIssues = async () => {
        try {
            const data = await policeAPI.getIssues();
            setIssues(data.issues || []);
        } catch (error) {
            console.error('Failed to load issues:', error);
        }
    };
    
    const loadAllIssues = async () => {
        try {
            const data = await policeAPI.getAllIssues();
            setAllIssues(data.issues || []);
        } catch (error) {
            console.error('Failed to load all issues:', error);
        }
    };
    
    const handleMapClick = (latlng) => {
        setSelectedLocation(latlng);
        setNewIssue({
            ...newIssue,
            latitude: latlng.lat.toFixed(6),
            longitude: latlng.lng.toFixed(6)
        });
        setShowIssueForm(true);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await policeAPI.sendChatMessage(newMessage);
            setNewMessage('');
            loadChat();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleReportIssue = async (e) => {
        e.preventDefault();
        if (!newIssue.description || !newIssue.latitude || !newIssue.longitude) return;

        try {
            await policeAPI.reportIssue({
                description: newIssue.description,
                location: newIssue.location,
                latitude: parseFloat(newIssue.latitude),
                longitude: parseFloat(newIssue.longitude)
            });
            setNewIssue({ description: '', location: '', latitude: '', longitude: '' });
            setSelectedLocation(null);
            setShowIssueForm(false);
            loadIssues();
            loadAllIssues();
        } catch (error) {
            console.error('Failed to report issue:', error);
            alert('Failed to report issue: ' + error.message);
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

    return (
        <div className="page-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="page-content container" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--space-lg) var(--space-lg) 0' }}>
                <div className="flex-between mb-lg">
                    <h1 style={{ marginBottom: 0 }}>Police Connect</h1>
                    <div className="flex" style={{ gap: 'var(--space-md)' }}>
                        {activeTab === 'chat' && (
                            <button
                                onClick={() => setIsChatExpanded(!isChatExpanded)}
                                className="btn btn-secondary"
                                title={isChatExpanded ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isChatExpanded ? '⤓' : '⤢'}
                            </button>
                        )}
                        <Link to="/police" className="btn btn-secondary">← Back</Link>
                    </div>
                </div>

                <div className="flex mb-lg" style={{ gap: 'var(--space-md)' }}>
                    <button
                        onClick={() => { setActiveTab('chat'); setIsChatExpanded(false); }}
                        className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        💬 Interagency Intel Hub
                    </button>
                    <button
                        onClick={() => { setActiveTab('issues'); setIsChatExpanded(false); }}
                        className={`btn ${activeTab === 'issues' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🔧 Infrastructure Coordination
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card"
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: isChatExpanded ? 'var(--space-lg)' : 'var(--space-xl)',
                                marginBottom: 'var(--space-lg)',
                                maxHeight: isChatExpanded ? 'calc(100vh - 180px)' : 'calc(100vh - 220px)',
                                position: isChatExpanded ? 'fixed' : 'relative',
                                top: isChatExpanded ? 'var(--space-lg)' : 'auto',
                                left: isChatExpanded ? 'var(--space-lg)' : 'auto',
                                right: isChatExpanded ? 'var(--space-lg)' : 'auto',
                                bottom: isChatExpanded ? 'var(--space-lg)' : 'auto',
                                zIndex: isChatExpanded ? 1000 : 1,
                                width: isChatExpanded ? 'calc(100% - var(--space-xl))' : 'auto'
                            }}
                        >
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <h3 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <span>🚔</span> Police Communication Channel
                                </h3>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                                    Internal chat for police officers • Real-time updates
                                </p>
                            </div>

                            <div 
                                ref={chatContainerRef}
                                style={{ 
                                    flex: 1, 
                                    overflowY: 'auto', 
                                    marginBottom: 'var(--space-lg)',
                                    paddingRight: 'var(--space-sm)'
                                }}
                            >
                                {chatMessages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--gray-500)' }}>
                                        <p style={{ fontSize: 'var(--font-size-lg)' }}>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="glass-card-dark"
                                            style={{
                                                marginBottom: 'var(--space-md)',
                                                padding: 'var(--space-lg)',
                                                borderRadius: 'var(--radius-lg)',
                                                borderLeft: '3px solid var(--primary)'
                                            }}
                                        >
                                            <div className="flex-between mb-sm">
                                                <strong style={{ fontSize: 'var(--font-size-base)', color: 'var(--primary)' }}>
                                                    👮 {msg.sender_name}
                                                </strong>
                                                <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </small>
                                            </div>
                                            <p style={{ marginBottom: 0, fontSize: 'var(--font-size-base)', lineHeight: '1.6' }}>
                                                {msg.message_text}
                                            </p>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} style={{ marginTop: 'auto' }}>
                                <div className="flex" style={{ gap: 'var(--space-md)', alignItems: 'flex-end' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        style={{ 
                                            flex: 1, 
                                            padding: 'var(--space-md)', 
                                            fontSize: 'var(--font-size-base)',
                                            marginBottom: 0
                                        }}
                                        autoFocus
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={!newMessage.trim()}
                                    >
                                        Send 📤
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'issues' && (
                        <motion.div
                            key="issues"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ flex: 1, overflow: 'auto', paddingBottom: 'var(--space-lg)' }}
                        >
                            <div className="grid grid-2" style={{ gap: 'var(--space-lg)', alignItems: 'start' }}>
                                {/* Map Section */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card"
                                    style={{ height: '600px', overflow: 'hidden' }}
                                >
                                    <h3 style={{ marginBottom: 'var(--space-md)' }}>
                                        🗺️ Infrastructure Issues Map
                                    </h3>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                                        🚩 Red flags show pending issues. Click on map to report new issue.
                                    </p>
                                    
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={13}
                                        style={{ height: '500px', borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <MapClickHandler onMapClick={handleMapClick} />
                                        
                                        {/* Show all reported issues */}
                                        {allIssues.filter(issue => issue.latitude && issue.longitude).map((issue) => (
                                            <Marker
                                                key={issue.id}
                                                position={[issue.latitude, issue.longitude]}
                                                icon={redFlagIcon}
                                            >
                                                <Popup>
                                                    <div style={{ minWidth: '250px' }}>
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
                                                        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                            <strong>📋 Issue:</strong> {issue.description}
                                                        </p>
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
                                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                                            {new Date(issue.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                        
                                        {/* Show selected location */}
                                        {selectedLocation && (
                                            <Marker
                                                position={[selectedLocation.lat, selectedLocation.lng]}
                                                icon={L.divIcon({
                                                    html: `<div style="font-size: 32px;">📍</div>`,
                                                    className: 'custom-marker-icon',
                                                    iconSize: [32, 32],
                                                    iconAnchor: [16, 32]
                                                })}
                                            />
                                        )}
                                    </MapContainer>
                                </motion.div>

                                {/* Form/List Section */}
                                <div>
                                    {showIssueForm ? (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="glass-card"
                                        >
                                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>
                                                📝 Report Infrastructure Issue
                                            </h3>
                                            <form onSubmit={handleReportIssue}>
                                                <div className="form-group">
                                                    <label className="form-label">Latitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        className="form-input"
                                                        value={newIssue.latitude}
                                                        readOnly
                                                        required
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Longitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        className="form-input"
                                                        value={newIssue.longitude}
                                                        readOnly
                                                        required
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Issue Description (Required) *</label>
                                                    <textarea
                                                        className="form-textarea"
                                                        value={newIssue.description}
                                                        onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                                        placeholder="Describe the infrastructure issue (e.g., Broken streetlight, Road damage, Water leak)"
                                                        required
                                                        rows="4"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Location Name (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={newIssue.location}
                                                        onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                                                        placeholder="e.g., MG Road junction, Near Park"
                                                    />
                                                </div>

                                                <div className="flex" style={{ gap: 'var(--space-md)' }}>
                                                    <button 
                                                        type="submit" 
                                                        className="btn btn-primary"
                                                        style={{ flex: 1 }}
                                                        disabled={!newIssue.description}
                                                    >
                                                        🚩 Report Issue
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowIssueForm(false);
                                                            setSelectedLocation(null);
                                                        }}
                                                        className="btn btn-secondary"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="glass-card"
                                            style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}
                                        >
                                            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🗺️</div>
                                            <h3>Click on the Map</h3>
                                            <p style={{ color: 'var(--gray-600)' }}>
                                                Click anywhere on the map to report an infrastructure issue
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Issues List */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="glass-card"
                                        style={{ marginTop: 'var(--space-lg)' }}
                                    >
                                        <h3 style={{ marginBottom: 'var(--space-md)' }}>📋 My Reported Issues ({issues.length})</h3>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {issues.length === 0 ? (
                                                <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                                                    No issues reported yet
                                                </p>
                                            ) : (
                                                issues.map((issue, index) => (
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
                                                            <span className={`badge ${issue.status === 'COMPLETED' ? 'badge-success' : issue.status === 'ACCEPTED' ? 'badge-info' : 'badge-warning'}`}>
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
                                                        {issue.assigned_to_name && (
                                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                                                                👷 Assigned to: {issue.assigned_to_name}
                                                            </p>
                                                        )}
                                                        <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                                            {new Date(issue.timestamp).toLocaleString()}
                                                        </small>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PoliceConnect;
