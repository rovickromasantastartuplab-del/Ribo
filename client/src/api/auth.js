import apiClient from './client';
import { supabase } from '../supabaseClient';

/**
 * Authentication API Service
 */
const authAPI = {
    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{user: object, session: object}>}
     */
    async login(email, password) {
        // Step 1: Sign in with Supabase to get tokens
        const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (supabaseError) {
            throw supabaseError;
        }

        // Step 2: Send tokens to backend to set cookies
        const response = await apiClient.post('/auth/login', {
            access_token: supabaseData.session.access_token,
            refresh_token: supabaseData.session.refresh_token,
        });

        return response.data;
    },

    /**
     * Register new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     * @returns {Promise<{user: object}>}
     */
    async register(email, password, name) {
        const response = await apiClient.post('/auth/register', {
            email,
            password,
            name,
        });

        return response.data;
    },

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
        // Call backend logout to clear cookies
        await apiClient.post('/auth/logout');

        // Also sign out from Supabase client
        await supabase.auth.signOut();
    },

    /**
     * Get current user profile
     * @returns {Promise<{user: object}>}
     */
    async getMe() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email 
     * @returns {Promise<{message: string}>}
     */
    async requestPasswordReset(email) {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password
     * @param {string} access_token 
     * @param {string} new_password 
     * @returns {Promise<{message: string}>}
     */
    async resetPassword(access_token, new_password) {
        const response = await apiClient.post('/auth/reset-password', {
            access_token,
            new_password,
        });
        return response.data;
    },
};

export default authAPI;
