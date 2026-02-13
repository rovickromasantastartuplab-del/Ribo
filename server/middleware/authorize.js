import { supabase } from '../config/db.js';

/**
 * Middleware to check if the user has a specific permission.
 * MUST be used AFTER authMiddleware so req.user is populated.
 * 
 * Usage: router.get('/leads', authMiddleware, authorize('lead.view'), leadController.getAll);
 */
export const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 1. Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
            }

            // 2. Check for Super Admin bypass (using metadata or type)
            // Ideally, we store "type" in metadata or fetch from public.users if not in JWT
            // For now, let's query the user to be safe and get their type/role structure
            const { data: userData, error: userError } = await supabase
                .from('users') // querying our public 'users' table
                .select('*')
                .eq('authUserId', req.user.id)
                .single();

            if (userError || !userData) {
                console.error("Authorize: User not found in public table", userError);
                return res.status(403).json({ error: 'Forbidden: User profile not found' });
            }

            // 3. Super Admin Bypass
            if (userData.type === 'superadmin' || userData.type === 'super admin') {
                console.log(`🛡️ Authorize: Super Admin bypass for ${req.user.email}`);
                req.userProfile = userData; // Attach profile for controllers
                return next();
            }

            // 4. Company Admin Bypass (Optional: If Company Admins have all permissions)
            // For strict RBAC, we might want to check roles even for admins, but often admins get '*'
            // Let's implement strict RBAC first: Check if their ROLE has the PERMISSION.

            // 5. Query Database for Permission
            // Query: user -> userRoles -> roles -> rolePermissions -> permissions
            const { count, error: permError } = await supabase
                .from('userRoles')
                .select(`
                    roleId,
                    roles!inner (
                        rolePermissions!inner (
                            permissions!inner (
                                name
                            )
                        )
                    )
                `, { count: 'exact', head: true }) // head: true for count only
                .eq('userId', userData.userId)
                .eq('roles.rolePermissions.permissions.name', requiredPermission);

            if (permError) {
                console.error("Authorize: DB Error checking permission", permError);
                return res.status(500).json({ error: 'Server error checking permissions' });
            }

            if (count > 0) {
                // Permission Granted
                req.userProfile = userData; // Attach profile
                return next();
            } else {
                // Permission Denied
                console.warn(`⛔ Authorize: User ${req.user.email} denied access to ${requiredPermission}`);
                return res.status(403).json({ error: `Forbidden: Missing permission '${requiredPermission}'` });
            }

        } catch (err) {
            console.error("Authorize: Unexpected error", err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
