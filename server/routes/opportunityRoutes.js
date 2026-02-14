import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
} from '../controllers/opportunityController.js';
import {
    getOpportunityStages,
    createOpportunityStage,
    updateOpportunityStage,
    deleteOpportunityStage
} from '../controllers/opportunityStageController.js';
import {
    getOpportunitySources,
    createOpportunitySource,
    updateOpportunitySource,
    deleteOpportunitySource
} from '../controllers/opportunitySourceController.js';

const router = express.Router();

// ==========================================
// CONFIGURATION ROUTES (Stages & Sources)
// ==========================================

// Stages
router.get('/stages', authorize('opportunityStage.view'), getOpportunityStages);
router.post('/stages', authorize('opportunityStage.create'), createOpportunityStage);
router.put('/stages/:id', authorize('opportunityStage.edit'), updateOpportunityStage);
router.delete('/stages/:id', authorize('opportunityStage.delete'), deleteOpportunityStage);

// Sources
router.get('/sources', authorize('opportunitySource.view'), getOpportunitySources);
router.post('/sources', authorize('opportunitySource.create'), createOpportunitySource);
router.put('/sources/:id', authorize('opportunitySource.edit'), updateOpportunitySource);
router.delete('/sources/:id', authorize('opportunitySource.delete'), deleteOpportunitySource);


// ==========================================
// CORE OPPORTUNITY ROUTES
// ==========================================

router.get('/', authorize('opportunity.view'), getOpportunities);
router.get('/:id', authorize('opportunity.view'), getOpportunity);
router.post('/', authorize('opportunity.create'), createOpportunity);
router.put('/:id', authorize('opportunity.edit'), updateOpportunity);
router.delete('/:id', authorize('opportunity.delete'), deleteOpportunity);

export default router;
