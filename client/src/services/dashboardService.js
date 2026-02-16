import api from './api';

export const dashboardService = {
    /**
     * Get dashboard summary stats (Revenue, Companies, etc.)
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        const response = await api.get('/dashboard/summary');
        return response.data;
    },

    /**
     * Get revenue analytics data for charts
     * @returns {Promise<Object>}
     */
    getRevenueAnalytics: async () => {
        const response = await api.get('/dashboard/revenue');
        return response.data;
    },

    /**
     * Get recent activity logs
     * @returns {Promise<Object>}
     */
    getRecentActivity: async () => {
        const response = await api.get('/dashboard/recent-activity');
        return response.data;
    },

    /**
     * Get dashboard detailed lists (Recent Sales, Projects, etc.)
     * @returns {Promise<Object>}
     */
    getDashboardLists: async () => {
        const response = await api.get('/dashboard/lists');
        return response.data;
    },

    /**
     * Get data for dashboard charts (Customer/Employee distribution)
     * @returns {Promise<Object>}
     */
    getCharts: async () => {
        const response = await api.get('/dashboard/charts');
        return response.data;
    }
};
