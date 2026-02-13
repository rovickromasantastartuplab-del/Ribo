import { supabase } from '../config/db.js';

/**
 * @desc    Get Key Metrics for Dashboard
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
export const getDashboardSummary = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "User profile missing company association" });

        // Calculate Dates for Growth
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        // Parallel execution for performance
        const [
            leads,
            sales,
            customers,
            projectResult,
            employeeResult,
            subscriptionResult,
            currentMonthLeads,
            lastMonthLeads,
            convertedLeads,
            companyInfo
        ] = await Promise.all([
            // 1. Total Leads
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('companyId', companyId),

            // 2. Total Sales (Paid Invoices)
            supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'paid'),

            // 3. Total Customers (Accounts)
            supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('companyId', companyId),

            // 4. Total Projects
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('companyId', companyId).then(res => res).catch(() => ({ count: 0, error: null })),

            // 5. Total Employees (Fetch email to exclude Owner)
            supabase.from('users').select('email', { count: 'exact' }).eq('companyId', companyId),

            // 6. Storage Usage
            supabase.from('subscriptions').select('storageUsed, storageLimit').eq('companyId', companyId).eq('isActive', true).single(),

            // 7. Current Month Leads
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('companyId', companyId).gte('createdAt', firstDayCurrentMonth),

            // 8. Last Month Leads
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('companyId', companyId).gte('createdAt', firstDayLastMonth).lte('createdAt', lastDayLastMonth),

            // 9. Converted Leads
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('isConverted', true),

            // 10. Company Info (To identify Owner via Email)
            supabase.from('companies').select('email').eq('companyId', companyId).single()
        ]);

        if (leads.error) throw leads.error;
        if (sales.error) throw sales.error;
        if (customers.error) throw customers.error;

        // Process Storage
        const storageStats = subscriptionResult.data || { storageUsed: 0, storageLimit: 0 };

        // Process Growth
        const currentCount = currentMonthLeads.count || 0;
        const lastCount = lastMonthLeads.count || 0;
        let monthlyGrowth = 0;
        if (lastCount > 0) {
            monthlyGrowth = ((currentCount - lastCount) / lastCount) * 100;
        } else if (currentCount > 0) {
            monthlyGrowth = 100;
        }

        // Process Conversion Rate
        const totalLeadCount = leads.count || 0;
        const conversionRate = totalLeadCount > 0
            ? ((convertedLeads.count || 0) / totalLeadCount * 100).toFixed(1)
            : 0;

        // Process Revenue (Sum of Paid Invoices)
        // Optimization: Fetch sum separately to avoid large payloads if count is high
        const { data: revenueData } = await supabase
            .from('invoices')
            .select('totalAmount')
            .eq('companyId', companyId)
            .eq('status', 'paid');

        const totalRevenue = revenueData
            ? revenueData.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0)
            : 0;

        // Process Employees (Exclude Company Owner via Email Match)
        const companyEmail = companyInfo.data?.email;
        const totalEmployees = employeeResult.data
            ? employeeResult.data.filter(u => u.email !== companyEmail).length
            : 0;

        res.status(200).json({
            succes: true,
            data: {
                totalLeads: totalLeadCount,
                totalSales: sales.count || 0,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalCustomers: customers.count || 0,
                totalProjects: projectResult.count || 0,
                totalEmployees: totalEmployees,
                monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
                conversionRate: parseFloat(conversionRate),
                storage: {
                    used: storageStats.storageUsed,
                    limit: storageStats.storageLimit
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Revenue Analytics
 * @route   GET /api/dashboard/revenue
 * @access  Private
 */
