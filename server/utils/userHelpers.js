import { supabase } from '../config/db.js';

/**
 * Ensures we have the companyId for a user.
 * If missing from the auth user object, fetches it from the public profile.
 * @param {Object} user - The req.user object from auth middleware
 * @returns {Promise<string|null>} - The companyId or null
 */
export const getCompanyId = async (user) => {
    if (user.companyId) return user.companyId;

    // Fetch from public profile
    const { data, error } = await supabase
        .from('users')
        .select('companyId')
        .eq('userId', user.id)
        .single();

    if (error) {
        console.warn(`Helper: Failed to fetch companyId for user ${user.id}`, error.message);
        return null;
    }

    return data?.companyId || null;
};

/**
 * Fetches the full user profile including role and companyId.
 * @param {string} userId
 */
/**
 * Fetches the full user profile including role and permissions.
 * @param {string} userId - The PUBLIC userId (not authUserId)
 */
export const getUserProfile = async (userId) => {
    // Note: userId here should be the public 'userId' if 'authMiddleware' resolved it correctly
    // But 'authMiddleware' resolves 'auth.users' object where 'id' is 'authUserId'.
    // So we need to query by 'authUserId' if the ID looks like the Auth ID, 
    // OR we query by 'userId' if we have the public ID.
    // 
    // However, our middleware `resolveUserFromAccess` returns the Auth User.
    // So `req.user.id` is `authUserId`.

    // Let's modify the query to handle the join correctly.
    // We assume the input `userId` is the AUTH user id if passed from req.user.id

    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            userRoles (
                role:roles (
                    id:roleId,
                    name,
                    label,
                    permissions:rolePermissions (
                        permission:permissions (
                            name
                        )
                    )
                )
            )
        `)
        .eq('authUserId', userId) // Changed to match authUserId since that's what we have in req.user
        .single();

    if (error) {
        // Fallback: Maybe it WAS a public userId? 
        // Realistically, the context middleware passes req.user.id which is Auth ID.
        // So this change is correct.
        return null;
    }

    // Flatten permissions for easier frontend use
    if (data && data.userRoles && data.userRoles.length > 0) {
        const roleData = data.userRoles[0].role;
        data.role = {
            id: roleData.id,
            name: roleData.name,
            label: roleData.label
        };

        // Extract permission names into a simple array
        data.permissions = roleData.permissions.map(p => p.permission.name);

        // Cleanup nested structure
        delete data.userRoles;
    } else {
        data.permissions = [];
        data.role = null;
    }

    return data;
};
