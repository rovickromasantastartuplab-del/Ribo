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

// ... (registration comments unchanged) ...

const router = express.Router();

// Apply Global Listeners / Middleware
router.use(authMiddleware);
router.use(companyContext);

// 🚦 MOUNT FEATURE ROUTES
// ==========================================
router.use('/dashboard', dashboardRoutes);
router.use('/companies', companyRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-statuses', leadStatusRoutes);
router.use('/lead-sources', leadSourceRoutes);
router.use('/account-config', accountConfigRoutes);
router.use('/accounts', accountRoutes);
router.use('/contacts', contactRoutes);
router.use('/opportunities', opportunityRoutes);

// Add other protected routes here as you build them
// router.use('/projects', projectRoutes);
// router.use('/leads', leadRoutes);

export default router;
