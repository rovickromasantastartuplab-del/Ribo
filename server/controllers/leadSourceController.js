import { supabase } from '../config/db.js';

export const getLeadSources = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query;

        let query = supabase
            .from('leadSources')
            .select('leadSourceId, name, description, status, createdAt')
            .eq('companyId', companyId);

        if (status) query = query.eq('status', status);

        const { data, error } = await query.order('name', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const createLeadSource = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { name, description, status = 'active' } = req.body;

        const { data, error } = await supabase
            .from('leadSources')
            .insert({
                companyId,
                name,
                description,
                status,
                createdBy: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, message: 'Lead source created', data });
    } catch (error) {
        next(error);
    }
};

export const updateLeadSource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const { name, description, status } = req.body;

        const { data, error } = await supabase
            .from('leadSources')
            .update({ name, description, status, updatedAt: new Date() })
            .eq('leadSourceId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: 'Lead source updated', data });
    } catch (error) {
        next(error);
    }
};

export const deleteLeadSource = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('leadSources')
            .delete()
            .eq('leadSourceId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Lead source deleted' });
    } catch (error) {
        next(error);
    }
};
