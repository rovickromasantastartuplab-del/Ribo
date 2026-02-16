import { supabase } from '../config/db.js';

// Helper to calculate percentage growth
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Helper to aggregate data by period (day/month)
const aggregateByPeriod = (data, dateField, period = 'month') => {
    const groups = {};
    data.forEach(item => {
        const date = new Date(item[dateField]);
        const key = period === 'month'
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!groups[key]) groups[key] = 0;
        groups[key]++;
    });

    return Object.keys(groups).sort().map(key => ({
        period: key,
        count: groups[key]
    }));
};

// 1. Lead Reports
export const getLeadReports = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile;
        const { dateFrom, dateTo } = req.query; // Format: YYYY-MM-DD

        // Base Query
        let query = supabase
            .from('leads')
            .select('leadId, status, leadSourceId, isConverted, createdAt')
            .eq('companyId', companyId);

        if (dateFrom) query = query.gte('createdAt', `${dateFrom}T00:00:00`);
        if (dateTo) query = query.lte('createdAt', `${dateTo}T23:59:59`);

        const { data: leads, error } = await query;
        if (error) throw error;

        // Metrics
        const totalLeads = leads.length;
        const convertedLeads = leads.filter(l => l.isConverted).length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        // Group by Source (Client-side join or separate query? Separate query is safer for count)
        // Optimization: We have leadSourceId. Let's fetch sources map.
        const { data: sources } = await supabase.from('leadSources').select('leadSourceId, name').eq('companyId', companyId);
        const sourceMap = sources.reduce((acc, s) => ({ ...acc, [s.leadSourceId]: s.name }), {});

        const leadsBySource = leads.reduce((acc, lead) => {
            const sourceName = sourceMap[lead.leadSourceId] || 'Unknown';
            acc[sourceName] = (acc[sourceName] || 0) + 1;
            return acc;
        }, {});

        // Trends
        const monthlyData = aggregateByPeriod(leads, 'createdAt', 'month');
        const dailyData = aggregateByPeriod(leads, 'createdAt', 'day');

        res.json({
            success: true,
            data: {
                summary: {
                    total_leads: totalLeads,
                    converted_leads: convertedLeads,
                    conversion_rate: parseFloat(conversionRate.toFixed(2))
                },
                leadsBySource: Object.keys(leadsBySource).map(key => ({ name: key, value: leadsBySource[key] })),
                monthlyData,
                dailyData
            }
        });

    } catch (error) {
        next(error);
    }
};

// 2. Subscription Reports (Mapped from Sales)
export const getSubscriptionReports = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile;
        const { dateFrom, dateTo } = req.query;

        // Fetch Approved Orders (Revenue)
        let query = supabase
            .from('planOrders')
            .select('finalPrice, status, createdAt')
            .eq('companyId', companyId)
            .eq('status', 'approved');

        if (dateFrom) query = query.gte('createdAt', `${dateFrom}T00:00:00`);
        if (dateTo) query = query.lte('createdAt', `${dateTo}T23:59:59`);

        const { data: orders, error } = await query;
        if (error) throw error;

        // Metrics
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.finalPrice), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Trends
        // Revenue Aggregation
        const revenueByMonth = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(order.finalPrice);
        });

        const monthlyRevenue = Object.keys(revenueByMonth).sort().map(key => ({
            period: key,
            revenue: revenueByMonth[key]
        }));

        res.json({
            success: true,
            data: {
                summary: {
                    total_revenue: parseFloat(totalRevenue.toFixed(2)),
                    total_orders: totalOrders,
                    avg_order_value: parseFloat(avgOrderValue.toFixed(2))
                },
                monthlyRevenue
            }
        });

    } catch (error) {
        next(error);
    }
};

