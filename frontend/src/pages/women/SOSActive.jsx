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
                    <div className="glass-card" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'var(--danger)' }}>
                        <div className="flex-between">
                            <h2 style={{ color: 'var(--danger)' }}>🚨 SOS ACTIVE</h2>
                            <div>
                                <span className="badge badge-danger">Active</span>
                                <span className="badge badge-info" style={{ marginLeft: 'var(--space-sm)' }}>
                                    🔋 {battery}%
                                </span>
                            </div>
                        </div>
                        <p style={{ marginTop: 'var(--space-md)' }}>
                            Emergency alerts have been sent to all your contacts. Your location is being tracked in real-time.
                        </p>
                    </div>

                    {location && (
                        <div style={{ marginTop: 'var(--space-xl)' }}>
                            <h3>Your Current Location</h3>
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

                            <div className="glass-card" style={{ marginTop: 'var(--space-lg)' }}>
                                <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
                                <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
                                <p><strong>Google Maps:</strong> <a href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`} target="_blank" rel="noopener noreferrer">Open in Maps</a></p>
                            </div>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResolve}
                        className="btn btn-success btn-lg"
                        style={{ marginTop: 'var(--space-2xl)', width: '100%' }}
                    >
                        I'm Safe Now - Resolve SOS
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default SOSActive;
