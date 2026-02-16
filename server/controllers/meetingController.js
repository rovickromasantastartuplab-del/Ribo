import { supabase } from '../config/db.js';

// Get all meetings with optimized joins (prevent N+1)
export const getMeetings = async (req, res, next) => {
    try {
        const { companyId } = req;
        const {
            status,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        // Enforce pagination limits
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
        const offset = (pageNum - 1) * limitNum;

        // Build query with joins to prevent N+1
        let query = supabase
            .from('meetings')
            .select(`
                *,
                creator:createdBy(userId, name, email),
                assignments:meetingAssignments(
                    user:userId(userId, name, email, avatar)
                ),
                attendees:meetingAttendees(
                    meetingAttendeeId,
                    attendeeType,
                    attendeeId,
                    status
                )
            `, { count: 'exact' })
            .eq('companyId', companyId);

        // Filters
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
        }

        if (startDate) {
            query = query.gte('startDate', startDate);
        }

        if (endDate) {
            query = query.lte('endDate', endDate);
        }

        // Pagination
        query = query
            .order('startDate', { ascending: false })
            .range(offset, offset + limitNum - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        // Fetch attendee details in parallel using Promise.all
        const meetingsWithAttendees = await Promise.all(
            data.map(async (meeting) => {
                if (!meeting.attendees || meeting.attendees.length === 0) {
                    meeting.attendees = [];
                    return meeting;
                }

                // Group attendees by type for efficient querying
                const userIds = meeting.attendees.filter(a => a.attendeeType === 'user').map(a => a.attendeeId);
                const contactIds = meeting.attendees.filter(a => a.attendeeType === 'contact').map(a => a.attendeeId);
                const leadIds = meeting.attendees.filter(a => a.attendeeType === 'lead').map(a => a.attendeeId);

                // Fetch all attendee details in parallel
                const [users, contacts, leads] = await Promise.all([
                    userIds.length > 0
                        ? supabase.from('users').select('userId, name, email, avatar').in('userId', userIds).then(r => r.data || [])
                        : [],
                    contactIds.length > 0
                        ? supabase.from('contacts').select('contactId, name, email').in('contactId', contactIds).then(r => r.data || [])
                        : [],
                    leadIds.length > 0
                        ? supabase.from('leads').select('leadId, name, email').in('leadId', leadIds).then(r => r.data || [])
                        : []
                ]);

                // Map attendee details
                meeting.attendees = meeting.attendees.map(attendee => {
                    let attendeeDetails = null;

                    if (attendee.attendeeType === 'user') {
                        attendeeDetails = users.find(u => u.userId === attendee.attendeeId);
                    } else if (attendee.attendeeType === 'contact') {
                        attendeeDetails = contacts.find(c => c.contactId === attendee.attendeeId);
                    } else if (attendee.attendeeType === 'lead') {
                        attendeeDetails = leads.find(l => l.leadId === attendee.attendeeId);
                    }

                    return {
                        ...attendee,
                        attendeeDetails
                    };
                });

                return meeting;
            })
        );

        res.json({
            success: true,
            data: meetingsWithAttendees,
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

// Get single meeting with attendees
export const getMeeting = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('meetings')
            .select(`
                *,
                creator:createdBy(userId, name, email),
                assignments:meetingAssignments(
                    user:userId(userId, name, email, avatar)
                ),
                attendees:meetingAttendees(
                    meetingAttendeeId,
                    attendeeType,
                    attendeeId,
                    status
                )
            `)
            .eq('meetingId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Meeting not found' });

        // Fetch attendee details
        if (data.attendees && data.attendees.length > 0) {
            const userIds = data.attendees.filter(a => a.attendeeType === 'user').map(a => a.attendeeId);
            const contactIds = data.attendees.filter(a => a.attendeeType === 'contact').map(a => a.attendeeId);
            const leadIds = data.attendees.filter(a => a.attendeeType === 'lead').map(a => a.attendeeId);

            const [users, contacts, leads] = await Promise.all([
                userIds.length > 0
                    ? supabase.from('users').select('userId, name, email, avatar').in('userId', userIds).then(r => r.data || [])
                    : [],
                contactIds.length > 0
                    ? supabase.from('contacts').select('contactId, name, email').in('contactId', contactIds).then(r => r.data || [])
                    : [],
                leadIds.length > 0
                    ? supabase.from('leads').select('leadId, name, email').in('leadId', leadIds).then(r => r.data || [])
                    : []
            ]);

            data.attendees = data.attendees.map(attendee => {
                let attendeeDetails = null;

                if (attendee.attendeeType === 'user') {
                    attendeeDetails = users.find(u => u.userId === attendee.attendeeId);
                } else if (attendee.attendeeType === 'contact') {
                    attendeeDetails = contacts.find(c => c.contactId === attendee.attendeeId);
                } else if (attendee.attendeeType === 'lead') {
                    attendeeDetails = leads.find(l => l.leadId === attendee.attendeeId);
                }

                return {
                    ...attendee,
                    attendeeDetails
                };
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create meeting
export const createMeeting = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const {
            title,
            description,
            location,
            startDate,
            endDate,
            startTime,
            endTime,
            parentModule,
            parentId,
            status = 'planned',
            attendees = [], // Array of { type: 'user'|'contact'|'lead', id: 'uuid' }
            assignments = [] // Array of user IDs for multi-assignment
        } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ success: false, error: 'Meeting title is required' });
        }

        if (!startDate || !endDate || !startTime || !endTime) {
            return res.status(400).json({ success: false, error: 'Start and end date/time are required' });
        }

        // Validate date range
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (end < start) {
            return res.status(400).json({ success: false, error: 'End date/time must be after or equal to start date/time' });
        }

        // Validate attendees exist
        if (attendees.length > 0) {
            const userIds = attendees.filter(a => a.type === 'user').map(a => a.id);
            const contactIds = attendees.filter(a => a.type === 'contact').map(a => a.id);
            const leadIds = attendees.filter(a => a.type === 'lead').map(a => a.id);

            // Check users exist
            if (userIds.length > 0) {
                const { data: users } = await supabase
                    .from('users')
                    .select('userId')
                    .eq('companyId', companyId)
                    .in('userId', userIds);

                if (users.length !== userIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more user IDs do not exist' });
                }
            }

            // Check contacts exist
            if (contactIds.length > 0) {
                const { data: contacts } = await supabase
                    .from('contacts')
                    .select('contactId')
                    .eq('companyId', companyId)
                    .in('contactId', contactIds);

                if (contacts.length !== contactIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more contact IDs do not exist' });
                }
            }

            // Check leads exist
            if (leadIds.length > 0) {
                const { data: leads } = await supabase
                    .from('leads')
                    .select('leadId')
                    .eq('companyId', companyId)
                    .in('leadId', leadIds);

                if (leads.length !== leadIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more lead IDs do not exist' });
                }
            }
        }

        // Validate assignments exist
        if (assignments.length > 0) {
            const { data: users } = await supabase
                .from('users')
                .select('userId')
                .eq('companyId', companyId)
                .in('userId', assignments);

            if (users.length !== assignments.length) {
                return res.status(400).json({ success: false, error: 'One or more assigned user IDs do not exist' });
            }
        }

        // 1. Create meeting
        const { data, error } = await supabase
            .from('meetings')
            .insert([{
                companyId,
                title,
                description,
                location,
                startDate,
                endDate,
                startTime,
                endTime,
                parentModule,
                parentId,
                status,
                createdBy: user.id
            }])
            .select(`
                *,
                creator:createdBy(userId, name, email)
            `)
            .single();

        if (error) throw error;

        // 2. Handle Assignments (Pivot Table)
        if (assignments.length > 0) {
            const assignmentRows = assignments.map(userId => ({
                meetingId: data.meetingId,
                userId: userId,
                assignedBy: user.id
            }));

            const { error: assignError } = await supabase
                .from('meetingAssignments')
                .insert(assignmentRows);

            if (assignError) throw assignError;
        }

        // 3. Handle Attendees
        if (attendees.length > 0) {
            const attendeeRows = attendees.map(attendee => ({
                meetingId: data.meetingId,
                attendeeType: attendee.type,
                attendeeId: attendee.id,
                status: 'pending'
            }));

            const { error: attendeeError } = await supabase
                .from('meetingAttendees')
                .insert(attendeeRows);

            if (attendeeError) throw attendeeError;
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Update meeting
export const updateMeeting = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const {
            title,
            description,
            location,
            startDate,
            endDate,
            startTime,
            endTime,
            parentModule,
            parentId,
            status,
            attendees, // Array of { type, id } (Optional)
            assignments // Array of user IDs (Optional)
        } = req.body;

        // Validate date range if both provided
        if (startDate && endDate && startTime && endTime) {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (end < start) {
                return res.status(400).json({ success: false, error: 'End date/time must be after or equal to start date/time' });
            }
        }

        // Validate attendees exist (if provided)
        if (attendees !== undefined && attendees.length > 0) {
            const userIds = attendees.filter(a => a.type === 'user').map(a => a.id);
            const contactIds = attendees.filter(a => a.type === 'contact').map(a => a.id);
            const leadIds = attendees.filter(a => a.type === 'lead').map(a => a.id);

            // Check users exist
            if (userIds.length > 0) {
                const { data: users } = await supabase
                    .from('users')
                    .select('userId')
                    .eq('companyId', companyId)
                    .in('userId', userIds);

                if (users.length !== userIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more user IDs do not exist' });
                }
            }

            // Check contacts exist
            if (contactIds.length > 0) {
                const { data: contacts } = await supabase
                    .from('contacts')
                    .select('contactId')
                    .eq('companyId', companyId)
                    .in('contactId', contactIds);

                if (contacts.length !== contactIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more contact IDs do not exist' });
                }
            }

            // Check leads exist
            if (leadIds.length > 0) {
                const { data: leads } = await supabase
                    .from('leads')
                    .select('leadId')
                    .eq('companyId', companyId)
                    .in('leadId', leadIds);

                if (leads.length !== leadIds.length) {
                    return res.status(400).json({ success: false, error: 'One or more lead IDs do not exist' });
                }
            }
        }


        // 1. Update meeting
        const { data, error } = await supabase
            .from('meetings')
            .update({
                title,
                description,
                location,
                startDate,
                endDate,
                startTime,
                endTime,
                parentModule,
                parentId,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('meetingId', id)
            .eq('companyId', companyId)
            .select(`
                *,
                creator:createdBy(userId, name, email)
            `)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Meeting not found' });

        // 2. Sync Assignments (If Provided)
        if (assignments !== undefined) {
            // Delete existing
            await supabase
                .from('meetingAssignments')
                .delete()
                .eq('meetingId', id);

            // Insert new
            if (assignments.length > 0) {
                const assignmentRows = assignments.map(userId => ({
                    meetingId: id,
                    userId: userId,
                    assignedBy: req.user.id
                }));

                await supabase.from('meetingAssignments').insert(assignmentRows);
            }
        }

        // 3. Sync Attendees (If Provided)
        if (attendees !== undefined) {
            // Delete existing
            await supabase
                .from('meetingAttendees')
                .delete()
                .eq('meetingId', id);

            // Insert new
            if (attendees.length > 0) {
                const attendeeRows = attendees.map(attendee => ({
                    meetingId: id,
                    attendeeType: attendee.type,
                    attendeeId: attendee.id,
                    status: attendee.status || 'pending'
                }));

                await supabase.from('meetingAttendees').insert(attendeeRows);
            }
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete meeting
export const deleteMeeting = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('meetings')
            .delete()
            .eq('meetingId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Meeting not found' });

        res.json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Toggle meeting status
export const toggleMeetingStatus = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        // Get current status
        const { data: existing, error: fetchError } = await supabase
            .from('meetings')
            .select('status')
            .eq('meetingId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return res.status(404).json({ success: false, error: 'Meeting not found' });

        // Toggle status: planned ↔ held
        const newStatus = existing.status === 'planned' ? 'held' : 'planned';

        const { data, error } = await supabase
            .from('meetings')
            .update({
                status: newStatus,
                updatedAt: new Date().toISOString()
            })
            .eq('meetingId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
