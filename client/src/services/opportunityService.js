import api from './api';

export const opportunityService = {
    /**
     * Get all opportunities
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    getAll: async (params = {}) => {
        const response = await api.get('/opportunities', { params });
        return response.data;
    },

    /**
     * Get single opportunity
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await api.get(`/opportunities/${id}`);
        return response.data;
    },

    /**
     * Create opportunity
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        const response = await api.post('/opportunities', data);
        return response.data;
    },

    /**
     * Update opportunity
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        const response = await api.put(`/opportunities/${id}`, data);
        return response.data;
    },

    /**
     * Delete opportunity
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const response = await api.delete(`/opportunities/${id}`);
        return response.data;
    }
};
