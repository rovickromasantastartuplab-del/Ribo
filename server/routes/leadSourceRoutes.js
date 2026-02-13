import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getLeadSources,
    createLeadSource,
    updateLeadSource,
    deleteLeadSource
} from '../controllers/leadSourceController.js';

const router = express.Router();

router.get('/', authorize('leadSource.view'), getLeadSources);
router.post('/', authorize('leadSource.create'), createLeadSource);
router.put('/:id', authorize('leadSource.edit'), updateLeadSource);
router.delete('/:id', authorize('leadSource.delete'), deleteLeadSource);

export default router;
