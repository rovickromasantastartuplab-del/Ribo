import { supabase } from '../config/db.js';

// Get all account types
export const getAccountTypes = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query;

        let query = supabase
            .from('accountTypes')
            .select('accountTypeId, name, color, description, status')
            .eq('companyId', companyId);

        if (status) {
            query = query.eq('status', status);
        }

        // OPTIMIZATION: Limit results to prevent massive payloads
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

// Create a new account type
export const createAccountType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { name, color = '#3B82F6', description, status = 'active' } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const { data, error } = await supabase
            .from('accountTypes')
            .insert({
                companyId,
                name,
                color,
                description,
                status,
                createdBy: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Account type created successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// Update an account type
export const updateAccountType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const { name, color, description, status } = req.body;

        const { data, error } = await supabase
            .from('accountTypes')
            .update({
                name,
                color,
                description,
                status,
                updatedAt: new Date()
            })
            .eq('accountTypeId', id)
            .eq('companyId', companyId) // SECURITY: Ensure ownership
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Account type updated successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// Delete an account type
export const deleteAccountType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        // OPTIMIZATION: Check for usage before delete (Optional but good for data integrity)
        // For now, relying on FK constraints (ON DELETE SET NULL in schema)

        const { error } = await supabase
            .from('accountTypes')
            .delete()
            .eq('accountTypeId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Account type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
