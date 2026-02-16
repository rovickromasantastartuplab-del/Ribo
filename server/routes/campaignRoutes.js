import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus
} from '../controllers/campaignController.js';

const router = express.Router();

// All routes require authentication and campaign.* permissions
router.get('/', authorize('campaign.view'), getCampaigns);
router.get('/:id', authorize('campaign.view'), getCampaign);
router.post('/', authorize('campaign.create'), createCampaign);
router.put('/:id', authorize('campaign.update'), updateCampaign);
router.put('/:id/toggle-status', authorize('campaign.update'), toggleCampaignStatus);
router.delete('/:id', authorize('campaign.delete'), deleteCampaign);

export default router;
