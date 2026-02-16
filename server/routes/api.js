import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { companyContext } from '../middleware/context.js';

// Import Protected Feature Routes
import dashboardRoutes from './dashboardRoutes.js';
import companyRoutes from './companyRoutes.js';
import roleRoutes from './roleRoutes.js';
import userRoutes from './userRoutes.js';
import leadRoutes from './leadRoutes.js';
import leadStatusRoutes from './leadStatusRoutes.js';
import leadSourceRoutes from './leadSourceRoutes.js';
import accountConfigRoutes from './accountConfigRoutes.js';
import accountRoutes from './accountRoutes.js';
import contactRoutes from './contactRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import documentTypeRoutes from './documentTypeRoutes.js';
import documentFolderRoutes from './documentFolderRoutes.js';
import documentRoutes from './documentRoutes.js';
import campaignTypeRoutes from './campaignTypeRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import targetListRoutes from './targetListRoutes.js';
import meetingRoutes from './meetingRoutes.js';
import callRoutes from './callRoutes.js';
import notificationTemplateRoutes from './notificationTemplateRoutes.js';
import planRoutes from './planRoutes.js';
import planRequestRoutes from './planRequestRoutes.js';
import planOrderRoutes from './planOrderRoutes.js';
import couponRoutes from './couponRoutes.js';
import reportRoutes from './reportRoutes.js';
import profileRoutes from './profileRoutes.js';
import settingRoutes from './settingRoutes.js';

// ... (registration comments unchanged) ...



// Apply Global Listeners / Middleware
const router = express.Router();

router.use(authMiddleware);
router.use(companyContext);

// 🚦 MOUNT FEATURE ROUTES
// ==========================================
router.use('/dashboard', dashboardRoutes);
router.use('/companies', companyRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes); // Profile Management
router.use('/leads', leadRoutes);
router.use('/lead-statuses', leadStatusRoutes);
router.use('/lead-sources', leadSourceRoutes);
router.use('/account-config', accountConfigRoutes);
router.use('/accounts', accountRoutes);
router.use('/contacts', contactRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/document-types', documentTypeRoutes);
router.use('/document-folders', documentFolderRoutes);
router.use('/documents', documentRoutes);
router.use('/campaign-types', campaignTypeRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/target-lists', targetListRoutes);
router.use('/meetings', meetingRoutes);
router.use('/calls', callRoutes);
router.use('/notification-templates', notificationTemplateRoutes);
router.use('/plans', planRoutes);
router.use('/plan-requests', planRequestRoutes); // Plan Requests
router.use('/plan-orders', planOrderRoutes); // Plan Orders
router.use('/coupons', couponRoutes);
router.use('/reports', reportRoutes); // Reports Module
router.use('/settings', settingRoutes); // System Settings

// Add other protected routes here as you build them
// router.use('/projects', projectRoutes);
// router.use('/leads', leadRoutes);

export default router;
