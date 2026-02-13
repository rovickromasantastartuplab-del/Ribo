import { supabase } from '../config/db.js';

/**
 * Get all lead statuses for the current company.
 * Optimized: Fetches only necessary fields, ordered by name.
 */
export const getLeadStatuses = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status } = req.query; // Optional filter: 'active' or 'inactive'

        let query = supabase
            .from('leadStatuses')
            .select('leadStatusId, name, color, description, status')
            .eq('companyId', companyId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new lead status.
 * Optimized: standard insert with returning minimal needed data.
 */
export const createLeadStatus = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { name, color = '#3B82F6', description, status = 'active' } = req.body;

        const { data, error } = await supabase
            .from('leadStatuses')
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
            message: 'Lead status created successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a lead status.
 */
export const updateLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const { name, color, description, status } = req.body;

        const { data, error } = await supabase
            .from('leadStatuses')
            .update({
                name,
                color,
                description,
                status,
                updatedAt: new Date()
            })
            .eq('leadStatusId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Lead status updated successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a lead status.
 */
export const deleteLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('leadStatuses')
            .delete()
            .eq('leadStatusId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Lead status deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
