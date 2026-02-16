import express from 'express';
import {
    createPlanRequest,
    getPlanRequests,
    updatePlanRequestStatus
} from '../controllers/planRequestController.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Middleware (auth, context) applied globally in api.js

// 1. Create Request (Company Admin)
router.post('/', authorize('planRequest.create'), createPlanRequest);

// 2. List Requests (Company Admin finds own, Superadmin finds all)
router.get('/', authorize('planRequest.view'), getPlanRequests);

// 3. Approve/Reject (Superadmin Only)
// Note: Controller checks for userProfile.type === 'superadmin' explicitly.
// We could also add authorize('planRequest.approve') if we seeded it for superadmins,
// but usually superadmins bypass standard role checks or have a distinct flow.
// We'll rely on the Controller's strict check.
router.put('/:id/status', updatePlanRequestStatus);

export default router;
