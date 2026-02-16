import api from './api';

export const leadService = {
    /**
     * Get all leads
     * @param {Object} params - Query params (page, limit, search, status)
     * @returns {Promise<Object>}
     */
    getAll: async (params = {}) => {
        const response = await api.get('/leads', { params });
        return response.data;
    },

    /**
     * Get a single lead by ID
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },

    /**
     * Create a new lead
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        const response = await api.post('/leads', data);
        return response.data;
    },

    /**
     * Update an existing lead
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        const response = await api.put(`/leads/${id}`, data);
        return response.data;
    },

    /**
     * Delete a lead
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
    },

    /**
     * Convert lead to account
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    convert: async (id) => {
        const response = await api.post(`/leads/${id}/convert-account`);
        return response.data;
    }
};
