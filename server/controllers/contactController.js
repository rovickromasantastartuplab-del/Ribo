import { supabase } from '../config/db.js';
import { getCompanyId } from '../utils/userHelpers.js';
import { logAccountActivity } from '../utils/activityLogger.js'; // fallback or new logger? 
// We need a specific logContactActivity. I'll add it to activityLogger.js next.
// For now I will import it assuming I will create it.
import { logContactActivity } from '../utils/activityLogger.js';

// Get all contacts with pagination, filtering, and sorting
export const getContacts = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { page = 1, limit = 10, search, status, accountId, assignedTo, sort = 'createdAt', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('contacts')
            .select(`
                *,
                account:accountId(name),
                assignments:contactAssignments(
                    user:userId(userId, name, email, avatar)
                )
            `, { count: 'exact' })
            .eq('companyId', companyId);

        // Filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (accountId && accountId !== 'all') {
            query = query.eq('accountId', accountId);
        }

        if (assignedTo && assignedTo !== 'all') {
            if (assignedTo === 'unassigned') {
                // This is tricky in Supabase with subqueries. 
                // Alternatively, filter in application or use .is('contactAssignments', null) if left join?
                // For now, simpler approach:
                // We might need to handle 'unassigned' logic differently or rely on client-side or specific rpc.
            } else {
                // Filter by specific user assignment
                // We need to use !inner join to filter parents by children
                query = supabase
                    .from('contacts')
                    .select(`
                        *,
                        account:accountId(name),
                        assignments:contactAssignments!inner(
                            user:userId(userId, name, email, avatar)
                        )
                    `, { count: 'exact' })
                    .eq('companyId', companyId)
                    .eq('assignments.userId', assignedTo);
            }
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,position.ilike.%${search}%`);
        }

        const { data, count, error } = await query
            .order(sort, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get single contact
export const getContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { data, error } = await supabase
            .from('contacts')
            .select(`
                *,
                account:accountId(name),
                assignments:contactAssignments(
                    user:userId(userId, name, email, avatar)
                ),
                activities:contactActivities(
                    *,
                    user:userId(name, avatar)
                )
            `)
            .eq('contactId', id)
            .eq('companyId', companyId)
            // Order activities by newest first
            .order('createdAt', { foreignTable: 'contactActivities', ascending: false })
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Contact not found' });

        res.json({ success: true, data });

    } catch (error) {
        next(error);
    }
};

// Create contact
export const createContact = async (req, res, next) => {
    try {
        const { companyId, user, userProfile } = req;
        const {
            name, email, phone, position, address,
            status = 'active', accountId, assignedTo
        } = req.body;

        // 1. Validation
        if (!name || !accountId) {
            return res.status(400).json({ error: 'Name and Account are required' });
        }

        // 2. Create Contact
        const { data: contact, error: createError } = await supabase
            .from('contacts')
            .insert([{
                companyId,
                name,
                email,
                phone,
                position,
                address,
                accountId,
                status,
                createdBy: userProfile?.userId || user.id
            }])
            .select()
            .single();

        if (createError) throw createError;

        // 3. Handle Assignments (Multi-assign)
        if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
            const assignments = assignedTo.map(userId => ({
                contactId: contact.contactId,
                userId,
                assignedBy: userProfile?.userId || user.id
            }));

            const { error: assignError } = await supabase
                .from('contactAssignments')
                .insert(assignments);

            if (assignError) console.error('Error assigning users to contact:', assignError);
        }

        // 4. Log Activity
        await logContactActivity(
            contact.contactId,
            userProfile?.userId || user.id,
            'CREATED',
            'Contact Created',
            `Created contact for account ${accountId}`
        );

        res.status(201).json({ success: true, data: contact });

    } catch (error) {
        next(error);
    }
};

// Update contact
export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId, userProfile, user } = req;
        const updates = req.body;
        const { assignedTo, ...fieldsToUpdate } = updates;

        // 1. Update Core Fields
        const { data: contact, error: updateError } = await supabase
            .from('contacts')
            .update(fieldsToUpdate)
            .eq('contactId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 2. Update Assignments if provided
        if (assignedTo && Array.isArray(assignedTo)) {
            // Delete existing
            await supabase.from('contactAssignments').delete().eq('contactId', id);

            // Insert new
            if (assignedTo.length > 0) {
                const assignments = assignedTo.map(userId => ({
                    contactId: id,
                    userId,
                    assignedBy: userProfile?.userId || user.id
                }));
                await supabase.from('contactAssignments').insert(assignments);
            }
        }

        // 3. Log Activity
        await logContactActivity(
            id,
            userProfile?.userId || user.id,
            'UPDATED',
            'Contact Updated',
            `Updated fields: ${Object.keys(fieldsToUpdate).join(', ')}`
        );

        res.json({ success: true, data: contact });

    } catch (error) {
        next(error);
    }
};

// Delete contact
export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { companyId } = req;

        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('contactId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Contact deleted successfully' });

    } catch (error) {
        next(error);
    }
};
