import express from 'express';
import {
  getMyRegistrations,
  toggleAttendance,
  removeParticipant
} from '../controllers/registrationController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/mine', protect, authorizeRoles('student'), getMyRegistrations);
router.patch('/:id/attendance', protect, authorizeRoles('organizer'), toggleAttendance);
router.delete('/:id', protect, authorizeRoles('organizer'), removeParticipant);

export default router;
