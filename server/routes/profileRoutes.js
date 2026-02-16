import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    updateAvatar
} from '../controllers/profileController.js';

const router = express.Router();

// Middleware is applied globally in api.js, so we don't need it here.

// Routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.put('/avatar', updateAvatar);

export default router;
