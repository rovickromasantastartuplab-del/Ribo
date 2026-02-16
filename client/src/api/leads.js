import apiClient from './client';

/**
 * Leads API Service
 */
const leadsAPI = {
    /**
     * Get all leads with pagination and filters
     * @param {object} params - Query parameters (page, limit, search, status, source, sort, order)
     * @returns {Promise<{success: boolean, data: array, pagination: object}>}
     */
    async getLeads(params = {}) {
        const response = await apiClient.get('/leads', { params });
        return response.data;
    },

    /**
     * Get single lead by ID
     * @param {number} id - Lead ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async getLeadById(id) {
        const response = await apiClient.get(`/leads/${id}`);
        return response.data;
    },

    /**
     * Create new lead
     * @param {object} data - Lead data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async createLead(data) {
        const response = await apiClient.post('/leads', data);
        return response.data;
    },

    /**
     * Update lead
     * @param {number} id - Lead ID
     * @param {object} data - Updated lead data
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async updateLead(id, data) {
        const response = await apiClient.put(`/leads/${id}`, data);
        return response.data;
    },

    /**
     * Delete lead
     * @param {number} id - Lead ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteLead(id) {
        const response = await apiClient.delete(`/leads/${id}`);
        return response.data;
    },

    /**
     * Convert lead to account
     * @param {number} id - Lead ID
     * @param {object} data - Account data (accountTypeId, website, address)
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async convertToAccount(id, data) {
        const response = await apiClient.post(`/leads/${id}/convert-to-account`, data);
        return response.data;
    },

    /**
     * Convert lead to contact
     * @param {number} id - Lead ID
     * @param {object} data - Contact data (accountId, position, address)
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async convertToContact(id, data) {
        const response = await apiClient.post(`/leads/${id}/convert-to-contact`, data);
        return response.data;
    },

    /**
     * Export leads to CSV
     * @param {object} params - Query parameters (search, status, source, sort, order)
     * @returns {Promise<Blob>}
     */
    async exportLeads(params = {}) {
        const response = await apiClient.get('/leads/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Import leads from JSON
     * @param {array} leads - Array of lead objects
     * @returns {Promise<{success: boolean, message: string, count: number}>}
     */
    async importLeads(leads) {
        const response = await apiClient.post('/leads/import', { leads });
        return response.data;
    },
};

export default leadsAPI;
