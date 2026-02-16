import api from './api';

export const userService = {
    getAll: async (params) => {
        const response = await api.get('/users', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
    toggleStatus: async (id, status) => {
        const response = await api.put(`/users/${id}`, { status });
        return response.data;
    },
    resetPassword: async (id, data) => {
        // Assuming backend handles this via a specific route or general update
        // Legacy often used: PUT /users/{id}/password or similar, or just update
        // Based on my previous reading, I'll stick to a standard update or specific if known.
        // Let's use a specific endpoint if possible, but for now map to what I saw in code:
        // axios.put(`/api/users/${currentItem.id}`, { ...data, is_password_reset: true });
        const response = await api.put(`/users/${id}`, { ...data, is_password_reset: true });
        return response.data;
    }
};
