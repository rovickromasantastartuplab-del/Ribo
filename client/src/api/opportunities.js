import apiClient from './client';

/**
 * Opportunities API Service
 */
const opportunitiesAPI = {
    /**
     * Get all opportunities with pagination and filters
     * @param {object} params - Query parameters
     * @returns {Promise<{success: boolean, data: array, pagination: object}>}
     */
    async getOpportunities(params = {}) {
        const response = await apiClient.get('/opportunities', { params });
        return response.data;
    },

    /**
     * Get single opportunity by ID
     * @param {number} id - Opportunity ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async getOpportunityById(id) {
        const response = await apiClient.get(`/opportunities/${id}`);
        return response.data;
    },

    /**
     * Create new opportunity
     * @param {object} data - Opportunity data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async createOpportunity(data) {
        const response = await apiClient.post('/opportunities', data);
        return response.data;
    },

    /**
     * Update opportunity
     * @param {number} id - Opportunity ID
     * @param {object} data - Updated opportunity data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async updateOpportunity(id, data) {
        const response = await apiClient.put(`/opportunities/${id}`, data);
        return response.data;
    },

    /**
     * Delete opportunity
     * @param {number} id - Opportunity ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteOpportunity(id) {
        const response = await apiClient.delete(`/opportunities/${id}`);
        return response.data;
    },
};

export default opportunitiesAPI;
