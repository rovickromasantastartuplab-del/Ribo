import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getDocumentFolders,
    getDocumentFolder,
    createDocumentFolder,
    updateDocumentFolder,
    deleteDocumentFolder
} from '../controllers/documentFolderController.js';

const router = express.Router();

// All routes require authentication and document.* permissions
router.get('/', authorize('document.view'), getDocumentFolders);
router.get('/:id', authorize('document.view'), getDocumentFolder);
router.post('/', authorize('document.create'), createDocumentFolder);
router.put('/:id', authorize('document.update'), updateDocumentFolder);
router.delete('/:id', authorize('document.delete'), deleteDocumentFolder);

export default router;
