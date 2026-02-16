import apiClient from './client';

/**
 * Users API Service
 */
const usersAPI = {
    /**
     * Get all users (for dropdowns, assignments, etc.)
     * @param {object} params - Query parameters
     * @returns {Promise<{success: boolean, data: array}>}
     */
    async getUsers(params = {}) {
        const response = await apiClient.get('/users', { params });
        return response.data;
    },

    /**
     * Get single user by ID
     * @param {number} id - User ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async getUserById(id) {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Create new user
     * @param {object} data - User data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async createUser(data) {
        const response = await apiClient.post('/users', data);
        return response.data;
    },

    /**
     * Update user
     * @param {number} id - User ID
     * @param {object} data - Updated user data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async updateUser(id, data) {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Delete user
     * @param {number} id - User ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteUser(id) {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },
};

export default usersAPI;
