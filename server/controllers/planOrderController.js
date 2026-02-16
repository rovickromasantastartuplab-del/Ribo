import { supabase } from '../config/db.js';

// ==========================================
// PLAN ORDER MANAGEMENT
// ==========================================

/**
 * Create Plan Order
 * Access: Company Admin
 * Logic: Calculate Price, Apply Coupon, Create Pending Order
 */
export const createPlanOrder = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile;
        const { planId, billingCycle, couponCode, paymentMethod } = req.body;

        if (!companyId) {
            console.error("CreateOrder Error: Missing companyId in userProfile", req.userProfile);
            return res.status(400).json({ success: false, error: 'User does not belong to a company' });
        }


        if (!planId || !billingCycle) {
            return res.status(400).json({ success: false, error: 'Plan ID and Billing Cycle are required' });
        }

        // 1. Fetch Plan (Optimization: Select only price fields)
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('planId, price, yearlyPrice')
            .eq('planId', planId)
            .single();

        if (planError || !plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        // Calculate Base Price
        let originalPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
        let finalPrice = originalPrice;
        let discountAmount = 0;
        let validCouponId = null;

        // 2. Coupon Logic (If provided)
        if (couponCode) {
            const { data: coupon, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode)
                .eq('status', true)
                .single();

            if (!couponError && coupon) {
                // Check Expiry
                if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
                    return res.status(400).json({ success: false, error: 'Coupon expired' });
                }

                if (coupon.type === 'percentage') {
                    discountAmount = (originalPrice * coupon.discountAmount) / 100;
                } else {
                    discountAmount = coupon.discountAmount;
                }

                // Cap discount
                discountAmount = Math.min(discountAmount, originalPrice);
                finalPrice = originalPrice - discountAmount;
                validCouponId = coupon.couponId;
            } else {
                return res.status(400).json({ success: false, error: 'Invalid coupon code' });
            }
        }

        // 3. Generate Order Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderNumber = `ORD-${dateStr}-${randomStr}`;

        // 4. Create Order
        const { data: order, error } = await supabase
            .from('planOrders')
            .insert([{
                companyId,
                planId,
                couponId: validCouponId,
                couponCode: validCouponId ? couponCode : null,
                orderNumber,
                billingCycle,
                originalPrice,
                discountAmount,
                finalPrice,
                paymentMethod: paymentMethod || 'manual',
                status: 'pending',
                orderedAt: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * List Plan Orders
 * Access: Superadmin (All), Company (Own)
 * Optimization: Enforce Pagination
 */
export const getPlanOrders = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const {
            page = 1,
            limit = 10,
            status,
            companyId: queryCompanyId
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 50);
        const offset = (pageNum - 1) * limitNum;

        let query = supabase
            .from('planOrders')
            .select('*, plan:planId(name), company:companyId(name)', { count: 'exact' });

        if (userProfile.type === 'superadmin') {
            if (queryCompanyId) query = query.eq('companyId', queryCompanyId);
        } else {
            query = query.eq('companyId', userProfile.companyId);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: orders, error, count } = await query
            .order('orderedAt', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum)
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update Order Status (Approve/Reject)
 * Access: Superadmin
 * Logic: If Approved -> UPSERT Subscription
 */
export const updatePlanOrderStatus = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;
        const { status, notes } = req.body;

        if (userProfile.type !== 'superadmin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        // 1. Fetch Order
        const { data: order, error: fetchError } = await supabase
            .from('planOrders')
            .select('*')
            .eq('planOrderId', id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // 2. Perform Update on Order
        const { data: updatedOrder, error: updateError } = await supabase
            .from('planOrders')
            .update({
                status,
                notes,
                processedBy: userProfile.userId,
                processedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('planOrderId', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. If Approved -> Activate Subscription
        if (status === 'approved') {
            // Fetch Plan to get Limits (Snapshotting)
            // The subscriptions table has 'storageLimit' (default 0.00). We must set it.
            const { data: planConfig } = await supabase
                .from('plans')
                .select('storageLimit')
                .eq('planId', order.planId)
                .single();

            const now = new Date();
            const expiry = new Date(now);
            if (order.billingCycle === 'yearly') {
                expiry.setFullYear(expiry.getFullYear() + 1);
            } else {
                expiry.setMonth(expiry.getMonth() + 1);
            }

            // Check existing sub
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('subscriptionId')
                .eq('companyId', order.companyId)
                .maybeSingle();

            const subPayload = {
                companyId: order.companyId,
                planId: order.planId,
                startDate: now.toISOString(),
                expiryDate: expiry.toISOString(),
                billingCycle: order.billingCycle,
                storageLimit: planConfig?.storageLimit || 0, // Ensure limit is applied
                // status: 'active', // REMOVED: Column does not exist
                isActive: true,
                autoRenew: true
            };

            let subError;
            if (existingSub) {
                const { error } = await supabase
                    .from('subscriptions')
                    .update(subPayload)
                    .eq('subscriptionId', existingSub.subscriptionId);
                subError = error;
            } else {
                const { error } = await supabase
                    .from('subscriptions')
                    .insert([subPayload]);
                subError = error;
            }

            if (subError) {
                console.error("Failed to update subscription", subError);
                await supabase.from('planOrders').update({ status: 'pending', notes: 'System Error: Subscription update failed' }).eq('planOrderId', id);
                return res.status(500).json({ success: false, error: 'Failed to activate subscription' });
            }
        }

        res.json({
            success: true,
            data: updatedOrder,
            message: `Order ${status} successfully`
        });

    } catch (error) {
        next(error);
    }
};
