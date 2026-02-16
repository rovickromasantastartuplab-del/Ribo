import { supabase } from '../config/db.js';

export const settingController = {
    /**
     * @desc    Get All System Settings for Company
     * @route   GET /api/settings
     * @access  Private (Company Admin/Staff)
     */
    getSettings: async (req, res) => {
        try {
            const { companyId } = req.userProfile;

            if (!companyId) {
                return res.status(400).json({ error: 'Company ID required' });
            }

            const { data, error } = await supabase
                .from('settings')
                .select('key, value')
                .eq('companyId', companyId);

            if (error) throw error;

            // Transform [ {key, value} ] -> { key: value }
            const settingsMap = {};
            if (data) {
                data.forEach(item => {
                    settingsMap[item.key] = item.value;
                });
            }

            res.json({
                success: true,
                data: settingsMap
            });

        } catch (err) {
            console.error("Get Settings Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    /**
     * @desc    Update Settings (Upsert)
     * @route   POST /api/settings
     * @access  Private (Company Admin)
     */
    updateSettings: async (req, res) => {
        try {
            const { companyId } = req.userProfile;
            const settingsObj = req.body; // Expect { "currency": "USD", "theme": "dark" }

            if (!companyId) {
                return res.status(400).json({ error: 'Company ID required' });
            }

            // Transform { key: value } -> [ { companyId, key, value } ]
            const upsertData = Object.entries(settingsObj).map(([key, value]) => ({
                companyId: companyId,
                key: key,
                value: String(value) // Store as string
            }));

            if (upsertData.length === 0) {
                return res.json({ success: true, message: 'No settings to update' });
            }

            const { data, error } = await supabase
                .from('settings')
                .upsert(upsertData, { onConflict: 'companyId, key' })
                .select();

            if (error) throw error;

            res.json({
                success: true,
                message: 'Settings updated successfully',
                count: data.length
            });

        } catch (err) {
            console.error("Update Settings Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
