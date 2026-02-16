import { supabase } from '../config/db.js';

// Get all document types
export const getDocumentTypes = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status, search } = req.query;

        let query = supabase
            .from('documentTypes')
            .select('*')
            .eq('companyId', companyId)
            .order('createdAt', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('typeName', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Get single document type
export const getDocumentType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('documentTypes')
            .select('*')
            .eq('documentTypeId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Document type not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create document type
export const createDocumentType = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { typeName, status = 'active' } = req.body;

        if (!typeName) {
            return res.status(400).json({ success: false, error: 'Type name is required' });
        }

        const { data, error } = await supabase
            .from('documentTypes')
            .insert([{
                companyId,
                typeName,
                status,
                createdBy: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Update document type
export const updateDocumentType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const { typeName, status } = req.body;

        const { data, error } = await supabase
            .from('documentTypes')
            .update({
                typeName,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('documentTypeId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Document type not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete document type
export const deleteDocumentType = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { error } = await supabase
            .from('documentTypes')
            .delete()
            .eq('documentTypeId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Document type deleted successfully' });
    } catch (error) {
        next(error);
    }
};
