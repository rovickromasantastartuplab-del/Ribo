import apiClient from './client';

/**
 * Configuration API Service
 * Handles lead statuses, sources, account types/industries, opportunity stages/sources
 */
const configAPI = {
    // Lead Statuses
    async getLeadStatuses() {
        const response = await apiClient.get('/lead-statuses');
        return response.data;
    },

    async createLeadStatus(data) {
        const response = await apiClient.post('/lead-statuses', data);
        return response.data;
    },

    async updateLeadStatus(id, data) {
        const response = await apiClient.put(`/lead-statuses/${id}`, data);
        return response.data;
    },

    async deleteLeadStatus(id) {
        const response = await apiClient.delete(`/lead-statuses/${id}`);
        return response.data;
    },

    // Lead Sources
    async getLeadSources() {
        const response = await apiClient.get('/lead-sources');
        return response.data;
    },

    async createLeadSource(data) {
        const response = await apiClient.post('/lead-sources', data);
        return response.data;
    },

    async updateLeadSource(id, data) {
        const response = await apiClient.put(`/lead-sources/${id}`, data);
        return response.data;
    },

    async deleteLeadSource(id) {
        const response = await apiClient.delete(`/lead-sources/${id}`);
        return response.data;
    },

    // Account Configuration (Types & Industries)
    async getAccountTypes() {
        const response = await apiClient.get('/account-config/types');
        return response.data;
    },

    async getAccountIndustries() {
        const response = await apiClient.get('/account-config/industries');
        return response.data;
    },

    async createAccountType(data) {
        const response = await apiClient.post('/account-config/types', data);
        return response.data;
    },

    async createAccountIndustry(data) {
        const response = await apiClient.post('/account-config/industries', data);
        return response.data;
    },

    // Opportunity Configuration (Stages & Sources)
    async getOpportunityStages() {
        const response = await apiClient.get('/opportunities/stages');
        return response.data;
    },

    async getOpportunitySources() {
        const response = await apiClient.get('/opportunities/sources');
        return response.data;
    },
};

export default configAPI;
