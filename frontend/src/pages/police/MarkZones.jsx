import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { policeAPI } from '../../utils/api';
import 'leaflet/dist/leaflet.css';

// Custom red flag icon for marked zones
const redFlagIcon = L.divIcon({
    html: `<div style="font-size: 32px;">🚩</div>`,
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

const MarkZones = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        latitude: '',
        longitude: '',
        risk_level: 'HIGH',
        reason: '',
        description: ''
    });

    // Map state
    const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        loadZones();
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const loadZones = async () => {
        try {
            const data = await policeAPI.getFlaggedZones();
            setZones(data.zones || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
        }
    };

    const handleMapClick = (latlng) => {
        setSelectedLocation(latlng);
        setFormData({
            ...formData,
            latitude: latlng.lat.toFixed(6),
            longitude: latlng.lng.toFixed(6)
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await policeAPI.markZone({
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                risk_level: formData.risk_level,
                reason: formData.reason,
                description: formData.description
            });

            setSuccess('Zone marked successfully!');
            setShowForm(false);
            setSelectedLocation(null);
            setFormData({
                latitude: '',
                longitude: '',
                risk_level: 'HIGH',
                reason: '',
                description: ''
            });
            loadZones();
        } catch (error) {
            setError(error.message || 'Failed to mark zone');
        } finally {
            setLoading(false);
        }
    };

    const handleUnmark = async (zoneId) => {
        if (!window.confirm('Are you sure you want to unmark this zone? This means the issue has been resolved.')) {
            return;
        }

        try {
            await policeAPI.unmarkZone(zoneId);
            setSuccess('Zone unmarked successfully!');
            loadZones();
        } catch (error) {
            setError(error.message || 'Failed to unmark zone');
        }
    };

    const handleDelete = async (zoneId) => {
        if (!window.confirm('Are you sure you want to permanently delete this zone?')) {
            return;
        }

        try {
            await policeAPI.deleteFlaggedZone(zoneId);
            setSuccess('Zone deleted successfully!');
            loadZones();
        } catch (error) {
            setError(error.message || 'Failed to delete zone');
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'CRITICAL': return 'var(--danger)';
            case 'HIGH': return '#ff6b6b';
            case 'MEDIUM': return 'var(--warning)';
            case 'LOW': return 'var(--info)';
            default: return 'var(--gray-500)';
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="glass-card" style={{ marginBottom: 'var(--space-2xl)', background: 'var(--white)', padding: 'var(--space-xl)' }}>
                    <div className="flex-between">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                <span>🚩</span> Mark Danger Zones
                            </h1>
                            <p style={{ color: 'var(--gray-700)', fontWeight: '500', fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                                Click on the map to mark high-risk areas for women's safety
                            </p>
                        </motion.div>
                        <Link to="/police" className="btn btn-secondary">← Back</Link>
                    </div>
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

                <div className="grid grid-2" style={{ gap: 'var(--space-lg)', alignItems: 'start' }}>
                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ height: '600px', overflow: 'hidden' }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>📍 Interactive Map</h3>
                        <p style={{ color: 'var(--gray-700)', fontWeight: '500', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                            Click anywhere on the map to mark a danger zone
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

                            {/* Show all marked zones */}
                            {zones.map((zone) => (
                                <Marker
                                    key={zone.id}
                                    position={[zone.latitude, zone.longitude]}
                                    icon={redFlagIcon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <h4 style={{
                                                marginBottom: 'var(--space-sm)',
                                                color: getRiskColor(zone.risk_level)
                                            }}>
                                                {zone.risk_level} RISK
                                            </h4>
                                            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                <strong>Reason:</strong> {zone.reason}
                                            </p>
                                            {zone.description && (
                                                <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                    <strong>Details:</strong> {zone.description}
                                                </p>
                                            )}
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-700)', fontWeight: '500' }}>
                                                Marked by: {zone.police_name}
                                            </p>
                                            <span className={`badge ${zone.is_active ? 'badge-danger' : 'badge-gray'}`}>
                                                {zone.is_active ? 'ACTIVE' : 'RESOLVED'}
                                            </span>
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

                    {/* Form Section */}
                    <div>
                        {showForm ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card"
                            >
                                <h3 style={{ marginBottom: 'var(--space-lg)' }}>📝 Mark New Zone</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            className="form-input"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            required
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            className="form-input"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            required
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Risk Level</label>
                                        <select
                                            className="form-input"
                                            value={formData.risk_level}
                                            onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                                            required
                                        >
                                            <option value="LOW">Low Risk</option>
                                            <option value="MEDIUM">Medium Risk</option>
                                            <option value="HIGH">High Risk</option>
                                            <option value="CRITICAL">Critical Risk</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Reason (Required) *</label>
                                        <textarea
                                            className="form-textarea"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            placeholder="Why is this area dangerous? (e.g., Recent incidents, poor lighting, isolated area)"
                                            required
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Additional Details (Optional)</label>
                                        <textarea
                                            className="form-textarea"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Any additional information..."
                                            rows="2"
                                        />
                                    </div>

                                    <div className="flex" style={{ gap: 'var(--space-md)' }}>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                            style={{ flex: 1 }}
                                        >
                                            {loading ? '⏳ Marking...' : '🚩 Mark Zone'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
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
                                <p style={{ color: 'var(--gray-700)', fontWeight: '500' }}>
                                    Click anywhere on the map to mark a danger zone
                                </p>
                            </motion.div>
                        )}

                        {/* Marked Zones List */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                            style={{ marginTop: 'var(--space-lg)' }}
                        >
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>📋 Marked Zones ({zones.length})</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {zones.length === 0 ? (
                                    <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                                        No zones marked yet
                                    </p>
                                ) : (
                                    zones.map((zone) => (
                                        <div
                                            key={zone.id}
                                            className="glass-card-dark"
                                            style={{
                                                marginBottom: 'var(--space-sm)',
                                                padding: 'var(--space-md)',
                                                borderLeft: `4px solid ${getRiskColor(zone.risk_level)}`
                                            }}
                                        >
                                            <div className="flex-between mb-sm">
                                                <strong style={{ color: getRiskColor(zone.risk_level) }}>
                                                    {zone.risk_level}
                                                </strong>
                                                <span className={`badge ${zone.is_active ? 'badge-danger' : 'badge-gray'}`}>
                                                    {zone.is_active ? 'ACTIVE' : 'RESOLVED'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                                                {zone.reason}
                                            </p>
                                            <small style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                                                {new Date(zone.timestamp).toLocaleString()}
                                            </small>

                                            {zone.is_active && (
                                                <div style={{ marginTop: 'var(--space-sm)' }}>
                                                    <button
                                                        onClick={() => handleUnmark(zone.id)}
                                                        className="btn btn-sm btn-success"
                                                        style={{ marginRight: 'var(--space-xs)' }}
                                                    >
                                                        ✅ Mark as Resolved
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(zone.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkZones;
