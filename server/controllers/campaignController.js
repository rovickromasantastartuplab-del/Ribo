import { supabase } from '../config/db.js';

// Get all campaigns with joins (prevent N+1)
export const getCampaigns = async (req, res, next) => {
    try {
        const { companyId } = req;
        const {
            status,
            typeId,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        // Enforce pagination limits
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
        const offset = (pageNum - 1) * limitNum;

        // Build query with joins to prevent N+1
        let query = supabase
            .from('campaigns')
            .select(`
                *,
                campaignType:campaignTypeId(campaignTypeId, name, color),
                targetList:targetListId(targetListId, name, description),
                creator:createdBy(userId, name, email),
                assignments:campaignAssignments(
                    user:userId(userId, name, email, avatar)
                )
            `, { count: 'exact' })
            .eq('companyId', companyId);

        // Filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (typeId) {
            query = query.eq('campaignTypeId', typeId);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        if (startDate) {
            query = query.gte('startDate', startDate);
        }

        if (endDate) {
            query = query.lte('endDate', endDate);
        }

        // Pagination
        query = query
            .order('createdAt', { ascending: false })
            .range(offset, offset + limitNum - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data,
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

// Get single campaign with joins
export const getCampaign = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('campaigns')
            .select(`
                *,
                campaignType:campaignTypeId(campaignTypeId, name, color, description),
                targetList:targetListId(targetListId, name, description),
                creator:createdBy(userId, name, email),
                assignments:campaignAssignments(
                    user:userId(userId, name, email, avatar)
                )
            `)
            .eq('campaignId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create campaign
export const createCampaign = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const {
            name,
            description,
            startDate,
            endDate,
            budget,
            actualCost = 0,
            expectedResponse = 0,
            actualResponse = 0,
            campaignTypeId,
            targetListId,
            status = 'active',
            assignees = [] // Array of User IDs
        } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ success: false, error: 'Campaign name is required' });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'Start date and end date are required' });
        }

        if (!campaignTypeId) {
            return res.status(400).json({ success: false, error: 'Campaign type is required' });
        }

        // Validate date range
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ success: false, error: 'End date must be after or equal to start date' });
        }

        // 1. Create campaign
        const { data, error } = await supabase
            .from('campaigns')
            .insert([{
                companyId,
                name,
                description,
                startDate,
                endDate,
                budget,
                actualCost,
                expectedResponse,
                actualResponse,
                campaignTypeId,
                targetListId,
                status,
                createdBy: user.id
            }])
            .select(`
                *,
                campaignType:campaignTypeId(campaignTypeId, name, color),
                targetList:targetListId(targetListId, name, description),
                creator:createdBy(userId, name, email)
            `)
            .single();

        if (error) throw error;

        // 2. Handle Assignments (Pivot Table)
        if (assignees.length > 0) {
            const assignmentRows = assignees.map(userId => ({
                campaignId: data.campaignId,
                userId: userId,
                assignedBy: user.id
            }));

            const { error: assignError } = await supabase
                .from('campaignAssignments')
                .insert(assignmentRows);

            if (assignError) throw assignError;
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Update campaign
export const updateCampaign = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const {
            name,
            description,
            startDate,
            endDate,
            budget,
            actualCost,
            expectedResponse,
            actualResponse,
            campaignTypeId,
            targetListId,
            status,
            assignees // Array of User IDs (Optional)
        } = req.body;

        // Validate date range if both dates provided
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ success: false, error: 'End date must be after or equal to start date' });
        }

        // 1. Update campaign
        const { data, error } = await supabase
            .from('campaigns')
            .update({
                name,
                description,
                startDate,
                endDate,
                budget,
                actualCost,
                expectedResponse,
                actualResponse,
                campaignTypeId,
                targetListId,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('campaignId', id)
            .eq('companyId', companyId)
            .select(`
                *,
                campaignType:campaignTypeId(campaignTypeId, name, color),
                targetList:targetListId(targetListId, name, description),
                creator:createdBy(userId, name, email)
            `)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign not found' });

        // 2. Sync Assignments (If Provided)
        if (assignees !== undefined) {
            // Delete existing
            await supabase
                .from('campaignAssignments')
                .delete()
                .eq('campaignId', id);

            // Insert new
            if (assignees.length > 0) {
                const assignmentRows = assignees.map(userId => ({
                    campaignId: id,
                    userId: userId,
                    assignedBy: req.user.id
                }));

                await supabase.from('campaignAssignments').insert(assignmentRows);
            }
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete campaign
export const deleteCampaign = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('campaigns')
            .delete()
            .eq('campaignId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Campaign not found' });

        res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Toggle campaign status
export const toggleCampaignStatus = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        // Get current status
        const { data: existing, error: fetchError } = await supabase
            .from('campaigns')
            .select('status')
            .eq('campaignId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return res.status(404).json({ success: false, error: 'Campaign not found' });

        // Toggle status
        const newStatus = existing.status === 'active' ? 'inactive' : 'active';

        const { data, error } = await supabase
            .from('campaigns')
            .update({
                status: newStatus,
                updatedAt: new Date().toISOString()
            })
            .eq('campaignId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
