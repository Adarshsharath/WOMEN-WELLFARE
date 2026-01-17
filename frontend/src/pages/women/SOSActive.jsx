import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { womenAPI } from '../../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SOSActive = () => {
    const [sosEvent, setSosEvent] = useState(null);
    const [location, setLocation] = useState(null);
    const [battery, setBattery] = useState(100);
    const navigate = useNavigate();

    useEffect(() => {
        triggerSOS();
        startLocationTracking();
        getBatteryLevel();
    }, []);

    const triggerSOS = async () => {
        try {
            // Get current location
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                // Trigger SOS
                const batteryLevel = await getBatteryPercentage();
                const response = await womenAPI.triggerSOS({
                    latitude,
                    longitude,
                    battery_percentage: batteryLevel
                });

                setSosEvent(response.sos_event);
            }, (error) => {
                console.error('Location error:', error);
                alert('Unable to get location. Please enable GPS.');
                navigate('/woman');
            });
        } catch (error) {
            console.error('SOS trigger failed:', error);
            alert('Failed to trigger SOS');
            navigate('/woman');
        }
    };

    const startLocationTracking = () => {
        const interval = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });

                    if (sosEvent) {
                        const batteryLevel = await getBatteryPercentage();
                        await womenAPI.updateSOSLocation(sosEvent.id, {
                            latitude,
                            longitude,
                            battery_percentage: batteryLevel
                        });
                    }
                });
            }
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    };

    const getBatteryLevel = async () => {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                setBattery(Math.round(battery.level * 100));
            } catch (error) {
                console.error('Battery API error:', error);
            }
        }
    };

    const getBatteryPercentage = async () => {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                return Math.round(battery.level * 100);
            } catch (error) {
                return 100;
            }
        }
        return 100;
    };

    const handleResolve = async () => {
        if (sosEvent) {
            try {
                await womenAPI.cancelSOS(sosEvent.id);
                navigate('/woman');
            } catch (error) {
                console.error('Failed to resolve SOS:', error);
            }
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div 
                        className="glass-card" 
                        animate={{ 
                            boxShadow: [
                                '0 0 20px rgba(220, 38, 38, 0.5)',
                                '0 0 40px rgba(220, 38, 38, 0.8)',
                                '0 0 20px rgba(220, 38, 38, 0.5)',
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)', 
                            borderLeft: '6px solid var(--danger)',
                            borderColor: 'var(--danger)'
                        }}
                    >
                        <div className="flex-between" style={{ alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    style={{ fontSize: '3rem' }}
                                >
                                    🚨
                                </motion.div>
                                <h2 style={{ color: 'var(--danger)', margin: 0, fontWeight: '800' }}>SOS ACTIVE</h2>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <motion.span 
                                    className="badge badge-danger"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    🔴 Active
                                </motion.span>
                                <span className="badge badge-info">
                                    🔋 {battery}%
                                </span>
                            </div>
                        </div>
                        <p style={{ 
                            marginTop: 'var(--space-lg)', 
                            color: 'var(--gray-700)', 
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: '500'
                        }}>
                            ⚠️ Emergency alerts have been sent to all your contacts. Your location is being tracked in real-time.
                        </p>
                    </motion.div>

                    {location && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 'var(--space-xl)' }}
                        >
                            <h3 style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-sm)',
                                color: 'var(--primary)'
                            }}>
                                📍 Your Current Location
                            </h3>
                            <div className="map-container" style={{ marginTop: 'var(--space-md)' }}>
                                <MapContainer
                                    center={[location.latitude, location.longitude]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    <Marker position={[location.latitude, location.longitude]}>
                                        <Popup>Your current location</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            <div className="glass-card" style={{ 
                                marginTop: 'var(--space-lg)',
                                background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 153, 255, 0.04) 100%)',
                                borderLeft: '4px solid var(--info)'
                            }}>
                                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🧭</span>
                                        <p style={{ margin: 0, color: 'var(--gray-700)', fontWeight: '500' }}>
                                            <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                                        <p style={{ margin: 0, color: 'var(--gray-700)', fontWeight: '500' }}>
                                            <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🌐</span>
                                        <p style={{ margin: 0, color: 'var(--gray-700)', fontWeight: '500' }}>
                                            <strong>Google Maps:</strong>{' '}
                                            <a 
                                                href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
                                            >
                                                Open in Maps →
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResolve}
                        className="btn btn-success btn-lg"
                        style={{ 
                            marginTop: 'var(--space-2xl)', 
                            width: '100%',
                            padding: 'var(--space-xl)',
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: '800',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        ✅ I'm Safe Now - Resolve SOS
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default SOSActive;
