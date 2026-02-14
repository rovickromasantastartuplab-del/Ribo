import { supabase } from '../config/db.js';

export const getOpportunityStages = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query;

        let query = supabase
            .from('opportunityStages')
            .select('*')
            .eq('companyId', companyId)
            .order('probability', { ascending: true }); // Often sorted by probability/order

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

export const createOpportunityStage = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { name, color, probability, description, status = 'active' } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });

        const { data, error } = await supabase
            .from('opportunityStages')
            .insert([{
                companyId,
                name,
                color,
                probability: probability || 0,
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

export const updateOpportunityStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const updates = req.body;

        const { data, error } = await supabase
            .from('opportunityStages')
            .update(updates)
            .eq('opportunityStageId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Stage not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const deleteOpportunityStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        // Check availability (foreign key constraint usually handles this, but good to report clear error)
        // Ideally we check if opportunities exist with this stage first.

        const { error } = await supabase
            .from('opportunityStages')
            .delete()
            .eq('opportunityStageId', id)
            .eq('companyId', companyId);

        if (error) {
            if (error.code === '23503') { // Foreign key violation
                return res.status(400).json({ error: 'Cannot delete stage because it is used by existing opportunities.' });
            }
            throw error;
        }

        res.json({ success: true, message: 'Stage deleted successfully' });
    } catch (error) {
        next(error);
    }
};
