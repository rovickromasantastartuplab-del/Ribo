import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getLeadStatuses,
    createLeadStatus,
    updateLeadStatus,
    deleteLeadStatus
} from '../controllers/leadStatusController.js';

const router = express.Router();

router.get('/', authorize('leadStatus.view'), getLeadStatuses);
router.post('/', authorize('leadStatus.create'), createLeadStatus);
router.put('/:id', authorize('leadStatus.edit'), updateLeadStatus);
router.delete('/:id', authorize('leadStatus.delete'), deleteLeadStatus);

export default router;
