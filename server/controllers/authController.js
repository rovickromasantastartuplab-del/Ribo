import { supabase, createAuthClient } from '../config/db.js';

export const registerUser = async (req, res, next) => {
    const { email, password, name } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                }
            }
        });
        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({
            message: 'User registered successfully',
            user: data.user
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    const { access_token, refresh_token } = req.body;

    try {
        if (!access_token || !refresh_token) {
            return res.status(400).json({ error: 'Missing tokens' });
        }

        // Verify the access token
        const authClient = createAuthClient(access_token);
        const { data: userData, error: userError } = await authClient.auth.getUser(access_token);

        if (userError || !userData.user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Set cookies
        const isProd = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProd ? "None" : "Lax",
            secure: isProd,
            path: "/",
            maxAge: 60 * 60 * 1000 // 1 hour
        };

        res.cookie("access_token", access_token, cookieOptions);
        res.cookie("refresh_token", refresh_token, { ...cookieOptions, maxAge: 14 * 24 * 60 * 60 * 1000 });


        // Fetch Public Profile to get companyId and Role
        let { data: publicUser, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('authUserId', userData.user.id)
            .single();

        // If no public user record exists, this is first login after email confirmation
        // → Complete registration (create company, user, role, subscription, etc.)
        // NOTE: If a superadmin was manually created, publicUser will exist and skip this
        if (publicError || !publicUser) {
            try {
                const regResponse = await fetch(`http://localhost:${process.env.PORT || 4000}/api/registration/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token,
                        refresh_token,
                        name: userData.user.user_metadata?.name || userData.user.email.split('@')[0],
                        email: userData.user.email
                    })
                });
                const regData = await regResponse.json();

                if (regData.success) {
                    // Re-fetch the newly created public user
                    const { data: newUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('authUserId', userData.user.id)
                        .single();
                    publicUser = newUser;
                } else {
                    // Registration failed - return error
                    return res.status(400).json({
                        error: regData.error || 'Registration failed'
                    });
                }
            } catch (regError) {
                console.error('Auto-registration error:', regError);
                return res.status(500).json({
                    error: 'Failed to complete registration'
                });
            }
        }

        // Validate Company Existence
        if (publicUser && publicUser.companyId) {
            const { data: companyCheck } = await supabase
                .from('companies')
                .select('companyId')
                .eq('companyId', publicUser.companyId)
                .single();

            if (!companyCheck) {
                return res.status(400).json({ error: 'Associated company record not found.' });
            }
        }

        // ✅ LOG LOGIN HISTORY
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        try {
            await supabase.from('loginHistories').insert({
                companyId: publicUser?.companyId || null,
                userId: publicUser?.userId || userData.user.id, // Use profile ID if avail, else Auth ID
                ip: ip,
                userAgent: userAgent,
                loginAt: new Date().toISOString()
            });
        } catch (logError) {
            console.error("⚠️ Failed to log login history:", logError);
            // Non-blocking: Proceed with login even if logging fails
        }

        const userWithProfile = {
            ...userData.user,
            ...publicUser // Merges companyId, name, avatar, etc.
        };

        res.status(200).json({
            message: 'Login successful',
            user: userWithProfile,
            session: {
                access_token,
                refresh_token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) return res.status(500).json({ error: error.message });

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        // req.userProfile is populated by companyContext middleware
        // Fallback to req.user if profile logic fails (graceful degradation)
        const user = req.userProfile || req.user;

        // Ensure we send the merged view (Auth + Profile)
        // If userProfile exists, it usually contains more data than req.user
        res.status(200).json({
            success: true,
            user: {
                ...req.user,      // Auth Data (id, email, audit props)
                ...req.userProfile // Profile Data (name, role, companyId, avatar)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Send password reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`
        });

        if (error) {
            console.error('Password reset error:', error);
            return res.status(400).json({ error: error.message });
        }

        // Always return success to prevent email enumeration
        res.status(200).json({
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    const { access_token, new_password } = req.body;

    try {
        if (!access_token || !new_password) {
            return res.status(400).json({ error: 'Access token and new password are required' });
        }

        // Verify the access token and update password
        const authClient = createAuthClient(access_token);
        const { error } = await authClient.auth.updateUser({
            password: new_password
        });

        if (error) {
            console.error('Password update error:', error);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
