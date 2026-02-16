import { supabase } from '../config/db.js';

// Get all campaign types
export const getCampaignTypes = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status, search } = req.query;

        let query = supabase
            .from('campaignTypes')
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

// Get single campaign type
export const getCampaignType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('campaignTypes')
            .select('*')
            .eq('campaignTypeId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign type not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create campaign type
export const createCampaignType = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { name, description, color = '#3B82F6', status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Campaign type name is required' });
        }

        // Validate hex color format
        const hexColorRegex = /^#[0-9A-F]{6}$/i;
        if (color && !hexColorRegex.test(color)) {
            return res.status(400).json({ success: false, error: 'Invalid color format. Use hex format (e.g., #3B82F6)' });
        }

        const { data, error } = await supabase
            .from('campaignTypes')
            .insert([{
                companyId,
                name,
                description,
                color,
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

// Update campaign type
export const updateCampaignType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const { name, description, color, status } = req.body;

        // Validate hex color format if provided
        if (color) {
            const hexColorRegex = /^#[0-9A-F]{6}$/i;
            if (!hexColorRegex.test(color)) {
                return res.status(400).json({ success: false, error: 'Invalid color format. Use hex format (e.g., #3B82F6)' });
            }
        }

        const { data, error } = await supabase
            .from('campaignTypes')
            .update({
                name,
                description,
                color,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('campaignTypeId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign type not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete campaign type
export const deleteCampaignType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('campaignTypes')
            .delete()
            .eq('campaignTypeId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign type not found' });

        res.json({ success: true, message: 'Campaign type deleted successfully' });
    } catch (error) {
        next(error);
    }
};
