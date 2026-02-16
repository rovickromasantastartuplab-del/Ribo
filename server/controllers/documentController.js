import { supabase } from '../config/db.js';
import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept common document types
        const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, images'));
    }
});

// Helper: Ensure company folder exists in Supabase Storage
const ensureCompanyFolder = async (companyId) => {
    try {
        // Check if folder exists by trying to list files
        const { data, error } = await supabase.storage
            .from('documents')
            .list(companyId, { limit: 1 });

        // If error is "Not found", create the folder by uploading a placeholder
        if (error && error.message.includes('not found')) {
            // Create folder by uploading a .keep file
            await supabase.storage
                .from('documents')
                .upload(`${companyId}/.keep`, new Blob([''], { type: 'text/plain' }), {
                    cacheControl: '3600',
                    upsert: false
                });
        }

        return true;
    } catch (err) {
        console.error('Error ensuring company folder:', err);
        return false;
    }
};

// Export multer middleware
export const uploadMiddleware = upload.single('file');

// Get all documents with filters and joins
export const getDocuments = async (req, res, next) => {
    try {
        const { companyId } = req;
        const {
            status,
            search,
            accountId,
            folderId,
            typeId,
            opportunityId,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        // Build query with joins to prevent N+1
        let query = supabase
            .from('documents')
            .select(`
                *,
                account:accountId(accountId, name),
                folder:folderId(documentFolderId, name),
                type:typeId(documentTypeId, typeName),
                opportunity:opportunityId(opportunityId, name),
                creator:createdBy(userId, name, email)
            `, { count: 'exact' })
            .eq('companyId', companyId)
            .order('createdAt', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (status) query = query.eq('status', status);
        if (search) query = query.ilike('name', `%${search}%`);
        if (accountId) query = query.eq('accountId', accountId);
        if (folderId) query = query.eq('folderId', folderId);
        if (typeId) query = query.eq('typeId', typeId);
        if (opportunityId) query = query.eq('opportunityId', opportunityId);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data,
            pagination: {
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

// Get single document
export const getDocument = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('documents')
            .select(`
                *,
                account:accountId(accountId, name),
                folder:folderId(documentFolderId, name),
                type:typeId(documentTypeId, typeName),
                opportunity:opportunityId(opportunityId, name),
                creator:createdBy(userId, name, email)
            `)
            .eq('documentId', id)
            .eq('companyId', companyId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Document not found' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Create document with file upload
export const createDocument = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const {
            name,
            accountId,
            folderId,
            typeId,
            opportunityId,
            publishDate,
            expirationDate,
            description,
            status = 'active'
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Document name is required' });
        }

        let filePath = null;

        // Upload file to Supabase Storage if provided
        if (req.file) {
            // Ensure company folder exists (creates on first upload)
            await ensureCompanyFolder(companyId);

            const file = req.file;
            const fileName = `${Date.now()}_${file.originalname}`;
            const storagePath = `${companyId}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(storagePath, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;
            filePath = uploadData.path;
        }

        // Create document record
        const { data, error } = await supabase
            .from('documents')
            .insert([{
                companyId,
                name,
                accountId: accountId || null,
                folderId: folderId || null,
                typeId: typeId || null,
                opportunityId: opportunityId || null,
                publishDate: publishDate || null,
                expirationDate: expirationDate || null,
                attachment: filePath,
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

// Update document
export const updateDocument = async (req, res, next) => {
    try {
        const { companyId, user } = req;
        const { id } = req.params;
        const {
            name,
            accountId,
            folderId,
            typeId,
            opportunityId,
            publishDate,
            expirationDate,
            description,
            status
        } = req.body;

        // Get existing document
        const { data: existing, error: fetchError } = await supabase
            .from('documents')
            .select('attachment')
            .eq('documentId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });

        let filePath = existing.attachment;

        // Upload new file if provided
        if (req.file) {
            // Ensure company folder exists
            await ensureCompanyFolder(companyId);

            const file = req.file;
            const fileName = `${Date.now()}_${file.originalname}`;
            const storagePath = `${companyId}/${fileName}`;

            // Delete old file if exists
            if (existing.attachment) {
                await supabase.storage
                    .from('documents')
                    .remove([existing.attachment]);
            }

            // Upload new file
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(storagePath, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;
            filePath = uploadData.path;
        }

        // Update document record
        const { data, error } = await supabase
            .from('documents')
            .update({
                name,
                accountId: accountId || null,
                folderId: folderId || null,
                typeId: typeId || null,
                opportunityId: opportunityId || null,
                publishDate: publishDate || null,
                expirationDate: expirationDate || null,
                attachment: filePath,
                description,
                status,
                updatedAt: new Date().toISOString()
            })
            .eq('documentId', id)
            .eq('companyId', companyId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// Delete document
export const deleteDocument = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        // Get document to find file path
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('attachment')
            .eq('documentId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

        // Delete file from storage if exists
        if (document.attachment) {
            await supabase.storage
                .from('documents')
                .remove([document.attachment]);
        }

        // Delete document record
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('documentId', id)
            .eq('companyId', companyId);

        if (error) throw error;

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Download document
export const downloadDocument = async (req, res, next) => {
    try {
        const { companyId } = req;
        const { id } = req.params;

        // Get document
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('attachment, name')
            .eq('documentId', id)
            .eq('companyId', companyId)
            .single();

        if (fetchError) throw fetchError;
        if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
        if (!document.attachment) return res.status(404).json({ success: false, error: 'File not found' });

        // Get signed URL for download
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(document.attachment, 60); // 60 seconds expiry

        if (error) throw error;

        res.json({ success: true, data: { url: data.signedUrl, name: document.name } });
    } catch (error) {
        next(error);
    }
};
