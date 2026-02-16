import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    uploadMiddleware
} from '../controllers/documentController.js';

const router = express.Router();

// All routes require authentication and document.* permissions
router.get('/', authorize('document.view'), getDocuments);
router.get('/:id', authorize('document.view'), getDocument);
router.get('/:id/download', authorize('document.view'), downloadDocument);
router.post('/', authorize('document.create'), uploadMiddleware, createDocument);
router.put('/:id', authorize('document.update'), uploadMiddleware, updateDocument);
router.delete('/:id', authorize('document.delete'), deleteDocument);

export default router;