// 3. Plan Performance Reports (Mapped from Products)
export const getPlanReports = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile;

        // 1. Fetch Plan Counts from Subscriptions (Active)
        // Note: Subscriptions table has 'planId'.
        // We want to know "How many companies use Plan X?"
        // BUT this endpoint is for a COMPANY ADMIN reporting on THEIR usage?
        // Wait. "ReportsController" in reference is for the Company Admin.
        // A Company Admin has ONE subscription.
        // So "Plan Reports" for a Company Admin is meaningless? (They only have 1 plan).
        // OR is this for SUPERADMIN?
        // The reference project has "Sales Reports" for "Sales Orders".
        // Ribo "Plan Orders" are for the Company paying the SaaS.
        // Is the User a SaaS Admin? Checking reference...
        // Reference: "Auth::user()->creatorId()".
        // It seems to be a multi-tenant SaaS where Tenants sell products?
        // OR is it the SaaS Owner reporting?

        // User said "Reports for lead, sales, and product".
        // Ribo is a CRM. The Company USES it to sell THEIR products.
        // But we skipped Products Module (Phase 5).
        // So the "Sales Reports" should be about "Opportunities Won" (Deals closed)?
        // My previous mapping: "Subscription Revenue" (Money Ribo makes from this company).
        // This might be wrong.
        // If the Company Admin wants to see "My Sales", they want to see "Opportunities Closed Won".

        // RE-EVALUATION:
        // If I am a Company Admin using Ribo CRM:
        // - "Lead Reports": My leads. (Correct)
        // - "Sales Reports": My closed deals (Opportunities). (NOT Plan Orders - that's my bill).
        // - "Product Reports": My products sold. (We don't have products).

        // HOWEVER, my implementation plan (Step 8139) EXPLICITLY claimed:
        // "Sales Reports -> Subscription Revenue (using planOrders)".
        // And user APPROVED it.
        // "Since Ribo is a Subscription SaaS... I'm mapping the Product/Sales reports to Plan/Subscription reports."
        // This implies the user wants to see reporting on the SaaS side?
        // OR the user misunderstood?

        // Given I must follow the approved plan:
        // "Sales Reports" = "Subscription Revenue".
        // "Product Reports" = "Plan Performance".

        // So, for "Plan Performance":
        // Which Plans are being bought?
        // Since `planOrders` belong to `companyId`, getting "Plan Performance" for a SINGLE company (who only buys 1 plan at a time) is very boring.
        // "Your current plan is X".
        // BUT, maybe they have multiple orders in history (Upgrades/Downgrades).

        // I will stick to the plan.

        const { data: orders, error } = await supabase
            .from('planOrders')
            .select('planId, finalPrice')
            .eq('companyId', companyId)
            .eq('status', 'approved');

        if (error) throw error;

        // Fetch Plan Names
        const { data: plans } = await supabase.from('plans').select('planId, name');
        const planMap = plans.reduce((acc, p) => ({ ...acc, [p.planId]: p.name }), {});

        const planPerformance = orders.reduce((acc, order) => {
            const name = planMap[order.planId] || 'Unknown';
            if (!acc[name]) acc[name] = { count: 0, revenue: 0 };
            acc[name].count++;
            acc[name].revenue += Number(order.finalPrice);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                plans: Object.keys(planPerformance).map(key => ({
                    name: key,
                    count: planPerformance[key].count,
                    revenue: parseFloat(planPerformance[key].revenue.toFixed(2))
                }))
            }
        });

    } catch (error) {
        next(error);
    }
};

// 4. Customer Reports
export const getCustomerReports = async (req, res, next) => {
    try {
        const { companyId } = req.userProfile;
        const { dateFrom, dateTo } = req.query;

        let query = supabase
            .from('contacts')
            .select('contactId, status, createdAt')
            .eq('companyId', companyId);

        if (dateFrom) query = query.gte('createdAt', `${dateFrom}T00:00:00`);
        if (dateTo) query = query.lte('createdAt', `${dateTo}T23:59:59`);

        const { data: contacts, error } = await query;
        if (error) throw error;

        const totalContacts = contacts.length;
        const activeContacts = contacts.filter(c => c.status === 'active').length;

        const monthlyData = aggregateByPeriod(contacts, 'createdAt', 'month');

        res.json({
            success: true,
            data: {
                summary: {
                    total_contacts: totalContacts,
                    active_contacts: activeContacts
                },
                monthlyData
            }
        });

    } catch (error) {
        next(error);
    }
};
