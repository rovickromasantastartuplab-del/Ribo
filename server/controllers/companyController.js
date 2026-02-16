import { supabase } from '../config/db.js';

export const companyController = {
    /**
     * @desc    Create a new Company (Onboarding)
     * @route   POST /api/companies
     * @access  Private (User with no company)
     */
    create: async (req, res) => {
        try {
            const { name, email } = req.body;
            const userId = req.user.id;

            if (!name) {
                return res.status(400).json({ error: 'Company Name is required' });
            }

            console.log(`🚀 Starting Onboarding for user: ${userId}`);

            // 1. Call the "Big Bang" RPC function
            const { data, error } = await supabase.rpc('create_company_onboarding', {
                company_name: name,
                user_id: userId,
                company_email: email || `${name.replace(/\s+/g, '').toLowerCase()}@example.com` // Fallback email
            });

            if (error) {
                console.error("❌ Onboarding RPC Error:", error);
                return res.status(400).json({ error: error.message });
            }

            console.log("✅ Onboarding Success:", data);

            // 2. Return the new company info
            res.status(201).json({
                message: 'Company created successfully',
                company: {
                    id: data.companyId,
                    name: name
                },
                roleId: data.roleId
            });

        } catch (err) {
            console.error("Server Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    /**
     * @desc    Get Current User's Company & Subscription
     * @route   GET /api/companies/my-company
     * @access  Private (Company Admin/Staff)
     */
    getMyCompany: async (req, res) => {
        try {
            const { companyId } = req.userProfile;

            if (!companyId) {
                return res.status(404).json({ success: false, error: 'No company associated with this user' });
            }

            const { data: company, error } = await supabase
                .from('companies')
                .select(`
                    *,
                    subscriptions (
                        *
                    )
                `)
                .eq('companyId', companyId)
                .single();

            if (error) throw error;

            // Filter for active subscription if multiple exist (though schema usually enforces one logic)
            // But we can just return the array or the first one.
            // Let's refine the query to just get the relevant one if possible, or filter in JS.
            // Simplest: just return what we found.

            res.json({
                success: true,
                data: company
            });

        } catch (err) {
            console.error("Get Company Error:", err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },
    /**
     * @desc    Update Company Profile (Settings)
     * @route   PUT /api/companies/my-company
     * @access  Private (Company Admin)
     */
    updateCompany: async (req, res) => {
        try {
            const { companyId } = req.userProfile;
            const updates = req.body;

            // Prevent updating restricted fields
            delete updates.companyId;
            delete updates.createdAt;
            delete updates.status; // Status managed by SuperAdmin only

            if (!companyId) {
                return res.status(404).json({ error: 'Company not found' });
            }

            const { data, error } = await supabase
                .from('companies')
                .update(updates)
                .eq('companyId', companyId)
                .select()
                .single();

            if (error) throw error;

            res.json({
                success: true,
                message: 'Company profile updated successfully',
                data: data
            });

        } catch (err) {
            console.error("Update Company Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
