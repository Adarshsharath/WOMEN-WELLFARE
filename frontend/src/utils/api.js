// API base URL
const API_BASE_URL = '/api';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API request function
const apiRequest = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication API
export const authAPI = {
    registerWoman: (data) => apiRequest('/auth/register/woman', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    registerCommunity: (data) => apiRequest('/auth/register/community', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    login: (data) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Women API
export const womenAPI = {
    getEmergencyContacts: () => apiRequest('/women/emergency-contacts'),

    createEmergencyContact: (data) => apiRequest('/women/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateEmergencyContact: (id, data) => apiRequest(`/women/emergency-contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    deleteEmergencyContact: (id) => apiRequest(`/women/emergency-contacts/${id}`, {
        method: 'DELETE',
    }),

    triggerSOS: (data) => apiRequest('/women/sos', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateSOSLocation: (id, data) => apiRequest(`/women/sos/${id}/location`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    cancelSOS: (id) => apiRequest(`/women/sos/${id}/cancel`, {
        method: 'PUT',
    }),

    getActiveSOS: () => apiRequest('/women/sos/active'),

    logFakeCall: () => apiRequest('/women/fake-call', {
        method: 'POST',
    }),

    calculateSafeRoutes: (data) => apiRequest('/women/safe-routes', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getFlaggedZones: () => apiRequest('/police/flagged-zones'),
};

// Police API
export const policeAPI = {
    getSOSFeed: () => apiRequest('/police/sos-feed'),

    getSOSDetails: (id) => apiRequest(`/police/sos/${id}`),

    markZone: (data) => apiRequest('/police/flag-zone', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getFlaggedZones: () => apiRequest('/police/flagged-zones'),

    unmarkZone: (id) => apiRequest(`/police/flagged-zones/${id}/unmark`, {
        method: 'PUT',
    }),

    deleteFlaggedZone: (id) => apiRequest(`/police/flagged-zones/${id}`, {
        method: 'DELETE',
    }),

    getChatMessages: () => apiRequest('/police/chat'),

    sendChatMessage: (message) => apiRequest('/police/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    }),

    reportIssue: (data) => apiRequest('/police/issue', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getIssues: () => apiRequest('/police/issues'),
    
    getAllIssues: () => apiRequest('/police/issues/all'),
    
    getDashboardStats: () => apiRequest('/police/dashboard-stats'),
};

// Infrastructure API
export const infrastructureAPI = {
    getAllIssues: (status) => apiRequest(`/infrastructure/issues${status ? `?status=${status}` : ''}`),

    acceptIssue: (id) => apiRequest(`/infrastructure/issue/${id}/accept`, {
        method: 'PUT',
    }),

    completeIssue: (id) => apiRequest(`/infrastructure/issue/${id}/complete`, {
        method: 'PUT',
    }),

    getMyIssues: () => apiRequest('/infrastructure/my-issues'),

    getChatMessages: () => apiRequest('/infrastructure/chat'),

    sendChatMessage: (message) => apiRequest('/infrastructure/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    }),
    
    getDashboardStats: () => apiRequest('/infrastructure/dashboard-stats'),
};

// Cybersecurity API
export const cybersecurityAPI = {
    getMonitoring: () => apiRequest('/cybersecurity/monitoring'),

    flagUser: (data) => apiRequest('/cybersecurity/flag-user', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getFlaggedUsers: () => apiRequest('/cybersecurity/flagged-users'),
    
    getDashboardStats: () => apiRequest('/cybersecurity/dashboard-stats'),
};

// Emergency API
export const emergencyAPI = {
    getSOSEvents: (status) => apiRequest(`/emergency/sos-events${status ? `?status=${status}` : ''}`),

    broadcastMessage: (message) => apiRequest('/emergency/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message }),
    }),

    getBroadcastMessages: () => apiRequest('/emergency/broadcast'),
    
    getDashboardStats: () => apiRequest('/emergency/dashboard-stats'),
};

// Admin API
export const adminAPI = {
    getPendingApprovals: () => apiRequest('/admin/pending-approvals'),

    approveUser: (id) => apiRequest(`/admin/approve/${id}`, {
        method: 'PUT',
    }),

    rejectUser: (id) => apiRequest(`/admin/reject/${id}`, {
        method: 'DELETE',
    }),

    getFlaggedUsers: () => apiRequest('/admin/flagged-users'),

    suspendUser: (id) => apiRequest(`/admin/suspend/${id}`, {
        method: 'PUT',
    }),

    unsuspendUser: (id) => apiRequest(`/admin/unsuspend/${id}`, {
        method: 'PUT',
    }),

    getAllUsers: () => apiRequest('/admin/users'),
    
    getDashboardStats: () => apiRequest('/admin/dashboard-stats'),
};

// Chatbot API
export const chatbotAPI = {
    sendMessage: (message, conversationHistory) => apiRequest('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message, conversation_history: conversationHistory }),
    }),

    summarizeIncident: (data) => apiRequest('/chatbot/summarize', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// SSE for real-time updates
export const subscribeToSOSUpdates = (onUpdate) => {
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`${API_BASE_URL}/sse/sos-updates?token=${token}`);

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onUpdate(data);
    };

    eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
    };

    return () => eventSource.close();
};

export default apiRequest;
