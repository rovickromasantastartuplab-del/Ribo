import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
} from '../controllers/planController.js';

const router = express.Router();

// ==========================================
// PLAN ROUTES
// ==========================================

// List plans (all users can view)
router.get('/', authorize('plan.view'), getPlans);

// Get single plan
router.get('/:id', authorize('plan.view'), getPlan);

// Create plan (superadmin only)
router.post('/', authorize('plan.create'), createPlan);

// Update plan (superadmin only)
router.put('/:id', authorize('plan.edit'), updatePlan);

// Toggle plan status (superadmin only)
router.put('/:id/toggle', authorize('plan.edit'), togglePlanStatus);

// Delete plan (superadmin only)
router.delete('/:id', authorize('plan.delete'), deletePlan);

export default router;
