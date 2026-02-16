import api from './api';

export const leadSourceService = {
    getAll: async (params) => {
        const response = await api.get('/lead-sources', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/lead-sources', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/lead-sources/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/lead-sources/${id}`);
        return response.data;
    }
};
