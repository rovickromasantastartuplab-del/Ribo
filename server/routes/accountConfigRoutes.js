import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getAccountTypes,
    createAccountType,
    updateAccountType,
    deleteAccountType
} from '../controllers/accountTypeController.js';
import {
    getAccountIndustries,
    createAccountIndustry,
    updateAccountIndustry,
    deleteAccountIndustry
} from '../controllers/accountIndustryController.js';

const router = express.Router();

// ==========================================
// Account Types Routes
// ==========================================
router.get('/types', authorize('accountType.view'), getAccountTypes);
router.post('/types', authorize('accountType.create'), createAccountType);
router.put('/types/:id', authorize('accountType.edit'), updateAccountType);
router.delete('/types/:id', authorize('accountType.delete'), deleteAccountType);

// ==========================================
// Account Industries Routes
// ==========================================
router.get('/industries', authorize('accountIndustry.view'), getAccountIndustries);
router.post('/industries', authorize('accountIndustry.create'), createAccountIndustry);
router.put('/industries/:id', authorize('accountIndustry.edit'), updateAccountIndustry);
router.delete('/industries/:id', authorize('accountIndustry.delete'), deleteAccountIndustry);

export default router;