export const getRevenueAnalytics = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "User profile missing company association" });

        // Fetch paid invoices for the last 12 months
        // Note: Supabase JS library doesn't support complex aggregation easily.
        // We fetching raw data and processing in JS for MVP. 
        // For Scale: Use RPC function or View.

        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('amount:totalAmount, date:invoiceDate') // Aliasing for clarity
            .eq('companyId', companyId)
            .eq('status', 'paid')
            .order('invoiceDate', { ascending: true });

        if (error) throw error;

        // Aggregation Logic (Monthly)
        const revenueMap = {};

        invoices.forEach(inv => {
            const date = new Date(inv.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

            if (!revenueMap[key]) revenueMap[key] = 0;
            revenueMap[key] += parseFloat(inv.amount || 0);
        });

        // Convert to array for Chart
        const chartData = Object.keys(revenueMap).map(key => ({
            period: key,
            revenue: revenueMap[key]
        }));

        res.status(200).json({
            success: true,
            data: chartData
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Dashboard Charts Data (Leads, Customers)
 * @route   GET /api/dashboard/charts
 * @access  Private
 */
export const getDashboardCharts = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "User profile missing company association" });

        const [leadsResult, accountsResult] = await Promise.all([
            // Lead Conversions (Total vs Converted)
            supabase
                .from('leads')
                .select('isConverted, createdAt')
                .eq('companyId', companyId),

            // Customer Distribution (by Account Type - per Ref Project)
            supabase
                .from('accounts')
                .select('accountTypeId, accountTypes(name)')
                .eq('companyId', companyId),
        ]);

        // Correct Employee Fetch: Get all users in company and their roles/types
        // Supabase schema: users -> userRoles -> roles
        const { data: companyUsers, error: userError } = await supabase
            .from('users')
            .select('userId, userRoles(roles(name))')
            .eq('companyId', companyId);

        if (leadsResult.error) throw leadsResult.error;
        if (accountsResult.error) throw accountsResult.error;
        if (userError) throw userError;

        // Process Lead Conversions
        const totalLeads = leadsResult.data.length;
        const convertedLeads = leadsResult.data.filter(l => l.isConverted).length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

        // Process Customer Distribution (By Type)
        const typeMap = {};
        accountsResult.data.forEach(acc => {
            const typeName = acc.accountTypes?.name || 'Uncategorized';
            if (!typeMap[typeName]) typeMap[typeName] = 0;
            typeMap[typeName]++;
        });
        const customerDistribution = Object.keys(typeMap).map(key => ({
            name: key,
            value: typeMap[key]
        }));

        // Process Employee Distribution
        const roleMap = {};
        companyUsers.forEach(u => {
            const roles = u.userRoles || [];
            if (roles.length === 0) {
                if (!roleMap['No Role']) roleMap['No Role'] = 0;
                roleMap['No Role']++;
            } else {
                roles.forEach(ur => {
                    const roleName = ur.roles?.name || 'Unknown';
                    if (!roleMap[roleName]) roleMap[roleName] = 0;
                    roleMap[roleName]++;
                });
            }
        });
        const employeeDistribution = Object.keys(roleMap).map(key => ({
            name: key,
            value: roleMap[key]
        }));

        res.status(200).json({
            success: true,
            data: {
                leadConversions: {
                    total: totalLeads,
                    converted: convertedLeads,
                    rate: conversionRate
                },
                customerDistribution,
                employeeDistribution
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Detailed Lists (Recent Sales, Projects, New Customers)
 * @route   GET /api/dashboard/lists
 * @access  Private
 */
export const getDashboardLists = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "User profile missing company association" });

        const [sales, projects, customers, leads] = await Promise.all([
            // Recent Sales
            supabase
                .from('invoices')
                .select('id:invoiceId, invoiceNumber, totalAmount, status, invoiceDate')
                .eq('companyId', companyId)
                .order('invoiceDate', { ascending: false })
                .limit(5),

            // Active Projects (Handling missing table gracefully)
            supabase
                .from('projects')
                .select('id:projectId, name, status, endDate')
                .eq('companyId', companyId)
                // .eq('status', 'active') // Assuming 'active' status exists
                .limit(5)
                .then(res => res)
                .catch(() => ({ data: [], error: null })),

            // New Customers
            supabase
                .from('accounts')
                .select('id:accountId, name, createdAt')
                .eq('companyId', companyId)
                .order('createdAt', { ascending: false })
                .limit(5),

            // Latest Leads (Added per User Manual 4.8)
            supabase
                .from('leads')
                .select('id:leadId, name, status, createdAt')
                .eq('companyId', companyId)
                .order('createdAt', { ascending: false })
                .limit(5)
        ]);

        if (sales.error) throw sales.error;
        if (customers.error) throw customers.error;
        if (leads.error) throw leads.error;

        res.status(200).json({
            success: true,
            data: {
                recentSales: sales.data || [],
                activeProjects: projects.data || [],
                newCustomers: customers.data || [],
                latestLeads: leads.data || []
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Recent Activity
 * @route   GET /api/dashboard/recent-activity
 * @access  Private
 */
export const getRecentActivity = async (req, res, next) => {
    try {
        const { companyId } = req;
        if (!companyId) return res.status(400).json({ error: "User profile missing company association" });

        // Fetch latest 5 leads
        const { data: newLeads, error: leadError } = await supabase
            .from('leads')
            .select('id:leadId, name, createdAt')
            .eq('companyId', companyId)
            .order('createdAt', { ascending: false })
            .limit(5);

        if (leadError) throw leadError;

        // Fetch latest 5 logins
        // Note: Check if loginHistories table exists, if not return empty
        let recentLogins = [];
        try {
            const { data: logins, error: loginError } = await supabase
                .from('loginHistories')
                .select('id:loginHistoryId, user:userId(name), loginAt')
                .eq('companyId', companyId)
                .order('loginAt', { ascending: false })
                .limit(5);

            if (!loginError && logins) {
                recentLogins = logins.map(l => ({
                    id: l.id,
                    type: 'login',
                    description: `${l.user?.name || 'User'} logged in`,
                    timestamp: l.loginAt
                }));
            }
        } catch (e) {
            console.warn('Login history fetch failed', e);
        }

        // Format Leads as Activity
        const recentLeads = newLeads.map(l => ({
            id: l.id,
            type: 'new_lead',
            description: `New lead created: ${l.name}`,
            timestamp: l.createdAt
        }));

        // Merge and Sort
        const combinedActivity = [...recentLeads, ...recentLogins]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: combinedActivity
        });

    } catch (error) {
        next(error);
    }
};
