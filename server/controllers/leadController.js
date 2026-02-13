import { supabase } from '../config/db.js';
import { logLeadActivity } from '../utils/activityLogger.js';

// Get all leads with pagination, filtering, and sorting
export const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, source, sort = 'createdAt', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        // Start building the query
        let query = supabase
            .from('leads')
            .select(`
                *,
                leadStatus:leadStatusId(name, color),
                leadSource:leadSourceId(name),
                assignments:leadAssignments(
                    user:userId(name, email, avatar)
                )
            `, { count: 'exact' })
            .eq('companyId', req.companyId);

        // Apply filters
        if (status) query = query.eq('leadStatusId', status);
        if (source) query = query.eq('leadSourceId', source);

        // Apply search
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,companyName.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sort, { ascending: order === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        // Transform data to flatten structure if needed
        const leads = data.map(lead => ({
            ...lead,
            assignees: lead.assignments.map(a => a.user)
        }));

        res.json({
            success: true,
            data: leads,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
};

// Get a single lead by ID
export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                leadStatus:leadStatusId(name, color),
                leadSource:leadSourceId(name),
                assignments:leadAssignments(
                    user:userId(name, email, avatar)
                ),
                activities:leadActivities(
                    title, description, activityType, createdAt,
                    user:userId(name, avatar)
                ),
                comments:leadComments(
                    comment, createdAt,
                    user:userId(name, avatar)
                )
            `)
            .eq('leadId', id)
            .eq('companyId', req.companyId) // RLS precaution
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Lead not found' });

        // Transform
        const lead = {
            ...data,
            assignees: data.assignments.map(a => a.user)
        };

        res.json({ success: true, data: lead });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lead' });
    }
};

// Create a new lead
export const createLead = async (req, res) => {
    try {
        const {
            name, email, phone, companyName,
            leadStatusId, leadSourceId,
            assignees = [], // Array of user IDs
            notes
        } = req.body;

        // 1. Create the Lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert([{
                companyId: req.companyId,
                name,
                email,
                phone,
                companyName,
                leadStatusId,
                leadSourceId,
                notes,
                createdBy: req.user.id
            }])
            .select()
            .single();

        if (leadError) throw leadError;

        // 2. Logging
        await logLeadActivity(lead.leadId, 'created', 'Lead Created', 'Lead created in the system', req.user);

        let assignedUsers = [];

        // 3. Handle Assignments (if any)
        if (assignees.length > 0) {
            const assignmentData = assignees.map(userId => ({
                leadId: lead.leadId,
                userId,
                assignedBy: req.user.id
            }));

            const { error: assignError } = await supabase
                .from('leadAssignments')
                .insert(assignmentData);

            if (assignError) {
                console.error('Error assigning users:', assignError);
                // Don't fail the whole request
            } else {
                await logLeadActivity(lead.leadId, 'assigned', 'Users Assigned', `Assigned to ${assignees.length} users`, req.user);

                // Fetch the assigned user details to return in response
                const { data: users } = await supabase
                    .from('users')
                    .select('userId, name, email, avatar')
                    .in('userId', assignees);

                assignedUsers = users || [];
            }
        }

        // Return lead with assignees structure matching getLeads
        const responseData = {
            ...lead,
            assignees: assignedUsers
        };

        res.status(201).json({
            success: true,
            data: responseData,
            message: 'Lead created successfully'
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, error: 'Failed to create lead' });
    }
};

// Update a lead
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, companyName,
            leadStatusId, leadSourceId,
            assignees, // Array of user IDs
            notes
        } = req.body;

        // 1. Fetch existing lead for comparison
        const { data: oldLead, error: fetchError } = await supabase
            .from('leads')
            .select('*')
            .eq('leadId', id)
            .eq('companyId', req.companyId)
            .single();

        if (fetchError || !oldLead) return res.status(404).json({ success: false, error: 'Lead not found' });

        // 2. Update Lead Details
        const { data: lead, error: updateError } = await supabase
            .from('leads')
            .update({
                name, email, phone, companyName,
                leadStatusId, leadSourceId, notes,
                updatedAt: new Date()
            })
            .eq('leadId', id)
            .eq('companyId', req.companyId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Log Changes
        if (oldLead.leadStatusId !== leadStatusId) {
            await logLeadActivity(id, 'status_changed', 'Status Updated', 'Lead status was updated', req.user, { statusId: oldLead.leadStatusId }, { statusId: leadStatusId });
        } else {
            await logLeadActivity(id, 'updated', 'Lead Updated', 'Lead details updated', req.user);
        }

        // 4. Sync Assignments (Only if provided)
        if (assignees && Array.isArray(assignees)) {
            // First, delete OLD assignments
            await supabase
                .from('leadAssignments')
                .delete()
                .eq('leadId', id);

            // Second, Insert NEW assignments
            if (assignees.length > 0) {
                const assignmentData = assignees.map(userId => ({
                    leadId: id,
                    userId,
                    assignedBy: req.user.id
                }));

                await supabase
                    .from('leadAssignments')
                    .insert(assignmentData);

                await logLeadActivity(id, 'assigned', 'Assignments Updated', `Re-assigned to ${assignees.length} users`, req.user);
            }
        }

        res.json({
            success: true,
            data: lead,
            message: 'Lead updated successfully'
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, error: 'Failed to update lead' });
    }
};

// Delete a lead
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        // Hard delete (Schema has no 'deletedAt' for leads)
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('leadId', id)
            .eq('companyId', req.companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ success: false, error: 'Failed to delete lead' });
    }
};

// Convert Lead to Account
export const convertLeadToAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountTypeId, website, address } = req.body;

        // 1. Fetch Lead
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('*')
            .eq('leadId', id)
            .eq('companyId', req.companyId)
            .single();

        if (fetchError || !lead) return res.status(404).json({ success: false, error: 'Lead not found' });
        if (lead.isConverted) return res.status(400).json({ success: false, error: 'Lead is already converted' });

        // 2. Create Account
        const { data: account, error: createError } = await supabase
            .from('accounts')
            .insert([{
                companyId: req.companyId,
                name: lead.companyName || lead.name,
                email: lead.email,
                phone: lead.phone,
                website: website || lead.website,
                accountTypeId,
                accountIndustryId: lead.accountIndustryId,
                billingAddress: address || lead.address,
                assignedTo: req.user.id, // Default to creator/converter for now
                status: 'active',
                createdBy: req.user.id
            }])
            .select()
            .single();

        if (createError) throw createError;

        // 3. Update Lead as Converted
        await supabase
            .from('leads')
            .update({ isConverted: true })
            .eq('leadId', id);

        // 4. Log Activity
        await logLeadActivity(id, 'converted', 'Converted to Account', `Lead converted to Account: ${account.name}`, req.user);

        res.json({ success: true, data: account, message: 'Lead converted to account successfully' });

    } catch (error) {
        console.error('Error converting lead to account:', error);
        res.status(500).json({ success: false, error: 'Failed to convert lead' });
    }
};

// Convert Lead to Contact
export const convertLeadToContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountId, position, address } = req.body;

        // 1. Fetch Lead
        const { data: lead, error: fetchError } = await supabase
            .from('leads')
            .select('*')
            .eq('leadId', id)
            .eq('companyId', req.companyId)
            .single();

        if (fetchError || !lead) return res.status(404).json({ success: false, error: 'Lead not found' });

        // 2. Create Contact
        const { data: contact, error: createError } = await supabase
            .from('contacts')
            .insert([{
                companyId: req.companyId,
                accountId,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                position: position || lead.position,
                address: address || lead.address,
                status: 'active',
                createdBy: req.user.id
            }])
            .select()
            .single();

        if (createError) throw createError;

        // 3. Update Lead as Converted
        await supabase
            .from('leads')
            .update({ isConverted: true })
            .eq('leadId', id);

        // 4. Log Activity
        await logLeadActivity(id, 'converted', 'Converted to Contact', `Lead converted to Contact: ${contact.name}`, req.user);

        res.json({ success: true, data: contact, message: 'Lead converted to contact successfully' });

    } catch (error) {
        console.error('Error converting lead to contact:', error);
        res.status(500).json({ success: false, error: 'Failed to convert lead' });
    }
};

// Export Leads to CSV
export const exportLeads = async (req, res) => {
    try {
        const { search, status, source, sort = 'createdAt', order = 'desc' } = req.query;

        // Start building the query (Similar to getLeads but no pagination)
        let query = supabase
            .from('leads')
            .select(`
                *,
                leadStatus:leadStatusId(name),
                leadSource:leadSourceId(name),
                assignments:leadAssignments(
                    user:userId(name)
                )
            `)
            .eq('companyId', req.companyId);

        // Apply filters
        if (status) query = query.eq('leadStatusId', status);
        if (source) query = query.eq('leadSourceId', source);

        // Apply search
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,companyName.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sort, { ascending: order === 'asc' });

        const { data: leads, error } = await query;

        if (error) throw error;

        // Generate CSV
        const fields = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Assigned To', 'Created At'];
        const csv = [
            fields.join(','),
            ...leads.map(lead => [
                lead.name,
                lead.email,
                lead.phone,
                lead.companyName,
                lead.leadStatus?.name,
                lead.leadSource?.name,
                lead.assignments?.map(a => a.user.name).join('; '),
                new Date(lead.createdAt).toLocaleDateString()
            ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment(`leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Error exporting leads:', error);
        res.status(500).json({ success: false, error: 'Failed to export leads' });
    }
};

// Import Leads (JSON/Bulk)
export const importLeads = async (req, res) => {
    try {
        const { leads } = req.body; // Expects array of objects
        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data. Expected "leads" array.' });
        }

        // Prepare data for insertion (map to schema)
        const leadsToInsert = leads.map(lead => ({
            companyId: req.companyId,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            companyName: lead.companyName || lead.company, // Handle variations
            notes: lead.notes,
            // Status and Source ID resolution is complex implicitly. 
            // Ideally frontend sends IDs or we just leave null.
            // For now, accept IDs if provided.
            leadStatusId: lead.leadStatusId,
            leadSourceId: lead.leadSourceId,
            createdBy: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const { data, error } = await supabase
            .from('leads')
            .insert(leadsToInsert)
            .select();

        if (error) throw error;

        // Skip per-lead logging for bulk import to avoid N+1 inserts.
        // Ideally we would return the IDs.

        res.status(201).json({
            success: true,
            message: `Successfully imported ${data.length} leads`,
            count: data.length
        });

    } catch (error) {
        console.error('Error importing leads:', error);
        res.status(500).json({ success: false, error: 'Failed to import leads' });
    }
};
