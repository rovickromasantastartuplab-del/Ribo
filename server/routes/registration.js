import express from 'express';
import { completeRegistration } from '../controllers/registrationController.js';

const router = express.Router();

// Complete registration after Supabase auth
router.post('/complete', completeRegistration);

export default router;
