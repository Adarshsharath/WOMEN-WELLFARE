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
    
    // Flagged zones
    const [flaggedZones, setFlaggedZones] = useState([]);

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
    
    // Red flag icon for danger zones
    const redFlagIcon = L.divIcon({
        html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚩</div>`,
        className: 'custom-flag-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    useEffect(() => {
        loadFlaggedZones();
    }, []);

    const loadFlaggedZones = async () => {
        try {
            const data = await womenAPI.getFlaggedZones();
            setFlaggedZones(data.zones || []);
        } catch (error) {
            console.error('Failed to load flagged zones:', error);
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'CRITICAL': return '#DC2626';
            case 'HIGH': return '#EF4444';
            case 'MEDIUM': return '#F59E0B';
            case 'LOW': return '#10B981';
            default: return '#6B7280';
        }
    };

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

                    {/* Enhanced Preferences */}
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-md)' }}>Route Preferences</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: preferMainRoads ? '#F3E8FF' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input type="checkbox" checked={preferMainRoads} onChange={(e) => setPreferMainRoads(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: preferMainRoads ? '600' : '400' }}>🛣️ Prefer Main Roads</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: preferWellLit ? '#FEF3C7' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input type="checkbox" checked={preferWellLit} onChange={(e) => setPreferWellLit(e.target.checked)} style={{ accentColor: '#F59E0B' }} />
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: preferWellLit ? '600' : '400' }}>💡 Prefer Well-Lit Areas</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: preferPopulated ? '#DBEAFE' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input type="checkbox" checked={preferPopulated} onChange={(e) => setPreferPopulated(e.target.checked)} style={{ accentColor: '#3B82F6' }} />
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: preferPopulated ? '600' : '400' }}>👥 Prefer Populated Areas</span>
                            </label>
                        </div>
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

                            {/* Draw routes with enhanced highlighting for navigation */}
                            {routes.map((route, idx) => {
                                const isNavigating = navigatingRoute && navigatingRoute.label === route.label;
                                const isOtherRoute = navigatingRoute && navigatingRoute.label !== route.label;
                                
                                return route.geometry && route.geometry.coordinates && (
                                    <React.Fragment key={idx}>
                                        {/* Shadow/glow effect for navigating route */}
                                        {isNavigating && (
                                            <Polyline
                                                positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                                color={route.color}
                                                weight={14}
                                                opacity={0.3}
                                            />
                                        )}
                                        {/* Main route line */}
                                        <Polyline
                                            positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                            color={isOtherRoute ? '#D1D5DB' : route.color}
                                            weight={isNavigating ? 10 : isOtherRoute ? 4 : 6}
                                            opacity={isOtherRoute ? 0.3 : isNavigating ? 1 : 0.8}
                                            dashArray={isNavigating ? null : getRouteStyle(route.style)}
                                        />
                                    </React.Fragment>
                                );
                            })}

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
                            
                            {/* Flagged danger zones */}
                            {flaggedZones.map((zone) => (
                                <Marker
                                    key={zone.id}
                                    position={[zone.latitude, zone.longitude]}
                                    icon={redFlagIcon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '250px', padding: 'var(--space-sm)' }}>
                                            <h4 style={{ 
                                                marginBottom: 'var(--space-sm)',
                                                color: getRiskColor(zone.risk_level),
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'bold'
                                            }}>
                                                ⚠️ {zone.risk_level} RISK ZONE
                                            </h4>
                                            <div style={{ 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                padding: 'var(--space-sm)', 
                                                borderRadius: 'var(--radius-md)',
                                                marginBottom: 'var(--space-sm)',
                                                borderLeft: `4px solid ${getRiskColor(zone.risk_level)}`
                                            }}>
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    marginBottom: 'var(--space-xs)',
                                                    fontWeight: '600'
                                                }}>
                                                    <strong>⚠️ Reason:</strong>
                                                </p>
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    marginBottom: 0,
                                                    lineHeight: '1.5'
                                                }}>
                                                    {zone.reason}
                                                </p>
                                            </div>
                                            {zone.description && (
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-xs)', 
                                                    marginBottom: 'var(--space-xs)',
                                                    color: 'var(--gray-600)'
                                                }}>
                                                    <strong>Details:</strong> {zone.description}
                                                </p>
                                            )}
                                            <div style={{ 
                                                borderTop: '1px solid var(--gray-200)', 
                                                paddingTop: 'var(--space-xs)',
                                                marginTop: 'var(--space-sm)'
                                            }}>
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-xs)', 
                                                    color: 'var(--gray-500)',
                                                    marginBottom: 'var(--space-xs)'
                                                }}>
                                                    👮 Reported by: {zone.police_name}
                                                </p>
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-xs)', 
                                                    color: 'var(--gray-500)',
                                                    marginBottom: 0
                                                }}>
                                                    📅 {new Date(zone.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div style={{ 
                                                marginTop: 'var(--space-sm)',
                                                padding: 'var(--space-xs)',
                                                background: '#FEF3C7',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: '600',
                                                color: '#92400E',
                                                textAlign: 'center'
                                            }}>
                                                🛡️ Avoid this area for your safety
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Enhanced Directions Overlay with Navigation Support */}
                        {(activeRouteForDirections || navigatingRoute) && (
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 20, opacity: 1 }}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '0px',
                                    width: '350px',
                                    maxHeight: '85%',
                                    background: 'white',
                                    zIndex: 1000,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `3px solid ${navigatingRoute?.color || activeRouteForDirections?.color || 'var(--primary-light)'}`
                                }}
                            >
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: navigatingRoute ? `linear-gradient(135deg, ${navigatingRoute.color} 0%, ${navigatingRoute.color}dd 100%)` : 'var(--gray-50)', borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: navigatingRoute ? 'white' : 'var(--gray-900)' }}>
                                        {navigatingRoute ? '🚗 Navigating' : '🧭 Directions'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setActiveRouteForDirections(null);
                                            setNavigatingRoute(null);
                                        }}
                                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: navigatingRoute ? 'white' : 'var(--gray-500)' }}
                                    >×</button>
                                </div>
                                
                                {navigatingRoute && (
                                    <div style={{ padding: '12px', background: `${navigatingRoute.color}15`, borderBottom: `1px solid ${navigatingRoute.color}40`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontSize: '24px', animation: 'pulse 2s ease-in-out infinite' }}>📍</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: navigatingRoute.color, fontWeight: '600' }}>Active Navigation</div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: navigatingRoute.color }}>{navigatingRoute.label}</div>
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ overflowY: 'auto', padding: '16px' }}>
                                    {(navigatingRoute || activeRouteForDirections) && (navigatingRoute?.steps || activeRouteForDirections?.steps)?.length > 0 ? (
                                        (navigatingRoute?.steps || activeRouteForDirections?.steps).map((step, sIdx) => {
                                            const routeColor = navigatingRoute?.color || activeRouteForDirections?.color || '#8B5CF6';
                                            return (
                                                <motion.div 
                                                    key={sIdx} 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: sIdx * 0.05 }}
                                                    style={{ 
                                                        display: 'flex', 
                                                        gap: '12px', 
                                                        marginBottom: '16px', 
                                                        borderLeft: `4px solid ${routeColor}`, 
                                                        paddingLeft: '12px',
                                                        background: navigatingRoute ? `${routeColor}10` : 'transparent',
                                                        padding: '12px',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <div style={{ background: navigatingRoute ? routeColor : `${routeColor}20`, color: navigatingRoute ? 'white' : routeColor, minWidth: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                                        {sIdx + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '14px', margin: '0 0 6px 0', color: 'var(--gray-800)', fontWeight: '500', lineHeight: '1.4' }}>
                                                            {step.instruction}
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '12px', color: routeColor, fontWeight: 700, background: `${routeColor}20`, padding: '2px 8px', borderRadius: '4px' }}>
                                                                📏 {step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ fontSize: '14px', textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--space-xl)' }}>
                                            No step-by-step directions available for this route.
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Route Cards - 3 per row flex layout */}
                    {routes.length > 0 && (
                        <div style={{ 
                            background: 'var(--gray-50)', 
                            borderTop: '2px solid var(--gray-300)', 
                            padding: 'var(--space-xl)',
                            overflowY: 'auto',
                            maxHeight: '400px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 'var(--space-lg)',
                                justifyContent: 'flex-start'
                            }}>
                                {routes.map((route, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flex: '1 1 calc(33.333% - var(--space-lg))',
                                            minWidth: '280px',
                                            maxWidth: 'calc(33.333% - var(--space-lg))',
                                            background: 'white',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: 'var(--space-lg)',
                                            border: `3px solid ${route.color}`,
                                            boxShadow: navigatingRoute?.label === route.label ? `0 8px 30px ${route.color}40` : 'var(--shadow-lg)',
                                            transform: navigatingRoute?.label === route.label ? 'scale(1.02)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
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

                                    {/* Enhanced Metrics Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                        {/* Crime Exposure */}
                                        <div style={{ padding: 'var(--space-sm)', background: route.safety_score >= 80 ? '#D1FAE5' : '#FEF3C7', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${route.safety_score >= 80 ? '#10B981' : '#F59E0B'}` }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: '2px' }}>🚨 Crime</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: route.safety_score >= 80 ? '#059669' : '#D97706' }}>
                                                {getCrimeLevel(route.safety_score)}
                                            </div>
                                        </div>

                                        {/* Lighting Score */}
                                        <div style={{ padding: 'var(--space-sm)', background: '#FEF3C7', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #F59E0B' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: '2px' }}>💡 Lighting</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: '#D97706' }}>
                                                {route.lighting_score ? `${Math.round(route.lighting_score)}/100` : 'N/A'}
                                            </div>
                                        </div>

                                        {/* Infrastructure Score - NEW! */}
                                        <div style={{ padding: 'var(--space-sm)', background: '#DBEAFE', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #3B82F6' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: '2px' }}>🏗️ Infrastructure</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: '#2563EB' }}>
                                                {route.infrastructure_score ? `${Math.round(route.infrastructure_score)}/100` : 'N/A'}
                                            </div>
                                        </div>

                                        {/* Network Score - NEW! */}
                                        <div style={{ padding: 'var(--space-sm)', background: '#E0E7FF', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #8B5CF6' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: '2px' }}>📶 Network</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: '#7C3AED' }}>
                                                {route.network_score ? `${Math.round(route.network_score)}/100` : 'N/A'}
                                            </div>
                                        </div>
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

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SafeRoutes;
