# 🔌 Frontend-to-Backend Integration Guide

## 1. The Concept: "HttpOnly Cookies"
We use **HttpOnly Cookies** for security. This means:
1.  **Browser:** Cannot read the token via JavaScript (prevents XSS attacks).
2.  **Browser:** Automatically sends the cookie with every request **IF** you tell it to.

---

## 2. **Copy-Paste Ready: The Best Practice**

Do not scatter `fetch` calls everywhere. Create a centralized API file.

### 📄 File: `src/services/api.js`

```javascript
import axios from 'axios';

// 1. Create the instance
const api = axios.create({
    baseURL: 'http://localhost:4000/api', // Maintain this in .env
    withCredentials: true, // 👈 CRITICAL: Sends the HttpOnly cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. Add a response interceptor (Optional but Recommended)
// This handles "Session Expired" errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.warn("Session expired. Redirecting to login...");
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// 3. Export API methods
export const DashboardAPI = {
    getSummary: () => api.get('/dashboard/summary'),
    getRevenue: () => api.get('/dashboard/revenue'),
    getCharts:  () => api.get('/dashboard/charts'),
};

export const CompanyAPI = {
    create: (data) => api.post('/companies', data),
};

export default api;
```

---

### 📄 File: `src/pages/Dashboard.jsx` (How to use it)

```jsx
import { useEffect, useState } from 'react';
import { DashboardAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 👇 Clean one-liner!
                // No need to pass tokens, headers, or anything.
                const { data } = await DashboardAPI.getSummary();
                
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="card">Leads: {stats?.totalLeads}</div>
                <div className="card">Sales: ${stats?.totalRevenue}</div>
            </div>
        </div>
    );
};

export default Dashboard;
```

---

## 3. The Backend Journey (For your understanding)

When `DashboardAPI.getSummary()` is called:

1.  **Frontend**: Axios sends request + `access_token` cookie.
2.  **`server.js`**: `cookieParser` reads cookie -> puts in `req.cookies`.
3.  **`authMiddleware`**: Decodes cookie -> sets `req.user`.
4.  **`context.js`**: Checks `req.user` -> fetches full `req.userProfile` (Zero-DB if cached).
5.  **`dashboardController`**:
    ```javascript
    const { companyId } = req.userProfile; // It's just there! ✨
    ```
6.  **Response**: Sends back JSON data.

## 4. Troubleshooting
-   **401 Unauthorized?** You forgot `withCredentials: true`.
-   **CORS Error?** Check `server.js` -> `cors({ origin: ... })`. It must match your frontend URL exactly.
