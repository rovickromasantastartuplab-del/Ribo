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
export const getUserProfile = async (authUserId) => {
    // Query user by authUserId (from req.user.id)
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
        .eq('authUserId', authUserId)
        .single();

    if (error) {
        console.warn(`getUserProfile: No user found for authUserId ${authUserId}`);
        return null;
    }

    // Check if user is a superadmin (bypass role checks)
    if (data.type === 'superadmin') {
        data.permissions = ['*']; // All permissions
        data.role = {
            name: 'superadmin',
            label: 'Super Admin'
        };
        return data;
    }

    // For regular users, flatten permissions from roles
    if (data.userRoles && data.userRoles.length > 0) {
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
