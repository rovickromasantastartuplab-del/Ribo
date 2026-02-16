import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getTargetLists,
    getTargetList,
    createTargetList,
    updateTargetList,
    deleteTargetList,
    toggleTargetListStatus
} from '../controllers/targetListController.js';

const router = express.Router();

// All routes require authentication and campaign.* permissions
router.get('/', authorize('campaign.view'), getTargetLists);
router.get('/:id', authorize('campaign.view'), getTargetList);
router.post('/', authorize('campaign.create'), createTargetList);
router.put('/:id', authorize('campaign.update'), updateTargetList);
router.put('/:id/toggle-status', authorize('campaign.update'), toggleTargetListStatus);
router.delete('/:id', authorize('campaign.delete'), deleteTargetList);

export default router;
