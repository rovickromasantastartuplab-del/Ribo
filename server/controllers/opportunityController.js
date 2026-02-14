import { supabase } from '../config/db.js';
import { logOpportunityActivity } from '../utils/activityLogger.js';

// Get all opportunities with filtering
export const getOpportunities = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { page = 1, limit = 10, search, status, accountId, stageId, sourceId, assignedTo, sort = 'createdAt', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('opportunities')
            .select(`
                *,
                account:accountId(name),
                contact:contactId(name),
                stage:opportunityStageId(name, color),
                source:opportunitySourceId(name),
                assignments:opportunityAssignments(
                    user:userId(userId, name, email, avatar)
                )
            `, { count: 'exact' })
            .eq('companyId', companyId);

        // Filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (accountId && accountId !== 'all') {
            query = query.eq('accountId', accountId);
        }

        if (stageId && stageId !== 'all') {
            query = query.eq('opportunityStageId', stageId);
        }

        if (sourceId && sourceId !== 'all') {
            query = query.eq('opportunitySourceId', sourceId);
        }

        if (assignedTo && assignedTo !== 'all') {
            // Inner join to filter by assignment
            query = supabase
                .from('opportunities')
                .select(`
                    *,
                    account:accountId(name),
                    contact:contactId(name),
                    stage:opportunityStageId(name, color),
                    source:opportunitySourceId(name),
                    assignments:opportunityAssignments!inner(
                        user:userId(userId, name, email, avatar)
                    )
                `, { count: 'exact' })
                .eq('companyId', companyId)
                .eq('assignments.userId', assignedTo);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, count, error } = await query
            .order(sort, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get single opportunity
export const getOpportunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { data, error } = await supabase
            .from('opportunities')
            .select(`
                *,
                account:accountId(name),
                contact:contactId(name),
                stage:opportunityStageId(name, color),
                source:opportunitySourceId(name),
                assignments:opportunityAssignments(
                    user:userId(userId, name, email, avatar)
                ),
                activities:opportunityActivities(
                    *,
                    user:userId(name, avatar)
                )
            `)
            .eq('opportunityId', id)
            .eq('companyId', companyId)
            // Order activities by newest first
            .order('createdAt', { foreignTable: 'opportunityActivities', ascending: false })
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Opportunity not found' });

        res.json({ success: true, data });

    } catch (error) {
        next(error);
    }
};

// Create opportunity
export const createOpportunity = async (req, res, next) => {
    try {
        const { companyId, user, userProfile } = req;
        const {
            name, description, amount, closeDate, notes,
            accountId, contactId, opportunityStageId, opportunitySourceId,
            status = 'active', assignedTo
        } = req.body;

        if (!name || !accountId || !opportunityStageId || !opportunitySourceId) {
            return res.status(400).json({ error: 'Name, Account, Stage, and Source are required' });
        }

        // 1. Create Opportunity
        const { data: opportunity, error: createError } = await supabase
            .from('opportunities')
            .insert([{
                companyId,
                name,
                description,
                amount,
                closeDate,
                notes,
                accountId,
                contactId,
                opportunityStageId,
                opportunitySourceId,
                status,
                createdBy: userProfile?.userId || user.id
            }])
            .select()
            .single();

        if (createError) throw createError;

        // 2. Handle Assignments
        if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
            const assignments = assignedTo.map(userId => ({
                opportunityId: opportunity.opportunityId,
                userId,
                assignedBy: userProfile?.userId || user.id
            }));

            const { error: assignError } = await supabase
                .from('opportunityAssignments')
                .insert(assignments);

            if (assignError) console.error('Error assigning users to opportunity:', assignError);
        }

        // 3. Log Activity
        await logOpportunityActivity(
            opportunity.opportunityId,
            userProfile?.userId || user.id,
            'CREATED',
            'Opportunity Created',
            `Created opportunity value ${amount || 0}`
        );

        res.status(201).json({ success: true, data: opportunity });

    } catch (error) {
        next(error);
    }
};

// Update opportunity
export const updateOpportunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId, userProfile, user } = req;
        const updates = req.body;
        const { assignedTo, ...fieldsToUpdate } = updates;

        // 1. Fetch current state for logging comparison (especially Stage)
        const { data: currentOpp, error: fetchError } = await supabase
            .from('opportunities')
            .select('opportunityStageId, amount, opportunityStage:opportunityStageId(name)')
            .eq('opportunityId', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Update Core Fields
        const { data: opportunity, error: updateError } = await supabase
            .from('opportunities')
            .update(fieldsToUpdate)
            .eq('opportunityId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Update Assignments
        if (assignedTo && Array.isArray(assignedTo)) {
            await supabase.from('opportunityAssignments').delete().eq('opportunityId', id);
            if (assignedTo.length > 0) {
                const assignments = assignedTo.map(userId => ({
                    opportunityId: id,
                    userId,
                    assignedBy: userProfile?.userId || user.id
                }));
                await supabase.from('opportunityAssignments').insert(assignments);
            }
        }

        // 4. Log Specific Activities
        const actorId = userProfile?.userId || user.id;

        // Stage Change Log
        if (fieldsToUpdate.opportunityStageId && fieldsToUpdate.opportunityStageId !== currentOpp.opportunityStageId) {
            // Fetch new stage name for clean log
            const { data: newStage } = await supabase
                .from('opportunityStages')
                .select('name')
                .eq('opportunityStageId', fieldsToUpdate.opportunityStageId)
                .single();

            await logOpportunityActivity(
                id, actorId, 'STAGE_CHANGED',
                'Stage Changed',
                `Moved from ${currentOpp.opportunityStage?.name} to ${newStage?.name}`
            );
        } else {
            // Generic update log
            await logOpportunityActivity(
                id, actorId, 'UPDATED',
                'Opportunity Updated',
                `Updated fields: ${Object.keys(fieldsToUpdate).join(', ')}`
            );
        }

        res.json({ success: true, data: opportunity });

    } catch (error) {
        next(error);
    }
};

export const deleteOpportunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('opportunities')
            .delete()
            .eq('opportunityId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Opportunity deleted successfully' });

    } catch (error) {
        next(error);
    }
};
