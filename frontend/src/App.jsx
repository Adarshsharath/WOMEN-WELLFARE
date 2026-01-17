import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import './index.css';

// Auth pages
import Login from './pages/auth/Login';
import RegisterWoman from './pages/auth/RegisterWoman';
import RegisterCommunity from './pages/auth/RegisterCommunity';

//  Women pages
import WomenHome from './pages/women/Home';
import SOSConfirmation from './pages/women/SOSConfirmation';
import SOSActive from './pages/women/SOSActive';
import SafeRoutes from './pages/women/SafeRoutes';
import EmergencyContacts from './pages/women/EmergencyContacts';
import FakeCall from './pages/women/FakeCall';

// Police pages
import PoliceDashboard from './pages/police/Dashboard';
import FlagZone from './pages/police/FlagZone';
import PoliceConnect from './pages/police/Connect';

// Infrastructure pages
import InfrastructureDashboard from './pages/infrastructure/Dashboard';

// Cybersecurity pages
import CybersecurityMonitoring from './pages/cybersecurity/Monitoring';

// Emergency pages
import EmergencyDashboard from './pages/emergency/Dashboard';
import EmergencyChat from './pages/emergency/Chat';

// Admin pages
import AdminApprovals from './pages/admin/Approvals';
import AdminFlaggedUsers from './pages/admin/FlaggedUsers';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register/woman" element={<RegisterWoman />} />
                    <Route path="/register/community" element={<RegisterCommunity />} />

                    {/* Women routes */}
                    <Route path="/woman" element={<ProtectedRoute allowedRoles={['WOMAN']}><WomenHome /></ProtectedRoute>} />
                    <Route path="/woman/sos-confirm" element={<ProtectedRoute allowedRoles={['WOMAN']}><SOSConfirmation /></ProtectedRoute>} />
                    <Route path="/woman/sos-active" element={<ProtectedRoute allowedRoles={['WOMAN']}><SOSActive /></ProtectedRoute>} />
                    <Route path="/woman/safe-routes" element={<ProtectedRoute allowedRoles={['WOMAN']}><SafeRoutes /></ProtectedRoute>} />
                    <Route path="/woman/emergency-contacts" element={<ProtectedRoute allowedRoles={['WOMAN']}><EmergencyContacts /></ProtectedRoute>} />
                    <Route path="/woman/fake-call" element={<ProtectedRoute allowedRoles={['WOMAN']}><FakeCall /></ProtectedRoute>} />

                    {/* Police routes */}
                    <Route path="/police" element={<ProtectedRoute allowedRoles={['POLICE']}><PoliceDashboard /></ProtectedRoute>} />
                    <Route path="/police/flag-zone" element={<ProtectedRoute allowedRoles={['POLICE']}><FlagZone /></ProtectedRoute>} />
                    <Route path="/police/connect" element={<ProtectedRoute allowedRoles={['POLICE']}><PoliceConnect /></ProtectedRoute>} />

                    {/* Infrastructure routes */}
                    <Route path="/infrastructure" element={<ProtectedRoute allowedRoles={['INFRASTRUCTURE']}><InfrastructureDashboard /></ProtectedRoute>} />

                    {/* Cybersecurity routes */}
                    <Route path="/cybersecurity" element={<ProtectedRoute allowedRoles={['CYBERSECURITY']}><CybersecurityMonitoring /></ProtectedRoute>} />

                    {/* Emergency routes */}
                    <Route path="/emergency" element={<ProtectedRoute allowedRoles={['EMERGENCY']}><EmergencyDashboard /></ProtectedRoute>} />
                    <Route path="/emergency/chat" element={<ProtectedRoute allowedRoles={['EMERGENCY']}><EmergencyChat /></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApprovals /></ProtectedRoute>} />
                    <Route path="/admin/flagged-users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFlaggedUsers /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
