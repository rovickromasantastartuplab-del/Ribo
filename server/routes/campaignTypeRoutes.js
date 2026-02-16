import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getCampaignTypes,
    getCampaignType,
    createCampaignType,
    updateCampaignType,
    deleteCampaignType
} from '../controllers/campaignTypeController.js';

const router = express.Router();

// All routes require authentication and campaign.* permissions
router.get('/', authorize('campaign.view'), getCampaignTypes);
router.get('/:id', authorize('campaign.view'), getCampaignType);
router.post('/', authorize('campaign.create'), createCampaignType);
router.put('/:id', authorize('campaign.update'), updateCampaignType);
router.delete('/:id', authorize('campaign.delete'), deleteCampaignType);

export default router;
