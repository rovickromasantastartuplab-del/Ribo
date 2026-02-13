import express from 'express';
import { getRoles, createRole, updateRolePermissions, getPermissions, updateRole, deleteRole } from '../controllers/roleController.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// 1. List Roles (View Access)
router.get('/', authorize('role.view'), getRoles);

// 2. List All Permissions (Helper for UI)
router.get('/permissions', authorize('role.view'), getPermissions);

// 3. Create Custom Role (Manage Access)
router.post('/', authorize('role.create'), createRole);

// 4. Update Role Details (Name/Desc)
router.put('/:id', authorize('role.edit'), updateRole);

// 5. Update Role Permissions
router.put('/:id/permissions', authorize('role.edit'), updateRolePermissions);

// 6. Delete Role
router.delete('/:id', authorize('role.delete'), deleteRole);

export default router;
