import express from 'express';
import { authorize } from '../middleware/authorize.js';
import {
    getMeetings,
    getMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingStatus
} from '../controllers/meetingController.js';

const router = express.Router();

// All routes require authentication and meeting.* permissions
router.get('/', authorize('meeting.view'), getMeetings);
router.get('/:id', authorize('meeting.view'), getMeeting);
router.post('/', authorize('meeting.create'), createMeeting);
router.put('/:id', authorize('meeting.edit'), updateMeeting);
router.delete('/:id', authorize('meeting.delete'), deleteMeeting);
router.put('/:id/toggle-status', authorize('meeting.edit'), toggleMeetingStatus);

export default router;
