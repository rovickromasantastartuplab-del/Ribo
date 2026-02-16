import express from 'express';
import { settingController } from '../controllers/settingController.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Get All Settings
router.get('/', authorize('setting.view'), settingController.getSettings);

// Update Settings
router.post('/', authorize('setting.edit'), settingController.updateSettings);

export default router;
