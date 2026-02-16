import express from 'express';
import { companyController } from '../controllers/companyController.js';

const router = express.Router();

// Auth & Context are handled by the Master Router (api.js)
// User must be logged in to create a company
router.post('/', companyController.create);

// Get Current User's Company
router.get('/my-company', companyController.getMyCompany);

// Update Company Settings
router.put('/my-company', companyController.updateCompany);

export default router;
