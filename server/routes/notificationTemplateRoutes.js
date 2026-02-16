import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getTemplates,
    getTemplate,
    updateTemplateContent,
    deleteTemplateContent,
    getUserPreferences,
    updateUserPreference,
    getTemplateTypes
} from '../controllers/notificationTemplateController.js';

const router = express.Router();

// Template routes
router.get('/', authorize('template.view'), getTemplates);
router.get('/types', authorize('template.view'), getTemplateTypes);
router.get('/:id', authorize('template.view'), getTemplate);

// Content management
router.put('/:id/content', authorize('template.edit'), updateTemplateContent);
router.delete('/:id/content/:langId', authorize('template.delete'), deleteTemplateContent);

// User preferences
router.get('/user/preferences', getUserPreferences);
router.put('/user/preferences/:templateId', updateUserPreference);

export default router;
