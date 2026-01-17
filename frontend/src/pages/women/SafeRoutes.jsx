import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { womenAPI } from '../../utils/api';
import L from 'leaflet';

// Nominatim geocoding service
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const SafeRoutes = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [startInput, setStartInput] = useState('');
    const [destInput, setDestInput] = useState('');
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedDest, setSelectedDest] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Preferences
    const [safetyPriority, setSafetyPriority] = useState(70);
    const [preferMainRoads, setPreferMainRoads] = useState(false);
    const [preferWellLit, setPreferWellLit] = useState(true);
    const [preferPopulated, setPreferPopulated] = useState(true);

    // State for interactive features
    const [activeRouteForDirections, setActiveRouteForDirections] = useState(null);
    const [navigatingRoute, setNavigatingRoute] = useState(null);
    const [carPosition, setCarPosition] = useState(null);

    // Car Icon for navigation
    const carIcon = L.divIcon({
        html: `<div style="font-size: 24px; transform: rotate(0deg); display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; width: 40px; height: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); border: 2px solid #10B981;">🚗</div>`,
        className: 'custom-car-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lon: longitude });
                    setSelectedStart({ lat: latitude, lon: longitude, display_name: 'My Current Location' });
                    setStartInput('My Current Location');
                },
                (error) => {
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const searchLocation = async (query, type) => {
        if (query.length < 3) {
            if (type === 'start') setStartSuggestions([]);
            else setDestSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `${NOMINATIM_URL}?q=${encodeURIComponent(query + ' Bangalore')}&format=json&limit=5`
            );
            const data = await response.json();

            if (type === 'start') {
                setStartSuggestions(data);
            } else {
                setDestSuggestions(data);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    };

    const handleStartInput = (value) => {
        setStartInput(value);
        if (value !== 'My Current Location') {
            searchLocation(value, 'start');
        }
    };

    const handleDestInput = (value) => {
        setDestInput(value);
        searchLocation(value, 'dest');
    };

    const selectStart = (place) => {
        setSelectedStart(place);
        setStartInput(place.display_name);
        setStartSuggestions([]);
    };

    const selectDest = (place) => {
        setSelectedDest(place);
        setDestInput(place.display_name);
        setDestSuggestions([]);
    };

    const calculateRoutes = async () => {
        if (!selectedStart || !selectedDest) {
            setError('Please select both start and destination');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await womenAPI.calculateSafeRoutes({
                start_latitude: parseFloat(selectedStart.lat),
                start_longitude: parseFloat(selectedStart.lon),
                end_latitude: parseFloat(selectedDest.lat),
                end_longitude: parseFloat(selectedDest.lon),
                safety_priority: safetyPriority,
                prefer_main_roads: preferMainRoads,
                prefer_well_lit: preferWellLit,
                prefer_populated: preferPopulated
            });

            if (response.success) {
                // Use the enhanced routes from backend
                const formattedRoutes = response.routes.map((r, idx) => ({
                    ...r,
                    color: getRouteColor(idx),
                    style: getRouteStyleName(idx),
                    badge: r.label.toUpperCase() + (r.safety_score ? ` (${r.safety_score}/100)` : '')
                }));
                setRoutes(formattedRoutes);
            } else {
                setError(response.error || 'Failed to calculate routes');
            }
        } catch (err) {
            setError(err.message || 'Failed to calculate routes');
        } finally {
            setLoading(false);
        }
    };

    const getRouteColor = (idx) => {
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4', '#6366F1'];
        return colors[idx % colors.length];
    };

    const getRouteStyleName = (idx) => {
        const styles = ['solid', 'solid', 'dotted', 'dash-dot', 'dashed', 'solid', 'dashed'];
        return styles[idx % styles.length];
    };

    const handleDirectionsClick = (route) => {
        setActiveRouteForDirections(route);
        setNavigatingRoute(null);
    };

    const handleNavigateClick = (route) => {
        setNavigatingRoute(route);
        setActiveRouteForDirections(null);
        // Start simulated car at the first coordinate
        if (route.geometry && route.geometry.coordinates.length > 0) {
            const first = route.geometry.coordinates[0];
            setCarPosition([first[1], first[0]]);
        }
    };

    const getRouteStyle = (style) => {
        if (style === 'dotted') return '5, 10';
        if (style === 'dashed') return '10, 10';
        if (style === 'dash-dot') return '10, 5, 5, 5';
        return null;
    };

    const getCrimeLevel = (score) => {
        if (score >= 80) return 'Low';
        if (score >= 60) return 'Medium';
        return 'High';
    };

    return (
        <div className="page-wrapper">
            <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
                {/* Left Sidebar */}
                <div style={{ width: '350px', background: 'white', overflowY: 'auto', borderRight: '1px solid var(--gray-200)', padding: 'var(--space-lg)' }}>
                    <div className="flex-between mb-lg">
                        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 0 }}>🛡️ Safe Route Planner</h2>
                        <Link to="/woman" style={{ fontSize: 'var(--font-size-sm)' }}>← Back</Link>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-lg)' }}>
                        Find the safest routes in Bangalore
                    </p>

                    {/* How to use */}
                    <div style={{ background: '#FEF3C7', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-sm)' }}>
                        <strong>How to use:</strong>
                        <ol style={{ marginTop: 'var(--space-sm)', marginBottom: 0, paddingLeft: 'var(--space-lg)' }}>
                            <li>Search for locations or use current location</li>
                            <li>Set your preferences and safety priorities</li>
                            <li>Click "Find Safe Routes" to get 5 optimized paths</li>
                        </ol>
                    </div>

                    {/* Use Current Location */}
                    <button
                        onClick={useCurrentLocation}
                        className="btn btn-success"
                        style={{ width: '100%', marginBottom: 'var(--space-lg)' }}
                    >
                        📍 Use My Current Location
                    </button>

                    {/* Start Location */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">🔍 Enter start location</label>
                        <input
                            type="text"
                            className="form-input"
                            value={startInput}
                            onChange={(e) => handleStartInput(e.target.value)}
                            placeholder="Search start location..."
                        />
                        {startSuggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-xs)', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
                                {startSuggestions.map((place, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectStart(place)}
                                        style={{ padding: 'var(--space-sm)', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)', fontSize: 'var(--font-size-sm)' }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        {place.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Destination */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">🔍 Enter destination</label>
                        <input
                            type="text"
                            className="form-input"
                            value={destInput}
                            onChange={(e) => handleDestInput(e.target.value)}
                            placeholder="Search destination..."
                        />
                        {destSuggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-xs)', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
                                {destSuggestions.map((place, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectDest(place)}
                                        style={{ padding: 'var(--space-sm)', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)', fontSize: 'var(--font-size-sm)' }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        {place.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Priority Balance */}
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-md)' }}>Priority Balance</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                            <span>Safety</span>
                            <span>Distance</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={safetyPriority}
                            onChange={(e) => setSafetyPriority(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-sm)', color: 'var(--gray-600)' }}>
                            {safetyPriority}% Safety / {100 - safetyPriority}% Distance
                        </div>
                    </div>

                    {/* Preferences */}
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={preferMainRoads} onChange={(e) => setPreferMainRoads(e.target.checked)} />
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>🛣️ Prefer Main Roads</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={preferWellLit} onChange={(e) => setPreferWellLit(e.target.checked)} />
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>💡 Prefer Well-Lit Areas</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={preferPopulated} onChange={(e) => setPreferPopulated(e.target.checked)} />
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>👥 Prefer Populated Areas</span>
                        </label>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={calculateRoutes}
                        className="btn btn-primary"
                        disabled={loading || !selectedStart || !selectedDest}
                        style={{ width: '100%', marginTop: 'var(--space-xl)' }}
                    >
                        {loading ? 'Calculating...' : '🔍 Find Safe Routes'}
                    </button>

                    {error && (
                        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Side - Map and Routes */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Map */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <MapContainer
                            center={currentLocation ? [currentLocation.lat, currentLocation.lon] : [12.9716, 77.5946]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />

                            {/* Draw routes */}
                            {routes.map((route, idx) => (
                                route.geometry && route.geometry.coordinates && (
                                    <Polyline
                                        key={idx}
                                        positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                        color={navigatingRoute && navigatingRoute.label !== route.label ? '#D1D5DB' : route.color}
                                        weight={navigatingRoute && navigatingRoute.label === route.label ? 8 : 5}
                                        opacity={navigatingRoute && navigatingRoute.label !== route.label ? 0.4 : 0.8}
                                        dashArray={getRouteStyle(route.style)}
                                    />
                                )
                            ))}

                            {/* Car marker for navigation */}
                            {navigatingRoute && carPosition && (
                                <Marker
                                    position={carPosition}
                                    icon={carIcon}
                                    zIndexOffset={1000}
                                >
                                    <Popup>Navigating: {navigatingRoute.label}</Popup>
                                </Marker>
                            )}

                            {/* Start marker */}
                            {selectedStart && (
                                <Marker position={[parseFloat(selectedStart.lat), parseFloat(selectedStart.lon)]}>
                                    <Popup>Start: {selectedStart.display_name}</Popup>
                                </Marker>
                            )}

                            {/* Destination marker */}
                            {selectedDest && (
                                <Marker position={[parseFloat(selectedDest.lat), parseFloat(selectedDest.lon)]}>
                                    <Popup>Destination: {selectedDest.display_name}</Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {/* Directions Overlay */}
                        {activeRouteForDirections && (
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 20, opacity: 1 }}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '0px',
                                    width: '320px',
                                    maxHeight: '80%',
                                    background: 'white',
                                    zIndex: 1000,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '2px solid var(--primary-light)'
                                }}
                            >
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)', borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🧭 Turn-by-Turn Directions
                                    </h3>
                                    <button
                                        onClick={() => setActiveRouteForDirections(null)}
                                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--gray-500)' }}
                                    >×</button>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '16px' }}>
                                    {activeRouteForDirections.steps && activeRouteForDirections.steps.length > 0 ? (
                                        activeRouteForDirections.steps.map((step, sIdx) => (
                                            <div key={sIdx} style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderLeft: '3px solid #8B5CF6', paddingLeft: '12px' }}>
                                                <div style={{ background: '#F3E8FF', color: '#8B5CF6', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                                    {sIdx + 1}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--gray-800)' }}>{step.instruction}</p>
                                                    <p style={{ fontSize: '12px', margin: 0, color: 'var(--gray-500)', fontWeight: 600 }}>
                                                        {step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '14px', textAlign: 'center', color: 'var(--gray-500)' }}>No step-by-step directions available for this route.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Route Cards */}
                    {routes.length > 0 && (
                        <div style={{ height: '280px', overflowY: 'auto', background: 'var(--gray-50)', borderTop: '2px solid var(--gray-300)', padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-lg)', overflowX: 'auto' }}>
                            {routes.map((route, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        minWidth: '240px',
                                        background: 'white',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: 'var(--space-lg)',
                                        border: `3px solid ${route.color}`,
                                        boxShadow: 'var(--shadow-xl)'
                                    }}
                                >
                                    <div style={{ marginBottom: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                            <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 0, fontWeight: 700 }}>{route.label}</h4>
                                            <div style={{ background: route.color, color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, maxWidth: '100px' }}>
                                                {route.badge}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Safety Score</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            <div style={{ flex: 1, background: 'var(--gray-200)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${route.safety_score}%`, height: '100%', background: route.safety_score >= 80 ? '#10B981' : route.safety_score >= 60 ? '#F59E0B' : '#EF4444' }}></div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: route.color }}>{route.safety_score}/100</span>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                                        <strong>Route Style:</strong> <span style={{ color: route.color, fontSize: '18px' }}>━━━</span> {route.style}
                                    </div>

                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                                        <strong>Distance:</strong> {((route.distance || 10000) / 1000).toFixed(2)} km
                                    </div>

                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                                        <strong>Duration:</strong> {Math.round((route.duration || 600) / 60)} min
                                    </div>

                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: route.safety_score >= 80 ? '#D1FAE5' : '#FEF3C7', borderRadius: 'var(--radius-sm)' }}>
                                        <strong>Crime Exposure:</strong> {getCrimeLevel(route.safety_score)} ({route.crime_incidents || 0} incidents)
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                        <button
                                            onClick={() => handleDirectionsClick(route)}
                                            className="btn btn-sm"
                                            style={{ flex: 1, fontSize: 'var(--font-size-xs)', padding: '8px', background: '#8B5CF6', color: 'white' }}
                                        >
                                            🧭 Directions
                                        </button>
                                        <button
                                            onClick={() => handleNavigateClick(route)}
                                            className="btn btn-sm"
                                            style={{ flex: 1, fontSize: 'var(--font-size-xs)', padding: '8px', background: '#10B981', color: 'white' }}
                                        >
                                            🚗 Navigate
                                        </button>
                                    </div>

                                    <button className="btn btn-sm" style={{ width: '100%', marginTop: 'var(--space-sm)', background: route.color, color: 'white', fontSize: 'var(--font-size-xs)', padding: '8px' }}>
                                        ⭐ Rate This Route
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SafeRoutes;
