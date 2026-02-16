import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getDocumentTypes,
    getDocumentType,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType
} from '../controllers/documentTypeController.js';

const router = express.Router();

// All routes require authentication and document.* permissions
router.get('/', authorize('document.view'), getDocumentTypes);
router.get('/:id', authorize('document.view'), getDocumentType);
router.post('/', authorize('document.create'), createDocumentType);
router.put('/:id', authorize('document.update'), updateDocumentType);
router.delete('/:id', authorize('document.delete'), deleteDocumentType);

export default router;
