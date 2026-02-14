import { supabase } from '../config/db.js';

// Get all account industries
export const getAccountIndustries = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query;

        let query = supabase
            .from('accountIndustries')
            .select('accountIndustryId, name, description, status')
            .eq('companyId', companyId);

        if (status) {
            query = query.eq('status', status);
        }

        // OPTIMIZATION: Limit results
        const { data, error } = await query
            .order('name', { ascending: true })
            .limit(100);

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// Create a new account industry
export const createAccountIndustry = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { name, description, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const { data, error } = await supabase
            .from('accountIndustries')
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

        res.status(201).json({
            success: true,
            message: 'Account industry created successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// Update an account industry
export const updateAccountIndustry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const { name, description, status } = req.body;

        const { data, error } = await supabase
            .from('accountIndustries')
            .update({
                name,
                description,
                status,
                updatedAt: new Date()
            })
            .eq('accountIndustryId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Account industry updated successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// Delete an account industry
export const deleteAccountIndustry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('accountIndustries')
            .delete()
            .eq('accountIndustryId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Account industry deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
