import api from './api';

export const opportunitySourceService = {
    getAll: async (params) => {
        const response = await api.get('/opportunity-sources', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/opportunity-sources', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/opportunity-sources/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/opportunity-sources/${id}`);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await api.put(`/opportunity-sources/${id}/toggle-status`);
        return response.data;
    }
};
