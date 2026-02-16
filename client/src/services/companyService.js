import { supabase } from '../supabaseClient';
import api from './api';

export const companyService = {
    /**
     * Get all companies (Direct Supabase Call to bypass missing backend endpoint)
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    getAll: async (params = {}) => {
        let query = supabase
            .from('companies')
            .select('*', { count: 'exact' });

        // Apply filters if needed
        if (params.search) {
            query = query.ilike('name', `%${params.search}%`);
        }
        if (params.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }

        // Pagination
        const page = params.page || 1;
        const limit = params.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;

        // Return structure matching API response format for consistency
        return {
            data: data,
            meta: {
                total: count,
                per_page: limit,
                current_page: page,
                last_page: Math.ceil(count / limit)
            }
        };
    },

    /**
     * Create company (Direct Supabase Call to bypass onboarding logic)
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        // We use direct insert because /api/companies triggers 'onboarding' RPC 
        // which might re-assign the current user or fail for existing users.
        const { name, email, password, enableLogin } = data;

        // 1. Create Company
        const { data: newCompany, error } = await supabase
            .from('companies')
            .insert({
                name,
                email,
                status: 'active' // Default to active as requested
            })
            .select() // vital to return the created object
            .single();

        if (error) throw error;

        // 2. Handle User Creation (Enable Login)
        if (enableLogin && password) {
            // NOTE: Creating a user with a specific password for a *different* company
            // is not supported by the current backend (inviteUser only).
            // We log this limitation for now.
            console.warn("User creation with password skipped: Backend requires invite flow.");
            // Ideally, we would call an implementation of 'createUser' here if backend supported it.
        }

        return newCompany;
    },

    /**
     * Update company (Direct Supabase Call)
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        const { data: updatedData, error } = await supabase
            .from('companies')
            .update(data)
            .eq('companyId', id) // Assuming primary key is companyId based on controller
            .select()
            .single();

        if (error) throw error;
        return updatedData;
    },

    /**
     * Delete company (Direct Supabase Call)
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('companyId', id);

        if (error) throw error;
        return { success: true };
    }
};
