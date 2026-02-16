import { supabase } from '../config/db.js';

/**
 * Get Current User Profile
 * GET /api/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        // req.userProfile is already populated by companyContext middleware
        // But we might want to fetch fresh data or include relations
        const { userId } = req.userProfile;

        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                userRoles (
                    roles (
                        id,
                        name
                    )
                )
            `)
            .eq('userId', userId)
            .single();

        if (error) throw error;

        // Flatten role
        const profile = {
            ...data,
            role: data.userRoles?.[0]?.roles || null
        };

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Profile Details
 * PUT /api/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.userProfile;
        const { name, lang, mode } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (lang) updates.lang = lang;
        if (mode) updates.mode = mode;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('userId', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change Password
 * PUT /api/profile/password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: "New password is required" });
        }

        // Supabase Logic:
        // We can just use supabase.auth.updateUser() which requires the user's access token
        // The token is in req.headers.authorization (Bearer token)
        // However, we are running server-side with service key usually? 
        // OR we initialized supabase with the user's token in middleware?

        // In this project, `db.js` exports `supabase` which is the SERVICE client (admin).
        // But `authController.loginUser` shows we set cookies.

        // Strategy: We need to use the User's JWT to update THEIR password securely.
        // OR we use Admin API to updateUserById (but that doesn't verify currentPassword).

        // If we want to verify currentPassword, we usually try to SignIn with it first.

        const { email } = req.user; // from authMiddleware

        // 1. Verify Current Password (Optional but recommended for security)
        if (currentPassword) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: currentPassword
            });
            if (signInError) {
                return res.status(401).json({ error: "Incorrect current password" });
            }
        }

        // 2. Update Password (as Admin, since we verified logic, OR better: use user context)
        // Since we verified credentials, we can use Admin update.
        // authUserId comes from req.user.id

        const { error: updateError } = await supabase.auth.admin.updateUserById(
            req.user.id,
            { password: newPassword }
        );

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update Avatar
 * PUT /api/profile/avatar
 * (Placeholder - requires Storage setup)
 */
export const updateAvatar = async (req, res, next) => {
    try {
        // TODO: Implement File Upload (Multer + Supabase Storage)
        const { avatarUrl } = req.body; // Allow string update for now

        if (!avatarUrl) {
            return res.status(400).json({ error: "Avatar URL is required" });
        }

        const { userId } = req.userProfile;

        const { data, error } = await supabase
            .from('users')
            .update({ avatar: avatarUrl })
            .eq('userId', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: "Avatar updated",
            data
        });
    } catch (error) {
        next(error);
    }
};
