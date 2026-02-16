import { supabase } from '../config/db.js';

// ==========================================
// PLAN REQUEST MANAGEMENT
// ==========================================

/**
 * Create a Plan Request
 * Access: Company Admin
 */
export const createPlanRequest = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile; // from companyContext
        const { planId, billingCycle, message } = req.body;

        if (!planId || !billingCycle) {
            return res.status(400).json({ success: false, error: 'Plan ID and Billing Cycle are required' });
        }

        // Validate Billing Cycle
        if (!['monthly', 'yearly'].includes(billingCycle)) {
            return res.status(400).json({ success: false, error: 'Invalid Billing Cycle' });
        }

        // 1. Check if Plan Exists (Lean query)
        const { count, error: planError } = await supabase
            .from('plans')
            .select('*', { count: 'exact', head: true })
            .eq('planId', planId);

        if (planError || count === 0) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        // 2. Create Request
        const { data: request, error } = await supabase
            .from('planRequests')
            .insert([{
                companyId,
                planId,
                billingCycle,
                message,
                status: 'pending',
                requestedAt: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: request,
            message: 'Plan request submitted successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * List Plan Requests
 * Access: Superadmin (All) OR Company Admin (Own)
 */
export const getPlanRequests = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const {
            page = 1,
            limit = 10,
            status,
            companyId: queryCompanyId
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 50); // Hard limit 50
        const offset = (pageNum - 1) * limitNum;

        let query = supabase
            .from('planRequests')
            .select('*, plan:planId(name, price), company:companyId(name)', { count: 'exact' });

        // Security / Filters
        if (userProfile.type === 'superadmin') {
            // Superadmin can filter by company
            if (queryCompanyId) {
                query = query.eq('companyId', queryCompanyId);
            }
        } else {
            // Company Admin sees ONLY their own
            query = query.eq('companyId', userProfile.companyId);
        }

        // Status Filter
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Execute with Pagination
        const { data: requests, error, count } = await query
            .order('requestedAt', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: requests,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum)
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update Request Status (Approve/Reject)
 * Access: Superadmin Only
 */
export const updatePlanRequestStatus = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;
        const { status, notes } = req.body;

        if (userProfile.type !== 'superadmin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const { data: updatedRequest, error } = await supabase
            .from('planRequests')
            .update({
                status,
                notes,
                processedBy: userProfile.userId,
                processedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('planRequestId', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: updatedRequest,
            message: `Request ${status} successfully`
        });

    } catch (error) {
        next(error);
    }
};
