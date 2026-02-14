import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact
} from '../controllers/contactController.js';

const router = express.Router();

// Get all contacts (permission: 'contact.view')
// Supports filtering by assignedTo, status, accountId, etc.
router.get('/', authorize('contact.view'), getContacts);

// Get single contact details
router.get('/:id', authorize('contact.view'), getContact);

// Create a new contact (permission: 'contact.create')
router.post('/', authorize('contact.create'), createContact);

// Update a contact (permission: 'contact.edit')
router.put('/:id', authorize('contact.edit'), updateContact);

// Delete a contact (permission: 'contact.delete')
router.delete('/:id', authorize('contact.delete'), deleteContact);

export default router;
