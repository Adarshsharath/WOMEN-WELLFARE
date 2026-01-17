import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { policeAPI } from '../../utils/api';

const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const FlagZone = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [riskLevel, setRiskLevel] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedLocation) {
            alert('Please select a location on the map');
            return;
        }

        try {
            await policeAPI.flagZone({
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                risk_level: riskLevel,
                description
            });

            alert('Zone flagged successfully');
            navigate('/police');
        } catch (error) {
            console.error('Failed to flag zone:', error);
            alert('Failed to flag zone');
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <h1>Flag High-Risk Zone</h1>
                    <Link to="/police" className="btn btn-secondary">← Back</Link>
                </div>

                <div className="glass-card mb-lg">
                    <p>Click on the map to select a location to flag as high-risk</p>
                    {selectedLocation && (
                        <p style={{ color: 'var(--primary)', marginTop: 'var(--space-sm)' }}>
                            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                    )}
                </div>

                <div className="map-container mb-lg">
                    <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <MapClickHandler onLocationSelect={setSelectedLocation} />
                    </MapContainer>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                >
                    <h3>Zone Details</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-lg)' }}>
                        <div className="form-group">
                            <label className="form-label">Risk Level</label>
                            <select
                                className="form-select"
                                value={riskLevel}
                                onChange={(e) => setRiskLevel(e.target.value)}
                                required
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe why this zone is high-risk..."
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">Flag Zone</button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default FlagZone;
