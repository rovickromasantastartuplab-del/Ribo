import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Important: sends cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - redirect to login
                console.error('Unauthorized access - redirecting to login');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden - insufficient permissions');
            } else if (status === 404) {
                console.error('Resource not found');
            } else if (status >= 500) {
                console.error('Server error:', data.error || 'Unknown error');
            }

            return Promise.reject(data || error);
        } else if (error.request) {
            // Request made but no response
            console.error('Network error - no response from server');
            return Promise.reject({ error: 'Network error. Please check your connection.' });
        } else {
            // Something else happened
            console.error('Request error:', error.message);
            return Promise.reject({ error: error.message });
        }
    }
);

export default apiClient;
