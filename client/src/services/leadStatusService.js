import api from './api';

export const leadStatusService = {
    getAll: async (params) => {
        const response = await api.get('/lead-statuses', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/lead-statuses', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/lead-statuses/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/lead-statuses/${id}`);
        return response.data;
    }
};
