import { supabase } from '../config/db.js';

/**
 * Mappings between feature/limit keys and their corresponding database logic.
 * This makes the system extensible for future limits (e.g. AI tokens, emails sent).
 */
const LIMIT_RESOURCES = {
    // COUNT-BASED LIMITS: We count rows in a target table
    maxUsers: {
        type: 'count',
        table: 'users',
        description: 'Team Members'
    },
    maxProjects: {
        type: 'count',
        table: 'projects',
        description: 'Active Projects'
    },
    maxContacts: {
        type: 'count',
        table: 'contacts',
        description: 'Contacts'
    },
    maxAccounts: {
        type: 'count',
        table: 'accounts',
        description: 'Customer Accounts'
    },

    // VALUE-BASED LIMITS: We compare a value from subscriptions table against the limit
    storageLimit: {
        type: 'value',
        column: 'storageUsed', // Column in subscriptions table tracking usage
        description: 'Storage Space (MB)',
        unit: 'MB'
    }
};

/**
 * Checks if a company has reached its plan limit for a specific resource.
 * Supports both Row Counts (maxUsers) and Value Comparisons (storageLimit).
 * 
 * @param {string} companyId - The UUID of the company
 * @param {string} limitKey - The plan limit key (e.g., 'maxUsers', 'storageLimit')
 * @returns {Promise<{ allowed: boolean, current: number, limit: number, resource: string }>}
 */
export const checkPlanLimit = async (companyId, limitKey) => {
    const resource = LIMIT_RESOURCES[limitKey];

    if (!resource) {
        throw new Error(`Invalid limit key: ${limitKey}`);
    }

    try {
        // 1. Prepare Promises (Parallel Execution)
        const promises = [
            // Always fetch subscription + plan limit
            supabase
                .from('subscriptions')
                .select(`*, plans(${limitKey})`)
                .eq('companyId', companyId)
                .eq('isActive', true)
                .single()
        ];

        // Only fetch count if it's a count-based resource
        if (resource.type === 'count') {
            promises.push(
                supabase
                    .from(resource.table)
                    .select('*', { count: 'exact', head: true })
                    .eq('companyId', companyId)
            );
        }

        // 2. Execute Queries
        const results = await Promise.all(promises);
        const subResult = results[0];

        if (subResult.error && subResult.error.code !== 'PGRST116') {
            throw subResult.error;
        }

        const subData = subResult.data || {};
        const limitInfo = subData.plans || {};

        // 3. Determine Limit (Plan vs Subscription Override)
        // Priority: Subscription Override > Plan Default > 0
        // We check subData[limitKey] first (if exists directly), then subData.plans[limitKey]
        let limit = subData[limitKey] !== undefined && subData[limitKey] !== null
            ? subData[limitKey]
            : limitInfo[limitKey];

        limit = parseFloat(limit) || 0;

        // 4. Determine Current Usage
        let currentUsage = 0;

        if (resource.type === 'count') {
            const usageResult = results[1];
            currentUsage = usageResult?.count || 0;
        } else if (resource.type === 'value') {
            // For value-based, the usage is tracked on the subscription itself
            currentUsage = parseFloat(subData[resource.column]) || 0;
        }

        return {
            allowed: currentUsage < limit,
            current: currentUsage,
            limit: limit,
            resource: resource.description
        };

    } catch (error) {
        console.error(`Plan check failed for ${limitKey}:`, error);
        return {
            allowed: false,
            error: error.message,
            resource: resource.description
        };
    }
};

/**
 * Checks if a specific boolean feature is enabled for the company's plan.
 * Used for: enableBranding, enableChatgpt, etc.
 * 
 * @param {string} companyId 
 * @param {string} featureKey 
 */
export const checkPlanFeature = async (companyId, featureKey) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`*, plans(${featureKey})`)
            .eq('companyId', companyId)
            .eq('isActive', true)
            .single();

        if (error) throw error;

        // Check if enabled on subscription (override) or plan (default)
        const enabled = data[featureKey] === true || (data.plans && data.plans[featureKey] === true);

        return {
            allowed: enabled,
            feature: featureKey
        };
    } catch (error) {
        console.error(`Feature check failed for ${featureKey}:`, error);
        return { allowed: false, error: error.message };
    }
};

/**
 * Checks if a specific module is enabled in the plan's modules JSONB.
 * 
 * @param {string} companyId 
 * @param {string} moduleKey 
 */
export const checkPlanModule = async (companyId, moduleKey) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('plans(modules)')
            .eq('companyId', companyId)
            .eq('isActive', true)
            .single();

        if (error) throw error;

        const modules = data.plans?.modules || {};
        const enabled = modules[moduleKey] === true;

        return {
            allowed: enabled,
            module: moduleKey
        };
    } catch (error) {
        console.error(`Module check failed for ${moduleKey}:`, error);
        return { allowed: false, error: error.message };
    }
};
