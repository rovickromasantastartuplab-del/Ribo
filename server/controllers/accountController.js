import { supabase } from '../config/db.js';
import { logAccountActivity } from '../utils/activityLogger.js'; // We'll need to create this helper or use a generic one

// Helper to log activity (Using imported logAccountActivity)

// Get all accounts with pagination, filtering, and sorting
export const getAccounts = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { page = 1, limit = 10, search, status, type, industry, assignedTo, sort = 'createdAt', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        // Start building the query
        let query = supabase
            .from('accounts')
            .select(`
                *,
                accountType:accountTypeId(name, color),
                accountIndustry:accountIndustryId(name),
                assignments:accountAssignments(
                    user:userId(userId, name, email, avatar)
                )
            `, { count: 'exact' })
            .eq('companyId', companyId);

        // Apply Filters
        if (status && status !== 'all') query = query.eq('status', status);
        if (type && type !== 'all') query = query.eq('accountTypeId', type);
        if (industry && industry !== 'all') query = query.eq('accountIndustryId', industry);

        // Search (Name, Email, Phone)
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        // Assignment Filter
        if (assignedTo === 'my') {
            // Complex: "My Accounts" logic needs to check the pivot table
            // Supabase postgREST can filter on related tables using !inner join
            query = supabase
                .from('accounts')
                .select(`
                    *,
                    accountType:accountTypeId(name, color),
                    accountIndustry:accountIndustryId(name),
                    assignments:accountAssignments!inner(userId)
                `, { count: 'exact' })
                .eq('companyId', companyId)
                .eq('assignments.userId', req.user.id);
        } else if (assignedTo && assignedTo !== 'all') {
            query = supabase
                .from('accounts')
                .select(`
                    *,
                    accountType:accountTypeId(name, color),
                    accountIndustry:accountIndustryId(name),
                    assignments:accountAssignments!inner(userId)
                `, { count: 'exact' })
                .eq('companyId', companyId)
                .eq('assignments.userId', assignedTo);
        }

        // Apply Sorting & Pagination
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

// Get Single Account Details
export const getAccountById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { data, error } = await supabase
            .from('accounts')
            .select(`
                *,
                accountType:accountTypeId(name, color),
                accountIndustry:accountIndustryId(name),
                assignments:accountAssignments(
                    user:userId(userId, name, email, avatar)
                ),
                activities:accountActivities(
                    title, description, activityType, createdAt,
                    user:userId(name, avatar)
                )
            `)
            .eq('accountId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        next(error);
    }
};

// Create Account
export const createAccount = async (req, res, next) => {
    try {
        const { companyId } = req;
        const {
            name, email, phone, website,
            accountTypeId, accountIndustryId,
            billingAddress, shippingAddress,
            status = 'active',
            assignees = [] // Array of User IDs
        } = req.body;

        // 1. Insert Account
        const { data: account, error: createError } = await supabase
            .from('accounts')
            .insert({
                companyId,
                name, email, phone, website,
                accountTypeId, accountIndustryId,
                billingAddress, shippingAddress,
                status,
                createdBy: req.user.id
            })
            .select()
            .single();

        if (createError) throw createError;

        // 2. Handle Assignments (Pivot Table)
        if (assignees.length > 0) {
            const assignmentRows = assignees.map(userId => ({
                accountId: account.accountId,
                userId: userId,
                assignedBy: req.user.id
            }));

            const { error: assignError } = await supabase
                .from('accountAssignments')
                .insert(assignmentRows);

            if (assignError) throw assignError;
        }

        // 3. Log Activity
        await logAccountActivity(
            account.accountId, req.user.id, 'created',
            'Account Created',
            `Account ${name} was created.`
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: account
        });

    } catch (error) {
        next(error);
    }
};

// Update Account
export const updateAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;
        const {
            name, email, phone, website,
            accountTypeId, accountIndustryId,
            billingAddress, shippingAddress,
            status,
            assignees // Array of User IDs (Optional)
        } = req.body;

        // 1. Update Core Fields
        const updates = {
            name, email, phone, website,
            accountTypeId, accountIndustryId,
            billingAddress, shippingAddress,
            status,
            updatedAt: new Date()
        };

        // Remove undefined keys
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const { data: account, error: updateError } = await supabase
            .from('accounts')
            .update(updates)
            .eq('accountId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 2. Sync Assignments (If Provided)
        if (assignees) {
            // Delete existing
            await supabase
                .from('accountAssignments')
                .delete()
                .eq('accountId', id);

            // Insert new
            if (assignees.length > 0) {
                const assignmentRows = assignees.map(userId => ({
                    accountId: id,
                    userId: userId,
                    assignedBy: req.user.id
                }));

                await supabase.from('accountAssignments').insert(assignmentRows);
            }

            await logAccountActivity(id, req.user.id, 'assignments_updated', 'Assignments Updated', 'Account assignments were modified.');
        }

        // 3. Log General Update
        await logAccountActivity(id, req.user.id, 'updated', 'Account Updated', 'Account details were updated.');

        res.json({
            success: true,
            message: 'Account updated successfully',
            data: account
        });

    } catch (error) {
        next(error);
    }
};

// Delete Account
export const deleteAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('accountId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};
