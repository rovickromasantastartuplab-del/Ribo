import express from 'express';
import { getUsers, inviteUser, updateUser, deleteUser, resendInvite } from '../controllers/userController.js';
import { authorize } from '../middleware/authorize.js';
import { checkLimit } from '../middleware/checkPlan.js';

const router = express.Router();

// 1. List Users
router.get('/', authorize('user.view'), getUsers);

// 2. Invite User (Direct Creation)
// Enforce 'maxUsers' plan limit
router.post('/', authorize('user.create'), checkLimit('maxUsers'), inviteUser);

// 3. Update User
router.put('/:id', authorize('user.edit'), updateUser);

// 4. Resend Invitation
router.post('/:id/resend-invite', authorize('user.edit'), resendInvite);

// 5. Delete User
router.delete('/:id', authorize('user.delete'), deleteUser);

export default router;
