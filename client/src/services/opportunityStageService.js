import api from './api';

export const opportunityStageService = {
    /**
     * Get all opportunity stages
     * @returns {Promise<Object>}
     */
    getAll: async (params) => {
        const response = await api.get('/opportunity-stages', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/opportunity-stages', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/opportunity-stages/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/opportunity-stages/${id}`);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await api.put(`/opportunity-stages/${id}/toggle-status`);
        return response.data;
    }
};
