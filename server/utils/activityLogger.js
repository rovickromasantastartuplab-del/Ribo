import { supabase } from '../config/db.js';

/**
 * Logs an activity for a lead.
 * 
 * @param {string} leadId - The UUID of the lead.
 * @param {string} activityType - Type of activity (e.g., 'created', 'updated', 'status_changed').
 * @param {string} title - Brief title of the activity.
 * @param {string} description - Detailed description (optional).
 * @param {object} user - The user object (req.user) performing the action.
 * @param {object} oldValues - Previous state (optional).
 * @param {object} newValues - New state (optional).
 */
export const logLeadActivity = async (leadId, activityType, title, description, user, oldValues = null, newValues = null) => {
    try {
        const { error } = await supabase
            .from('leadActivities')
            .insert([{
                leadId,
                userId: user.id,
                activityType,
                title,
                description,
                oldValues,
                newValues,
                createdBy: user.id,
                createdAt: new Date()
            }]);

        if (error) {
            console.error('Error logging lead activity:', error);
            // We don't throw here to avoid failing the main action just because logging failed
        }
    } catch (err) {
        console.error('Unexpected error logging lead activity:', err);
    }
};
