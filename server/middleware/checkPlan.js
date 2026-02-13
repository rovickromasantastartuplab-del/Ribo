import { getCompanyId } from '../utils/userHelpers.js';
import { checkPlanLimit, checkPlanFeature, checkPlanModule } from '../utils/planLimiter.js';

/**
 * Middleware Factory to enforce plan limits on specific routes.
 * 
 * Usage:
 * router.post('/users', authMiddleware, checkLimit('maxUsers'), userController.create);
 * 
 * New Feature: Can now check storage!
 * router.post('/files', authMiddleware, checkLimit('storageLimit'), fileController.upload);
 * 
 * @param {string} limitKey - The key defined in plans table (e.g., 'maxUsers')
 */
export const checkLimit = (limitKey) => {
    return async (req, res, next) => {
        try {
            // 1. Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized: Auth context missing"
                });
            }

            // 2. Resolve Company ID (Dynamic fetch if missing from JWT)
            // Optimization: If 'authorize' middleware ran before this, use the cached profile.
            // This prevents a redundant DB call.
            const companyId = req.userProfile?.companyId || await getCompanyId(req.user);

            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    error: "No company associated with this user"
                });
            }

            // 3. Execute Limit Check
            const result = await checkPlanLimit(companyId, limitKey);

            // 4. Handle Result
            if (result.error) {
                console.error(`Plan check internal error for ${limitKey}:`, result.error);
                // Fail open for internal errors to avoid blocking users unnecessarily, unless critical.
                return next();
            }

            if (!result.allowed) {
                return res.status(403).json({
                    success: false,
                    error: `Plan Limit Reached: Your current plan allows up to ${result.limit} ${result.resource}.`,
                    code: 'PLAN_LIMIT_REACHED',
                    details: {
                        limit: result.limit,
                        current: result.current,
                        resource: result.resource
                    }
                });
            }

            // All good, proceed to controller
            next();

        } catch (error) {
            console.error('Middleware checkLimit encountered an unexpected error:', error);
            next();
        }
    };
};

/**
 * Middleware to check if a boolean feature is enabled.
 */
export const checkFeature = (featureKey) => {
    return async (req, res, next) => {
        const companyId = req.userProfile?.companyId || await getCompanyId(req.user);
        if (!companyId) return res.status(400).json({ success: false, error: "Company context required" });

        const result = await checkPlanFeature(companyId, featureKey);

        if (!result.allowed) {
            return res.status(403).json({
                success: false,
                error: `Feature Locked: Your current plan does not include ${featureKey}.`,
                code: 'PLAN_FEATURE_LOCKED'
            });
        }
        next();
    };
};

/**
 * Middleware to check if a modular feature is enabled in JSONB.
 */
export const checkModule = (moduleKey) => {
    return async (req, res, next) => {
        const companyId = req.userProfile?.companyId || await getCompanyId(req.user);
        if (!companyId) return res.status(400).json({ success: false, error: "Company context required" });

        const result = await checkPlanModule(companyId, moduleKey);

        if (!result.allowed) {
            return res.status(403).json({
                success: false,
                error: `Module Locked: Your plan does not include access to the ${moduleKey} module.`,
                code: 'PLAN_MODULE_LOCKED'
            });
        }
        next();
    };
};
