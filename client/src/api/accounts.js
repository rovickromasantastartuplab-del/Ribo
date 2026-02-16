import apiClient from './client';

/**
 * Accounts API Service
 */
const accountsAPI = {
    /**
     * Get all accounts with pagination and filters
     * @param {object} params - Query parameters
     * @returns {Promise<{success: boolean, data: array, pagination: object}>}
     */
    async getAccounts(params = {}) {
        const response = await apiClient.get('/accounts', { params });
        return response.data;
    },

    /**
     * Get single account by ID
     * @param {number} id - Account ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async getAccountById(id) {
        const response = await apiClient.get(`/accounts/${id}`);
        return response.data;
    },

    /**
     * Create new account
     * @param {object} data - Account data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async createAccount(data) {
        const response = await apiClient.post('/accounts', data);
        return response.data;
    },

    /**
     * Update account
     * @param {number} id - Account ID
     * @param {object} data - Updated account data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async updateAccount(id, data) {
        const response = await apiClient.put(`/accounts/${id}`, data);
        return response.data;
    },

    /**
     * Delete account
     * @param {number} id - Account ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteAccount(id) {
        const response = await apiClient.delete(`/accounts/${id}`);
        return response.data;
    },
};

export default accountsAPI;
