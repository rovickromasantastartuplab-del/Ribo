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
    }
};
