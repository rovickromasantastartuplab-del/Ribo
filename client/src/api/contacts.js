import apiClient from './client';

/**
 * Contacts API Service
 */
const contactsAPI = {
    /**
     * Get all contacts with pagination and filters
     * @param {object} params - Query parameters
     * @returns {Promise<{success: boolean, data: array, pagination: object}>}
     */
    async getContacts(params = {}) {
        const response = await apiClient.get('/contacts', { params });
        return response.data;
    },

    /**
     * Get single contact by ID
     * @param {number} id - Contact ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async getContactById(id) {
        const response = await apiClient.get(`/contacts/${id}`);
        return response.data;
    },

    /**
     * Create new contact
     * @param {object} data - Contact data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async createContact(data) {
        const response = await apiClient.post('/contacts', data);
        return response.data;
    },

    /**
     * Update contact
     * @param {number} id - Contact ID
     * @param {object} data - Updated contact data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async updateContact(id, data) {
        const response = await apiClient.put(`/contacts/${id}`, data);
        return response.data;
    },

    /**
     * Delete contact
     * @param {number} id - Contact ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteContact(id) {
        const response = await apiClient.delete(`/contacts/${id}`);
        return response.data;
    },
};

export default contactsAPI;
