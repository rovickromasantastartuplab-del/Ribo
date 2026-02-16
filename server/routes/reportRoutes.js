import express from 'express';
import { getLeadReports, getSubscriptionReports, getPlanReports, getCustomerReports } from '../controllers/reportController.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All Report routes require 'report.view' permission
// (We need to add this permission to seedPermissions.js first)
// For now, we can use a role check or assume admin, usually 'report.view' is best.

router.get('/leads', authorize('report.view'), getLeadReports);
router.get('/subscriptions', authorize('report.view'), getSubscriptionReports); // "Sales"
router.get('/plans', authorize('report.view'), getPlanReports); // "Products"
router.get('/customers', authorize('report.view'), getCustomerReports);

export default router;
