import { supabase } from '../config/db.js';

// Get all target lists
export const getTargetLists = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status, search } = req.query;

        let query = supabase
            .from('targetLists')
            .select('*')
            .eq('companyId', companyId);

        // Filter by status
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Search by name
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        query = query.order('name', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Get single target list
export const getTargetList = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('targetLists')
            .select('*')
            .eq('targetListId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Target list not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create target list
export const createTargetList = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { name, description, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Target list name is required' });
        }

        const { data, error } = await supabase
            .from('targetLists')
            .insert([{
                companyId,
                name,
                description,
                status,
                createdBy: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Update target list
export const updateTargetList = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const { name, description, status } = req.body;

        const { data, error } = await supabase
            .from('targetLists')
            .update({
                name,
                description,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('targetListId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Target list not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete target list
export const deleteTargetList = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('targetLists')
            .delete()
            .eq('targetListId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Target list not found' });

        res.json({ success: true, message: 'Target list deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Toggle target list status
export const toggleTargetListStatus = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        // Get current status
        const { data: existing, error: fetchError } = await supabase
            .from('targetLists')
            .select('status')
            .eq('targetListId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return res.status(404).json({ success: false, error: 'Target list not found' });

        // Toggle status
        const newStatus = existing.status === 'active' ? 'inactive' : 'active';

        const { data, error } = await supabase
            .from('targetLists')
            .update({
                status: newStatus,
                updatedAt: new Date().toISOString()
            })
            .eq('targetListId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
