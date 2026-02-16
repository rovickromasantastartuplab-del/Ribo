import express from 'express';
import {
    createPlanOrder,
    getPlanOrders,
    updatePlanOrderStatus
} from '../controllers/planOrderController.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Middleware (auth, context) applied globally in api.js

// 1. Create Order (Company Admin)
router.post('/', authorize('planOrder.create'), createPlanOrder);

// 2. List Orders (Company Admin finds own, Superadmin finds all)
router.get('/', authorize('planOrder.view'), getPlanOrders);

// 3. Approve/Reject (Superadmin Only)
// Controller logic prevents non-superadmins from using this.
router.put('/:id/status', updatePlanOrderStatus);

export default router;
