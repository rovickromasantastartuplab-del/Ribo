import express from 'express';
import { registerUser, loginUser, logout, getMe, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

import { companyContext } from '../middleware/context.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
// Apply companyContext to fetch full profile for /me
router.get('/me', authMiddleware, companyContext, getMe);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Test Route for Authorization
import { authorize } from '../middleware/authorize.js';
router.get('/test-permission', authMiddleware, authorize('lead.view'), (req, res) => {
    res.json({ message: 'You have access to view leads!', user: req.userProfile });
});

// Test Route for Plan Limits
import { checkLimit } from '../middleware/checkPlan.js';
router.get('/test-plan-limit', authMiddleware, checkLimit('maxUsers'), (req, res) => {
    res.json({
        success: true,
        message: 'Plan check passed! You have not reached your user limit.',
        user: req.userProfile
    });
});

export default router;
