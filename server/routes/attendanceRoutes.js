import express from 'express';
import {
  checkIn,
  checkOut,
  getLiveAttendanceToken,
  getEventAttendance,
  manualMarkAttendance,
  updateAttendanceStatus,
  updateLiveSettings
} from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Student check-in / check-out
router.post('/checkin', protect, authorizeRoles('student'), checkIn);
router.post('/checkout', protect, authorizeRoles('student'), checkOut);

// Organizer attendance endpoints
router.get('/live-token', protect, authorizeRoles('organizer'), getLiveAttendanceToken);
router.get('/', protect, authorizeRoles('organizer'), getEventAttendance);
router.post('/manual', protect, authorizeRoles('organizer'), manualMarkAttendance);
router.patch('/settings', protect, authorizeRoles('organizer'), updateLiveSettings);
router.patch('/:attendanceId', protect, authorizeRoles('organizer'), updateAttendanceStatus);

export default router;
