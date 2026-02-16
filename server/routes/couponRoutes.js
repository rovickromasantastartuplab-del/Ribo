import express from 'express';
import {
    getCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Middleware (authMiddleware, companyContext) is applied globally in api.js

// Public / Validation Route (Used during checkout)
// Note: api.js applies authMiddleware to everything. 
// If 'validate' needs to be truly public (no auth), it should be mounted separately or we need to bypass auth in middleware.
// However, considering this is for "User Checkout", they are likely logged in.
router.post('/validate', validateCoupon);

// Superadmin Routes
router.get('/', getCoupons);
router.post('/', createCoupon);
router.get('/:id', getCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
