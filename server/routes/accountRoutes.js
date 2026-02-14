import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount
} from '../controllers/accountController.js';

const router = express.Router();

// Define routes with permissions
router.get('/', authorize('account.view'), getAccounts);
router.post('/', authorize('account.create'), createAccount);
router.get('/:id', authorize('account.view'), getAccountById); // View details
router.put('/:id', authorize('account.edit'), updateAccount);
router.delete('/:id', authorize('account.delete'), deleteAccount);

export default router;
