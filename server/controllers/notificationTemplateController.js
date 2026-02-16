import { supabase } from '../config/db.js';

// Helper: Get variables for template
const getVariablesForTemplate = (templateName) => {
    const variables = {
        'Lead Create': {
            '{lead_name}': 'Lead Name',
            '{lead_email}': 'Lead Email',
            '{lead_phone}': 'Lead Phone',
            '{lead_status}': 'Lead Status',
            '{lead_source}': 'Lead Source',
            '{company_name}': 'Company Name'
        },
        'Opportunity Create': {
            '{opportunity_name}': 'Opportunity Name',
            '{amount}': 'Opportunity Amount',
            '{account_name}': 'Account Name',
            '{close_date}': 'Close Date',
            '{stage}': 'Opportunity Stage',
            '{company_name}': 'Company Name'
        },
        'Account Create': {
            '{account_name}': 'Account Name',
            '{account_type}': 'Account Type',
            '{account_industry}': 'Account Industry',
            '{company_name}': 'Company Name'
        },
        'Contact Create': {
            '{contact_name}': 'Contact Name',
            '{contact_email}': 'Contact Email',
            '{contact_phone}': 'Contact Phone',
            '{account_name}': 'Account Name',
            '{company_name}': 'Company Name'
        },
        'Meeting Create': {
            '{meeting_title}': 'Meeting Title',
            '{meeting_date}': 'Meeting Date',
            '{meeting_time}': 'Meeting Time',
            '{meeting_location}': 'Meeting Location',
            '{attendee_count}': 'Attendee Count',
            '{company_name}': 'Company Name'
        },
        'Call Create': {
            '{call_title}': 'Call Title',
            '{call_date}': 'Call Date',
            '{call_time}': 'Call Time',
            '{call_duration}': 'Call Duration',
            '{company_name}': 'Company Name'
        },
        'Quote Create': {
            '{quote_number}': 'Quote Number',
            '{account_name}': 'Account Name',
            '{total_amount}': 'Total Amount',
            '{valid_until}': 'Valid Until Date',
            '{company_name}': 'Company Name'
        },
        'Invoice Create': {
            '{invoice_number}': 'Invoice Number',
            '{account_name}': 'Account Name',
            '{total_amount}': 'Total Amount',
            '{due_date}': 'Due Date',
            '{company_name}': 'Company Name'
        },
        'Document Upload': {
            '{document_name}': 'Document Name',
            '{document_type}': 'Document Type',
            '{uploaded_by}': 'Uploaded By',
            '{company_name}': 'Company Name'
        },
        'Campaign Launch': {
            '{campaign_name}': 'Campaign Name',
            '{campaign_type}': 'Campaign Type',
            '{start_date}': 'Start Date',
            '{budget}': 'Campaign Budget',
            '{company_name}': 'Company Name'
        }
    };

    return variables[templateName] || {
        '{company_name}': 'Company Name',
        '{user_name}': 'User Name',
        '{current_date}': 'Current Date'
    };
};

// Get all notification templates
export const getTemplates = async (req, res, next) => {
    try {
        const { companyId } = req;
        const {
            type,
            search,
            page = 1,
            limit = 10
        } = req.query;

        // Enforce pagination limits
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const offset = (pageNum - 1) * limitNum;

        // Build query
        let query = supabase
            .from('notificationTemplates')
            .select(`
                *
            `, { count: 'exact' });

        // Filters
        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Pagination
        query = query
            .order('name', { ascending: true })
            .range(offset, offset + limitNum - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        // Fetch all content counts in one query (prevents N+1)
        const { data: contentCounts } = await supabase
            .from('notificationTemplateLangs')
            .select('templateId')
            .eq('companyId', companyId)
            .in('templateId', data.map(t => t.notificationTemplateId));

        // Create count map
        const countMap = (contentCounts || []).reduce((acc, item) => {
            acc[item.templateId] = (acc[item.templateId] || 0) + 1;
            return acc;
        }, {});

        // Attach counts to templates
        const templatesWithContent = data.map(template => ({
            ...template,
            contentCount: countMap[template.notificationTemplateId] || 0,
            hasContent: (countMap[template.notificationTemplateId] || 0) > 0
        }));

        res.json({
            success: true,
            data: templatesWithContent,
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

// Get single template with company content
export const getTemplate = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const { lang = 'en' } = req.query;

        // Get base template
        const { data: template, error: templateError } = await supabase
            .from('notificationTemplates')
            .select('*')
            .eq('notificationTemplateId', id)
            .single();

        if (templateError) throw templateError;
        if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

        // Get company-specific content for all languages
        const { data: contents, error: contentError } = await supabase
            .from('notificationTemplateLangs')
            .select(`
                *,
                creator:createdBy(userId, name, email)
            `)
            .eq('templateId', id)
            .eq('companyId', companyId);

        if (contentError) throw contentError;

        // Get available variables for this template
        const variables = getVariablesForTemplate(template.name);

        res.json({
            success: true,
            data: {
                ...template,
                contents: contents || [],
                variables
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create or update template content for a language
export const updateTemplateContent = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { id } = req.params;
        const {
            lang = 'en',
            title,
            content
        } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Title and content are required' });
        }

        // Verify template exists
        const { data: template, error: templateError } = await supabase
            .from('notificationTemplates')
            .select('notificationTemplateId')
            .eq('notificationTemplateId', id)
            .single();

        if (templateError || !template) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        // Check if content exists for this language
        const { data: existing } = await supabase
            .from('notificationTemplateLangs')
            .select('langId')
            .eq('templateId', id)
            .eq('companyId', companyId)
            .eq('lang', lang)
            .single();

        let result;

        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('notificationTemplateLangs')
                .update({
                    title,
                    content,
                    updatedAt: new Date().toISOString()
                })
                .eq('langId', existing.langId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('notificationTemplateLangs')
                .insert([{
                    templateId: id,
                    lang,
                    title,
                    content,
                    companyId,
                    createdBy: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// Delete template content for a language
export const deleteTemplateContent = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id, langId } = req.params;

        const { data, error } = await supabase
            .from('notificationTemplateLangs')
            .delete()
            .eq('langId', langId)
            .eq('templateId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Content not found' });

        res.json({ success: true, message: 'Template content deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get user notification preferences
export const getUserPreferences = async (req, res, next) => {
    try {
        const { user } = req;

        const { data, error } = await supabase
            .from('userNotificationTemplates')
            .select(`
                *,
                template:templateId(notificationTemplateId, name, type)
            `)
            .eq('userId', user.id);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (error) {
        next(error);
    }
};

// Update user notification preference
export const updateUserPreference = async (req, res, next) => {
    try {
        const { user } = req;
        const { templateId } = req.params;
        const { isActive } = req.body;

        // Check if preference exists
        const { data: existing } = await supabase
            .from('userNotificationTemplates')
            .select('userTemplateId')
            .eq('userId', user.id)
            .eq('templateId', templateId)
            .single();

        let result;

        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('userNotificationTemplates')
                .update({
                    isActive,
                    updatedAt: new Date().toISOString()
                })
                .eq('userTemplateId', existing.userTemplateId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('userNotificationTemplates')
                .insert([{
                    userId: user.id,
                    templateId,
                    isActive
                }])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// Get available template types
export const getTemplateTypes = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('notificationTemplates')
            .select('type')
            .order('type');

        if (error) throw error;

        // Get unique types
        const types = [...new Set(data.map(t => t.type))];

        res.json({ success: true, data: types });
    } catch (error) {
        next(error);
    }
};
