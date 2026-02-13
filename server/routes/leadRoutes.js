import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    convertLeadToAccount,
    convertLeadToContact,
    exportLeads,
    importLeads
} from '../controllers/leadController.js';

const router = express.Router();

// Define routes with permissions
router.get('/', authorize('lead.view'), getLeads);

// Import/Export Routes (Must be before /:id)
router.get('/data/export', authorize('lead.export'), exportLeads);
router.post('/data/import', authorize('lead.import'), importLeads);

router.get('/:id', authorize('lead.view'), getLeadById);
router.post('/', authorize('lead.create'), createLead);
router.put('/:id', authorize('lead.edit'), updateLead);
router.delete('/:id', authorize('lead.delete'), deleteLead);

// Conversion Routes
router.post('/:id/convert-account', authorize('lead.convert'), convertLeadToAccount);
router.post('/:id/convert-contact', authorize('lead.convert'), convertLeadToContact);

export default router;
