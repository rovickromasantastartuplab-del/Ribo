import { supabase } from '../config/db.js';

export const getOpportunitySources = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query;

        let query = supabase
            .from('opportunitySources')
            .select('*')
            .eq('companyId', companyId)
            .order('name', { ascending: true });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const createOpportunitySource = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { name, description, status = 'active' } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });

        const { data, error } = await supabase
            .from('opportunitySources')
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

export const updateOpportunitySource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const updates = req.body;

        const { data, error } = await supabase
            .from('opportunitySources')
            .update(updates)
            .eq('opportunitySourceId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Source not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const deleteOpportunitySource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('opportunitySources')
            .delete()
            .eq('opportunitySourceId', id)
            .eq('companyId', companyId);

        if (error) {
            if (error.code === '23503') {
                return res.status(400).json({ error: 'Cannot delete source because it is used by existing opportunities.' });
            }
            throw error;
        }

        res.json({ success: true, message: 'Source deleted successfully' });
    } catch (error) {
        next(error);
    }
};
