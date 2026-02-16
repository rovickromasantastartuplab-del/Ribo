import { supabase } from '../config/db.js';

// Get all document folders (with hierarchy support)
export const getDocumentFolders = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { status, search, parentId } = req.query;

        let query = supabase
            .from('documentFolders')
            .select('*')
            .eq('companyId', companyId)
            .order('createdAt', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Filter by parent folder (null for root folders)
        if (parentId === 'root' || parentId === null) {
            query = query.is('parentFolderId', null);
        } else if (parentId) {
            query = query.eq('parentFolderId', parentId);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Get single document folder
export const getDocumentFolder = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('documentFolders')
            .select('*')
            .eq('documentFolderId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Folder not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create document folder
export const createDocumentFolder = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { name, parentFolderId, description, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Folder name is required' });
        }

        const { data, error } = await supabase
            .from('documentFolders')
            .insert([{
                companyId,
                name,
                parentFolderId: parentFolderId || null,
                description,
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

// Update document folder
export const updateDocumentFolder = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;
        const { name, parentFolderId, description, status } = req.body;

        const { data, error } = await supabase
            .from('documentFolders')
            .update({
                name,
                parentFolderId: parentFolderId || null,
                description,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('documentFolderId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Folder not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete document folder
export const deleteDocumentFolder = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { error } = await supabase
            .from('documentFolders')
            .delete()
            .eq('documentFolderId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Folder deleted successfully' });
    } catch (error) {
        next(error);
    }
};
