import { supabase } from '../supabaseClient';

export const contactMessageService = {
    /**
     * Get all contact messages
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    getAll: async (params = {}) => {
        let query = supabase
            .from('contact_messages')
            .select('*', { count: 'exact' });

        // Apply filters
        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
        }

        // Pagination
        const page = params.page || 1;
        const limit = params.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, count, error } = await query;

        if (error) throw error;

        return {
            data: data,
            meta: {
                total: count,
                per_page: limit,
                current_page: page,
                last_page: Math.ceil(count / limit),
                from: from + 1,
                to: Math.min(to + 1, count)
            }
        };
    },

    /**
     * Get single contact message
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    get: async (id) => {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete contact message
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
};
