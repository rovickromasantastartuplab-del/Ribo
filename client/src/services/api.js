import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Important: This sends cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for handling 401s (optional auto-logout logic can go here)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we are not already on the login page to avoid loops
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                // Optional: Trigger a global logout event or redirect
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;
