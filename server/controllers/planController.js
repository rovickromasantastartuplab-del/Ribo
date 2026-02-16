import { supabase } from '../config/db.js';

// ==========================================
// PLAN MANAGEMENT CONTROLLER
// ==========================================
// Handles subscription plan CRUD operations
// Following Backend Optimization Guide patterns
// ==========================================

/**
 * List all plans
 * - Superadmin: See all plans
 * - Company users: See only active plans
 * - Supports billing cycle toggle (monthly/yearly)
 * - Pagination enforced (max 100)
 */
export const getPlans = async (req, res, next) => {
    try {
        const { userProfile, companyId } = req;
        const {
            billingCycle = 'monthly',
            page = 1,
            limit = 10,
            search
        } = req.query;

        // Enforce pagination limits
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const offset = (pageNum - 1) * limitNum;

        // Build query
        let query = supabase
            .from('plans')
            .select('*', { count: 'exact' });

        // Company users see only active plans
        if (userProfile?.type !== 'superadmin') {
            query = query.eq('isActive', true);
        }

        // Search filter
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Pagination
        query = query
            .order('price', { ascending: true })
            .range(offset, offset + limitNum - 1);

        const { data: plans, error, count } = await query;

        if (error) throw error;

        // Get subscriber counts for each plan (parallel execution)
        const planIds = plans.map(p => p.planId);

        const { data: subscriptionCounts } = await supabase
            .from('subscriptions')
            .select('planId')
            .in('planId', planIds);

        // Count subscribers per plan
        const countMap = {};
        if (subscriptionCounts) {
            subscriptionCounts.forEach(sub => {
                countMap[sub.planId] = (countMap[sub.planId] || 0) + 1;
            });
        }

        // Find most subscribed plan for "recommended" badge
        let mostSubscribedPlanId = null;
        let maxCount = 0;
        Object.entries(countMap).forEach(([planId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostSubscribedPlanId = planId;
            }
        });

        // Format response
        const formattedPlans = plans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
            const subscriberCount = countMap[plan.planId] || 0;

            return {
                ...plan,
                currentPrice: price,
                formattedPrice: `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                duration: billingCycle === 'yearly' ? 'Yearly' : 'Monthly',
                subscriberCount,
                isRecommended: plan.planId === mostSubscribedPlanId && plan.price > 0,
                stats: {
                    users: plan.maxUsers,
                    projects: plan.maxProjects,
                    contacts: plan.maxContacts,
                    accounts: plan.maxAccounts,
                    storage: `${plan.storageLimit} GB`
                }
            };
        });

        res.json({
            success: true,
            data: formattedPlans,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum)
            },
            billingCycle
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single plan details
 */
export const getPlan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: plan, error } = await supabase
            .from('plans')
            .select('*')
            .eq('planId', id)
            .single();

        if (error) throw error;
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        // Get subscriber count
        const { count: subscriberCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('planId', id);

        res.json({
            success: true,
            data: {
                ...plan,
                subscriberCount: subscriberCount || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new plan (Superadmin only)
 */
export const createPlan = async (req, res, next) => {
    try {
        const { userProfile } = req;

        // Superadmin check
        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Only superadmins can create plans'
            });
        }

        const {
            name,
            price,
            yearlyPrice,
            duration,
            description,
            maxUsers,
            maxProjects,
            maxContacts,
            maxAccounts,
            storageLimit,
            enableBranding = true,
            enableChatgpt = false,
            modules,
            isTrial = false,
            trialDays = 0,
            isActive = true,
            isDefault = false
        } = req.body;

        // Validation
        if (!name || price === undefined || !duration) {
            return res.status(400).json({
                success: false,
                error: 'Name, price, and duration are required'
            });
        }

        // Auto-calculate yearly price if not provided (monthly × 12 × 0.83 = 17% discount)
        const calculatedYearlyPrice = yearlyPrice || (price * 12 * 0.83);

        // If setting as default, remove default from other plans
        if (isDefault) {
            await supabase
                .from('plans')
                .update({ isDefault: false })
                .eq('isDefault', true);
        }

        // Create plan
        const { data: newPlan, error } = await supabase
            .from('plans')
            .insert([{
                name,
                price,
                yearlyPrice: calculatedYearlyPrice,
                duration,
                description,
                maxUsers: maxUsers || 0,
                maxProjects: maxProjects || 0,
                maxContacts: maxContacts || 0,
                maxAccounts: maxAccounts || 0,
                storageLimit: storageLimit || 0,
                enableBranding,
                enableChatgpt,
                modules,
                isTrial,
                trialDays,
                isActive,
                isDefault
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: newPlan,
            message: 'Plan created successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update plan (Superadmin only)
 */
export const updatePlan = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        // Superadmin check
        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Only superadmins can update plans'
            });
        }

        const {
            name,
            price,
            yearlyPrice,
            duration,
            description,
            maxUsers,
            maxProjects,
            maxContacts,
            maxAccounts,
            storageLimit,
            enableBranding,
            enableChatgpt,
            modules,
            isTrial,
            trialDays,
            isActive,
            isDefault
        } = req.body;

        // Check if plan exists
        const { data: existingPlan } = await supabase
            .from('plans')
            .select('planId, isDefault')
            .eq('planId', id)
            .single();

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        // If setting as default, remove default from other plans
        if (isDefault && !existingPlan.isDefault) {
            await supabase
                .from('plans')
                .update({ isDefault: false })
                .eq('isDefault', true);
        }

        // Auto-calculate yearly price if not provided
        const calculatedYearlyPrice = yearlyPrice || (price ? price * 12 * 0.83 : undefined);

        // Update plan
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (calculatedYearlyPrice !== undefined) updateData.yearlyPrice = calculatedYearlyPrice;
        if (duration !== undefined) updateData.duration = duration;
        if (description !== undefined) updateData.description = description;
        if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
        if (maxProjects !== undefined) updateData.maxProjects = maxProjects;
        if (maxContacts !== undefined) updateData.maxContacts = maxContacts;
        if (maxAccounts !== undefined) updateData.maxAccounts = maxAccounts;
        if (storageLimit !== undefined) updateData.storageLimit = storageLimit;
        if (enableBranding !== undefined) updateData.enableBranding = enableBranding;
        if (enableChatgpt !== undefined) updateData.enableChatgpt = enableChatgpt;
        if (modules !== undefined) updateData.modules = modules;
        if (isTrial !== undefined) updateData.isTrial = isTrial;
        if (trialDays !== undefined) updateData.trialDays = trialDays;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isDefault !== undefined) updateData.isDefault = isDefault;
        updateData.updatedAt = new Date().toISOString();

        const { data: updatedPlan, error } = await supabase
            .from('plans')
            .update(updateData)
            .eq('planId', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: updatedPlan,
            message: 'Plan updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete plan (Superadmin only)
 */
export const deletePlan = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        // Superadmin check
        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Only superadmins can delete plans'
            });
        }

        // Check if plan exists and is default
        const { data: plan } = await supabase
            .from('plans')
            .select('planId, isDefault, name')
            .eq('planId', id)
            .single();

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        // Cannot delete default plan
        if (plan.isDefault) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete the default plan'
            });
        }

        // Check if any companies are subscribed
        const { count: subscriberCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('planId', id);

        if (subscriberCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete plan. ${subscriberCount} ${subscriberCount === 1 ? 'company is' : 'companies are'} currently subscribed.`
            });
        }

        // Delete plan
        const { error } = await supabase
            .from('plans')
            .delete()
            .eq('planId', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle plan active status (Superadmin only)
 */
export const togglePlanStatus = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        // Superadmin check
        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Only superadmins can toggle plan status'
            });
        }

        // Get current status
        const { data: plan } = await supabase
            .from('plans')
            .select('planId, isActive')
            .eq('planId', id)
            .single();

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        // Toggle status
        const { data: updatedPlan, error } = await supabase
            .from('plans')
            .update({
                isActive: !plan.isActive,
                updatedAt: new Date().toISOString()
            })
            .eq('planId', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: updatedPlan,
            message: `Plan ${updatedPlan.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        next(error);
    }
};
