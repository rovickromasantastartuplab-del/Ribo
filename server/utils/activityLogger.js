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

/**
 * Logs an activity for an account.
 * 
 * @param {string} accountId - The UUID of the account.
 * @param {string} userId - The UUID of the user performing the action.
 * @param {string} activityType - Type of activity (e.g., 'created', 'updated').
 * @param {string} title - Brief title.
 * @param {string} description - Detailed description.
 * @param {object} metadata - Details (optional).
 */
export const logAccountActivity = async (accountId, userId, activityType, title, description, metadata = {}) => {
    try {
        const { error } = await supabase
            .from('accountActivities')
            .insert([{
                accountId,
                userId,
                activityType,
                title,
                description,
                metadata,
                createdAt: new Date()
            }]);

        if (error) {
            console.error('Error logging account activity:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging account activity:', err);
    }
};

/**
 * Logs an activity for a contact.
 * 
 * @param {string} contactId - The UUID of the contact.
 * @param {string} userId - The UUID of the user performing the action.
 * @param {string} activityType - Type of activity (e.g., 'created', 'updated').
 * @param {string} title - Brief title.
 * @param {string} description - Detailed description.
 * @param {object} metadata - Details (optional).
 */
export const logContactActivity = async (contactId, userId, activityType, title, description, metadata = {}) => {
    try {
        const { error } = await supabase
            .from('contactActivities')
            .insert([{
                contactId,
                userId,
                activityType,
                title,
                description,
                metadata,
                createdAt: new Date()
            }]);

        if (error) {
            console.error('Error logging contact activity:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging contact activity:', err);
    }
};

/**
 * Logs an activity for an opportunity.
 * 
 * @param {string} opportunityId - The UUID of the opportunity.
 * @param {string} userId - The UUID of the user performing the action.
 * @param {string} activityType - Type of activity (e.g., 'created', 'updated', 'stage_changed').
 * @param {string} title - Brief title.
 * @param {string} description - Detailed description.
 * @param {object} metadata - Details (optional).
 */
export const logOpportunityActivity = async (opportunityId, userId, activityType, title, description, metadata = {}) => {
    try {
        const { error } = await supabase
            .from('opportunityActivities')
            .insert([{
                opportunityId,
                userId,
                activityType,
                title,
                description,
                metadata,
                createdAt: new Date()
            }]);

        if (error) {
            console.error('Error logging opportunity activity:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging opportunity activity:', err);
    }
};
