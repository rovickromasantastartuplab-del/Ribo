import { supabase } from '../config/db.js';

/**
 * Get all roles available to the current company.
 * Includes:
 * 1. System Default roles (companyId IS NULL)
 * 2. Custom roles created by this company (companyId == req.companyId)
 */
export const getRoles = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "Company context missing" });

        const { data, error } = await supabase
            .from('roles')
            .select(`
                *,
                rolePermissions (
                    permissions (
                        permissionId,
                        name,
                        description
                    )
                )
            `)
            .or(`companyId.is.null,companyId.eq.${companyId}`)
            .order('name', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new custom role for the company.
 */
export const createRole = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { companyId } = req;

        if (!name) return res.status(400).json({ error: "Role name is required" });

        const { userId } = req.user;

        const { data, error } = await supabase
            .from('roles')
            .insert({
                name,
                description,
                companyId,
                guardName: 'web',
                label: name,
                createdBy: userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Role Details (Name, Description).
 * restricted to custom company roles.
 */
export const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const { companyId } = req;

        if (!name) return res.status(400).json({ error: "Role name is required" });

        // 1. Verify Role Ownership & Type
        const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('companyId')
            .eq('roleId', id)
            .single();

        if (roleError || !role) return res.status(404).json({ error: "Role not found" });

        // Prevent editing System Roles or other companies' roles
        if (role.companyId === null) {
            return res.status(403).json({ error: "Cannot edit System Default roles" });
        }
        if (role.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // 2. Update Role
        const { data, error } = await supabase
            .from('roles')
            .update({ name, description })
            .eq('roleId', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a custom role.
 * Safety: Prevents deletion if users are currently assigned to it.
 */
export const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        // 1. Verify Role Ownership & Type
        const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('companyId')
            .eq('roleId', id)
            .single();

        if (roleError || !role) return res.status(404).json({ error: "Role not found" });

        if (role.companyId === null) {
            return res.status(403).json({ error: "Cannot delete System Default roles" });
        }
        if (role.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // 2. Safety Check: Are users assigned?
        const { count, error: countError } = await supabase
            .from('userRoles')
            .select('*', { count: 'exact', head: true })
            .eq('roleId', id);

        if (countError) throw countError;

        if (count > 0) {
            return res.status(400).json({
                error: "Cannot delete role because it is assigned to users.",
                activeUsers: count
            });
        }

        // 3. Delete Role (Cascade will handle rolePermissions, but verify schema constraints if any)
        const { error: deleteError } = await supabase
            .from('roles')
            .delete()
            .eq('roleId', id);

        if (deleteError) throw deleteError;

        res.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Update permissions for a SPECIFIC role.
 * Validates that the role belongs to this company (cannot edit System Roles).
 */
export const updateRolePermissions = async (req, res, next) => {
    try {
        const { id } = req.params; // Role ID
        const { permissionIds } = req.body; // Array of Permission IDs
        const { companyId } = req;

        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({ error: "permissionIds must be an array" });
        }

        // 1. Verify Role Ownership (Security Check)
        const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('companyId')
            .eq('roleId', id)
            .single();

        if (roleError || !role) return res.status(404).json({ error: "Role not found" });

        // Prevent editing System Roles
        if (role.companyId === null) {
            return res.status(403).json({ error: "Cannot edit System Default roles" });
        }

        // Prevent editing other companies' roles
        if (role.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied to this role" });
        }

        // 2. Clear existing permissions for this role
        const { error: deleteError } = await supabase
            .from('rolePermissions')
            .delete()
            .eq('roleId', id);

        if (deleteError) throw deleteError;

        // 3. Insert new permissions (if any)
        if (permissionIds.length > 0) {
            const inserts = permissionIds.map(permId => ({
                roleId: id,
                permissionId: permId
            }));

            const { error: insertError } = await supabase
                .from('rolePermissions')
                .insert(inserts);

            if (insertError) throw insertError;
        }

        res.json({ success: true, message: "Permissions updated successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Get list of all available system permissions.
 * Used for building the "Checkboxes" in the UI.
 */
export const getPermissions = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('permissions')
            .select('*')
            .order('module', { ascending: true }) // Group by module usually
            .order('name', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
