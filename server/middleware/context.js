import { getUserProfile } from '../utils/userHelpers.js';

/**
 * Middleware to ensure req.userProfile and req.companyId are populated globally.
 * 
 * Works in tandem with 'authorize' middleware:
 * 1. If 'authorize' ran first, it uses the cached profile.
 * 2. If 'authorize' didn't run, it fetches and caches the full profile now.
 * 3. Subsequent controllers/middleware just read req.userProfile.
 */
export const companyContext = async (req, res, next) => {
    // Skip if not authenticated
    if (!req.user) return next();

    // Skip if profile is ALREADY loaded (e.g. by authorize middleware)
    if (req.userProfile && req.companyId) {
        return next();
    }

    try {
        // Fetch full profile efficiently using our helper and cache it
        const profile = await getUserProfile(req.user.id);

        if (profile) {
            // Cache Full Profile
            req.userProfile = profile;

            // Cache Company ID for convenience (if exists)
            if (profile.companyId) {
                req.companyId = profile.companyId;
            }
        }

        next();
    } catch (error) {
        console.error("Error in userContext middleware:", error);
        // We don't block the request here, just log it. 
        // Controllers checking for profile will handle missing data.
        next();
    }
};
