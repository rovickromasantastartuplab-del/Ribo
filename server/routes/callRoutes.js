import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getCalls,
    getCall,
    createCall,
    updateCall,
    deleteCall,
    toggleCallStatus
} from '../controllers/callController.js';

const router = express.Router();

// All routes require authentication and call.* permissions
router.get('/', authorize('call.view'), getCalls);
router.get('/:id', authorize('call.view'), getCall);
router.post('/', authorize('call.create'), createCall);
router.put('/:id', authorize('call.edit'), updateCall);
router.delete('/:id', authorize('call.delete'), deleteCall);
router.put('/:id/toggle-status', authorize('call.edit'), toggleCallStatus);

export default router;
