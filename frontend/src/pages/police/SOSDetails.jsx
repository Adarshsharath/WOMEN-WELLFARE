import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { policeAPI } from '../../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SOSDetails = () => {
    const { id } = useParams();
    const [sosEvent, setSosEvent] = useState(null);
    const [locationUpdates, setLocationUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadSOSDetails();
        const interval = setInterval(loadSOSDetails, 5000); // Poll every 5 seconds for live updates
        return () => clearInterval(interval);
    }, [id]);

    const loadSOSDetails = async () => {
        try {
            const data = await policeAPI.getSOSDetails(id);
            setSosEvent(data.sos_event);
            setLocationUpdates(data.location_updates || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load SOS details:', error);
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!window.confirm('Are you sure you want to resolve this SOS alert?')) return;
        
        setResolving(true);
        try {
            await policeAPI.resolveSOS(id);
            navigate('/police');
        } catch (error) {
            console.error('Failed to resolve SOS:', error);
            alert('Failed to resolve SOS alert');
        } finally {
            setResolving(false);
        }
    };

    if (loading) return <div className="page-wrapper container"><h2>Loading SOS Details...</h2></div>;
    if (!sosEvent) return <div className="page-wrapper container"><h2>SOS Event not found</h2></div>;

    const currentPos = [sosEvent.latitude, sosEvent.longitude];
    const pathPositions = locationUpdates.map(update => [update.latitude, update.longitude]);
    
    // Include the initial SOS location in the path if needed
    if (pathPositions.length === 0) pathPositions.push(currentPos);

    return (
        <div className="page-wrapper">
             <nav className="navbar">
                <div className="navbar-container container">
                    <div className="navbar-brand">HerAssist Police</div>
                    <ul className="navbar-nav">
                        <li><Link to="/police" className="nav-link">Dashboard</Link></li>
                        <li><Link to="/police/mark-zones" className="nav-link">Mark Zones</Link></li>
                        <li><button onClick={() => navigate(-1)} className="btn btn-sm btn-secondary">Back</button></li>
                    </ul>
                </div>
            </nav>

            <div className="page-content container">
                <div className="grid grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
                    {/* Left Side: Info and Controls */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="glass-card" style={{ 
                            borderLeft: '6px solid var(--danger)',
                            background: sosEvent.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.05)' : 'var(--white)'
                        }}>
                            <div className="flex-between mb-lg">
                                <h2 style={{ margin: 0 }}>👤 {sosEvent.woman_name}</h2>
                                <span className={`badge ${sosEvent.status === 'ACTIVE' ? 'badge-danger' : 'badge-success'}`}>
                                    {sosEvent.status === 'ACTIVE' ? '🚨 ACTIVE' : '✅ RESOLVED'}
                                </span>
                            </div>

                            <div className="grid grid-2" style={{ gap: 'var(--space-md)' }}>
                                <div className="info-item">
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block' }}>PHONE NUMBER</label>
                                    <p style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>{sosEvent.woman_phone}</p>
                                </div>
                                <div className="info-item">
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block' }}>BATTERY</label>
                                    <p style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>
                                        {sosEvent.battery_percentage}% {sosEvent.battery_percentage < 20 ? '🪫' : '🔋'}
                                    </p>
                                </div>
                                <div className="info-item">
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block' }}>TRIGGERED AT</label>
                                    <p style={{ fontWeight: '500' }}>{new Date(sosEvent.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="info-item">
                                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', display: 'block' }}>ALERT ID</label>
                                    <p style={{ fontWeight: '500' }}>#{sosEvent.id}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ marginBottom: 'var(--space-sm)' }}>📍 Latest Coordinates</h4>
                                <p style={{ margin: 0, fontFamily: 'monospace' }}>Lat: {sosEvent.latitude.toFixed(6)}</p>
                                <p style={{ margin: 0, fontFamily: 'monospace' }}>Lng: {sosEvent.longitude.toFixed(6)}</p>
                            </div>

                            {sosEvent.status === 'ACTIVE' && (
                                <button 
                                    onClick={handleResolve}
                                    disabled={resolving}
                                    className="btn btn-success"
                                    style={{ width: '100%', marginTop: 'var(--space-xl)', padding: 'var(--space-md)', fontWeight: '700' }}
                                >
                                    {resolving ? 'Resolving...' : '✅ Mark as Resolved'}
                                </button>
                            )}
                        </div>

                        <div className="glass-card" style={{ marginTop: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>📜 Location History</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {[...locationUpdates].reverse().map((update, index) => (
                                    <div key={update.id} style={{ 
                                        padding: 'var(--space-sm)', 
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        fontSize: 'var(--font-size-sm)',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>🕒 {new Date(update.timestamp).toLocaleTimeString()}</span>
                                        <span style={{ color: 'var(--gray-500)' }}>🔋 {update.battery_percentage}%</span>
                                    </div>
                                ))}
                                {locationUpdates.length === 0 && <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>No location updates yet</p>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Map */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        style={{ height: '700px', width: '100%', position: 'sticky', top: 'var(--space-xl)' }}
                    >
                        <div className="map-container" style={{ height: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                            <MapContainer 
                                center={currentPos} 
                                zoom={16} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <Marker position={currentPos}>
                                    <Popup>Woman's Current Location</Popup>
                                </Marker>
                                {locationUpdates.length > 0 && (
                                    <Polyline positions={pathPositions} color="red" weight={4} opacity={0.7} />
                                )}
                            </MapContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SOSDetails;
