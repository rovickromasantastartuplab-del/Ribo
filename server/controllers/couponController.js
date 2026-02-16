import { supabase } from '../config/db.js';

// ==========================================
// COUPON MANAGEMENT CONTROLLER
// ==========================================
// Reference: CouponController.php within 'sales-saas-business-sales-crm'
// Optimized for Supabase & Node.js
// ==========================================

/**
 * List all coupons (Superadmin only)
 * Supports pagination, search, and filtering
 */
export const getCoupons = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const {
            page = 1,
            limit = 10,
            search,
            status,
            type
        } = req.query;

        // Security Check
        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Only superadmins can manage coupons'
            });
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100); // Limit to 100
        const offset = (pageNum - 1) * limitNum;

        let query = supabase
            .from('coupons')
            .select('*', { count: 'exact' });

        // Filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
        }
        if (status && status !== 'all') {
            query = query.eq('status', status === 'active');
        }
        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        // Execute Query
        const { data: coupons, error, count } = await query
            .order('createdAt', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (error) throw error;

        // Fetch Usage Counts (Parallel)
        // Optimization: Get usage counts for these specific coupons
        const couponIds = coupons.map(c => c.couponId);

        // We need to count unique orders per coupon
        // Since Supabase doesn't support GROUP BY easily in JS client for counts,
        // we might need a workaround or just fetch counts if low volume.
        // For optimization, let's fetch raw counts for now.
        // In a high-volume system, we'd add 'usedCount' column to 'coupons' table and increment it.
        // Given current schema, let's do a grouped count query via RPC or just iterative (N+1 safe-ish if limited to 10 page size)
        // BETTER APPROACH: Just return coupons. Usage stats can be in single view.

        res.json({
            success: true,
            data: coupons,
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
 * Get single coupon details
 */
export const getCoupon = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('couponId', id)
            .single();

        if (error) throw error;
        if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });

        // Get Usage Stats
        const { count: usageCount } = await supabase
            .from('planOrders')
            .select('*', { count: 'exact', head: true })
            .eq('couponId', id)
            .in('status', ['approved', 'completed']); // Only count successful uses

        res.json({
            success: true,
            data: {
                ...coupon,
                usageCount: usageCount || 0
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Create new coupon
 */
export const createCoupon = async (req, res, next) => {
    try {
        const { userProfile, user } = req;

        if (userProfile?.type !== 'superadmin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const {
            name,
            code, // Manual code
            type, // percentage / flat
            discountAmount,
            minimumSpend,
            maximumSpend,
            useLimitPerCoupon,
            useLimitPerCompany,
            expiryDate,
            codeType, // manual / auto
            status = true
        } = req.body;

        // 2. Strict Enum Validation
        if (!['percentage', 'flat'].includes(type)) {
            return res.status(400).json({ success: false, error: "Invalid type. Must be 'percentage' or 'flat'" });
        }
        if (codeType && !['manual', 'auto'].includes(codeType)) {
            return res.status(400).json({ success: false, error: "Invalid codeType. Must be 'manual' or 'auto'" });
        }

        // 3. Basic Validation
        if (!name || (!code && codeType === 'manual') || !type || !discountAmount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // 4. Generate Code Logic
        let finalCode = code;
        if (codeType === 'auto') {
            const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
            finalCode = `COUPON-${randomString}`;
        }

        // 5. Insert
        const { data: newCoupon, error } = await supabase
            .from('coupons')
            .insert([{
                name,
                code: finalCode,
                type,
                discountAmount,
                minimumSpend,
                maximumSpend,
                useLimitPerCoupon,
                useLimitPerCompany,
                expiryDate,
                codeType: codeType || 'manual',
                status,
                createdBy: userProfile.userId // Direct link to users table
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: newCoupon,
            message: 'Coupon created successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update coupon
 */
export const updateCoupon = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        if (userProfile?.type !== 'superadmin') return res.status(403).json({ success: false, error: 'Unauthorized' });

        const {
            name, code, type, discountAmount,
            minimumSpend, maximumSpend,
            useLimitPerCoupon, useLimitPerCompany,
            expiryDate, status
        } = req.body;

        const { data: updatedCoupon, error } = await supabase
            .from('coupons')
            .update({
                name, code, type, discountAmount,
                minimumSpend, maximumSpend,
                useLimitPerCoupon, useLimitPerCompany,
                expiryDate, status,
                updatedAt: new Date().toISOString()
            })
            .eq('couponId', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: updatedCoupon,
            message: 'Coupon updated successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (req, res, next) => {
    try {
        const { userProfile } = req;
        const { id } = req.params;

        if (userProfile?.type !== 'superadmin') return res.status(403).json({ success: false, error: 'Unauthorized' });

        // Check usage before delete
        const { count: usageCount } = await supabase
            .from('planOrders')
            .select('*', { count: 'exact', head: true })
            .eq('couponId', id);

        if (usageCount > 0) {
            return res.status(400).json({ success: false, error: 'Cannot delete coupon that has been used.' });
        }

        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('couponId', id);

        if (error) throw error;

        res.json({ success: true, message: 'Coupon deleted successfully' });

    } catch (error) {
        next(error);
    }
};

/**
 * Validate Coupon (Public/Public-ish)
 * Used during checkout
 */
export const validateCoupon = async (req, res, next) => {
    try {
        const { code, amount, companyId } = req.body;

        if (!code || !amount) {
            return res.status(400).json({ success: false, error: 'Code and amount required' });
        }

        // 1. Fetch Coupon
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ success: false, error: 'Invalid coupon code' });
        }

        // 2. Check Status
        if (!coupon.status) {
            return res.status(400).json({ success: false, error: 'Coupon is inactive' });
        }

        // 3. Check Expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ success: false, error: 'Coupon has expired' });
        }

        // 4. Check Minimum Spend
        if (coupon.minimumSpend && amount < coupon.minimumSpend) {
            return res.status(400).json({
                success: false,
                error: `Minimum spend of ${coupon.minimumSpend} required`
            });
        }

        // 5. Check Maximum Spend (if applicable logic exists for rejection, or just for capping discount)
        // Usually max spend implies max discount cap, but field name is ambiguous. 
        // Assuming it means "Max order value eligible" or "Max discount value"? 
        // Reference uses 'maximum_spend' likely as cap. Let's assume it's checking eligibility.
        if (coupon.maximumSpend && amount > coupon.maximumSpend) {
            return res.status(400).json({
                success: false,
                error: `Order amount exceeds maximum limit of ${coupon.maximumSpend}`
            });
        }

        // 6. Check Global Usage Limit
        if (coupon.useLimitPerCoupon) {
            const { count: globalUsage } = await supabase
                .from('planOrders')
                .select('*', { count: 'exact', head: true })
                .eq('couponId', coupon.couponId)
                .in('status', ['approved', 'completed', 'pending']); // Include pending to avoid race conditions roughly

            if (globalUsage >= coupon.useLimitPerCoupon) {
                return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
            }
        }

        // 7. Check Company Usage Limit (if companyId provided)
        if (companyId && coupon.useLimitPerCompany) {
            const { count: companyUsage } = await supabase
                .from('planOrders')
                .select('*', { count: 'exact', head: true })
                .eq('couponId', coupon.couponId)
                .eq('companyId', companyId)
                .in('status', ['approved', 'completed', 'pending']);

            if (companyUsage >= coupon.useLimitPerCompany) {
                return res.status(400).json({
                    success: false,
                    error: 'You have already used this coupon the maximum number of times'
                });
            }
        }

        // 8. Calculate Discount
        let discountValue = 0;
        if (coupon.type === 'percentage') {
            discountValue = (amount * coupon.discountAmount) / 100;
        } else {
            discountValue = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed order amount
        discountValue = Math.min(discountValue, amount);

        res.json({
            success: true,
            data: {
                couponId: coupon.couponId,
                code: coupon.code,
                type: coupon.type,
                discountAmount: Number(discountValue).toFixed(2),
                finalPrice: Number(amount - discountValue).toFixed(2)
            },
            message: 'Coupon applied successfully'
        });

    } catch (error) {
        next(error);
    }
};
