import express from 'express';
import {
    getDashboardSummary,
    getRevenueAnalytics,
    getRecentActivity,
    getDashboardCharts,
    getDashboardLists
} from '../controllers/dashboardController.js';

const router = express.Router();

// Auth & Context are handled by the Master Router (api.js)
router.get('/summary', getDashboardSummary);
router.get('/revenue', getRevenueAnalytics);
router.get('/recent-activity', getRecentActivity);
router.get('/charts', getDashboardCharts);
router.get('/lists', getDashboardLists);

export default router;
