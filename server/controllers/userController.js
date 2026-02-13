import { supabase } from '../config/db.js';

/**
 * List all users for the current company.
 */
export const getUsers = async (req, res, next) => {
    try {
        const { companyId } = req;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 1. Fetch users linked to company with Pagination
        const { data, count, error } = await supabase
            .from('users')
            .select(`
                *,
                userRoles (
                    roles (
                        id,
                        name
                    )
                )
            `, { count: 'exact' })
            .eq('companyId', companyId)
            .order('createdAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // 2. Format response
        const formatUsers = data.map(user => ({
            ...user,
            role: user.userRoles?.[0]?.roles || null
        }));

        res.json({
            success: true,
            data: formatUsers,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Invite a new user via Email (Standard SaaS Flow).
 * 1. Admin provides Email + Role.
 * 2. System sends Magic Link / Invite Email.
 * 3. User sets their own password.
 */
export const inviteUser = async (req, res, next) => {
    try {
        const { name, email, roleId } = req.body;
        const { companyId } = req;
        const adminUser = req.user; // The admin performing the action

        // 1. Basic Validation
        if (!email || !name || !roleId) {
            return res.status(400).json({ error: "Missing required fields: name, email, roleId" });
        }

        // 0. Get Admin's Public User ID (for createdBy)
        const { data: adminProfile, error: adminProfileError } = await supabase
            .from('users')
            .select('userId')
            .eq('authUserId', adminUser.id)
            .single();

        if (adminProfileError || !adminProfile) {
            console.error("Failed to find admin public profile:", adminProfileError);
            return res.status(500).json({ error: "Administrator profile not found" });
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // 2. Send Invitation (Supabase Auth)
        // This triggers the default "Invite User" email template configured in Supabase.
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { name }, // Optional: Add metadata to the auth user
            redirectTo: `${clientUrl}/set-password`
        });

        if (authError) {
            console.error("Supabase Invite Error:", authError);
            return res.status(500).json({ error: `Auth Error: ${authError.message}` });
        }

        const newAuthUserId = authData.user.id;

        // 3. Create Public Profile
        // We link it to the companyId immediately so they are "pre-provisioned"
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                authUserId: newAuthUserId,
                companyId,
                name,
                email, // Store email in public table too
                status: 'active', // 'pending' status violates constraint
                createdBy: adminProfile.userId
            });

        if (profileError) {
            console.error("Profile Creation Error:", profileError);
            // Rollback: Delete auth user if profile creation fails
            await supabase.auth.admin.deleteUser(newAuthUserId);
            return res.status(500).json({ error: `Database Error: ${profileError.message}` });
        }

        // 4. Retrieve the newly created public user ID
        // (Since insert didn't return it)
        const { data: userProfile, error: fetchError } = await supabase
            .from('users')
            .select('userId')
            .eq('authUserId', newAuthUserId)
            .single();

        if (fetchError) {
            console.error("Profile Fetch Error:", fetchError);
            return res.status(500).json({ error: "Failed to retrieve new user profile" });
        }

        // 5. Assign Role
        const { error: assignmentError } = await supabase
            .from('userRoles')
            .insert({
                userId: userProfile.userId,
                roleId
            });

        if (assignmentError) {
            console.error("Role Assignment Error:", assignmentError);
            return res.status(500).json({ error: `Role Error: ${assignmentError.message}` });
        }

        res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            user: {
                id: userProfile.userId,
                email: authData.user.email
            }
        });

    } catch (error) {
        // Handle "User already registered" specially
        if (error.message && error.message.includes("User with this email address has already been registered")) {
            // Check if the public profile exists and belongs to THIS company
            const { data: existingPublicUser } = await supabase
                .from('users')
                .select('userId, companyId, name')
                .eq('email', email)
                .single();

            if (existingPublicUser) {
                if (existingPublicUser.companyId === companyId) {
                    // User belongs to this company -> Trigger Re-Invite (Password Reset)
                    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${clientUrl}/set-password`
                    });

                    if (resetError) {
                        console.error("Re-invite (Reset Password) Error:", resetError);
                        return res.status(500).json({ error: `Failed to resend invite: ${resetError.message}` });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "User already exists. A new setup link (password reset) has been sent to their email.",
                        user: {
                            id: existingPublicUser.userId,
                            email: email
                        }
                    });
                } else {
                    return res.status(409).json({ error: "User is already registered with another company." });
                }
            } else {
                // Auth user exists but NO public profile (orphaned or half-registered)
                return res.status(409).json({
                    error: "User email is already registered in the system but not linked to your company. Please contact support."
                });
            }
        }

        console.error("Details:", error); // Catch-all logging
        next(error);
    }
};

/**
 * Update User Status (Suspend/Activate) or Details.
 */
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params; // userId (public)
        const { status, name, roleId } = req.body;
        const { companyId } = req;

        // 1. Verify User belongs to Company
        const { data: targetUser, error: findError } = await supabase
            .from('users')
            .select('userId, companyId')
            .eq('userId', id)
            .single();

        if (findError || !targetUser) return res.status(404).json({ error: "User not found" });

        if (targetUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // 2. Update Details
        const updates = {};
        if (status) updates.status = status;
        if (name) updates.name = name;

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('users')
                .update(updates)
                .eq('userId', id);

            if (updateError) throw updateError;
        }

        // 3. Update Role (if provided)
        if (roleId) {
            // Wipe old roles (assuming single role per user for simplicity, though schema supports many)
            await supabase.from('userRoles').delete().eq('userId', id);

            // Insert new
            const { error: roleError } = await supabase
                .from('userRoles')
                .insert({ userId: id, roleId });

            if (roleError) throw roleError;
        }

        res.json({ success: true, message: "User updated successfully" });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete User.
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params; // userId (public)
        const { companyId } = req;
        const currentUserId = req.userProfile.userId; // Assuming userProfile has userId

        if (id === currentUserId) {
            return res.status(400).json({ error: "Cannot delete yourself" });
        }

        // 1. Verify and Get Auth ID
        const { data: targetUser, error: findError } = await supabase
            .from('users')
            .select('userId, authUserId, companyId')
            .eq('userId', id)
            .single();

        if (findError || !targetUser) return res.status(404).json({ error: "User not found" });

        if (targetUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // 2. Delete Auth User (Supabase Admin)
        if (targetUser.authUserId) {
            const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetUser.authUserId);
            if (authDeleteError) console.error("Failed to delete auth user:", authDeleteError);
        }

        // 3. Delete Public Profile (Cascade should handle userRoles, but explicit is fine)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('userId', id);

        if (deleteError) throw deleteError;

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend Invitation to an existing user.
 * Triggers a password reset email which acts as a setup link.
 */
export const resendInvite = async (req, res, next) => {
    try {
        const { id } = req.params; // userId (public)
        const { companyId } = req;

        // 1. Verify User belongs to Company
        const { data: targetUser, error: findError } = await supabase
            .from('users')
            .select('userId, email, companyId')
            .eq('userId', id)
            .single();

        if (findError || !targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (targetUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // 2. Send Password Reset Email (acts as new invite)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetUser.email, {
            redirectTo: `${clientUrl}/set-password`
        });

        if (resetError) {
            console.error("Resend Invite Error:", resetError);
            return res.status(500).json({ error: `Failed to resend invite: ${resetError.message}` });
        }

        res.json({
            success: true,
            message: "Invitation email has been resent successfully"
        });
    } catch (error) {
        next(error);
    }
};
