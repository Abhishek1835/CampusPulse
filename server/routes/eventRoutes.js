import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
} from '../controllers/eventController.js';
import {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
  exportRegistrationsCSV
} from '../controllers/registrationController.js';
import {
  getEventCertificates,
  generateEventCertificatesNow,
  bulkDownloadCertificatesZip
} from '../controllers/certificateController.js';
import attendanceRoutes from './attendanceRoutes.js';
import { protect, authorizeRoles, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Mount attendance sub-router
router.use('/:id/attendance', attendanceRoutes);

// Public routes
router.get('/', getEvents);
router.get('/organizer/mine', protect, authorizeRoles('organizer'), getOrganizerEvents);
router.get('/:id', optionalProtect, getEventById);

// Organizer event management
router.post('/', protect, authorizeRoles('organizer'), createEvent);
router.put('/:id', protect, authorizeRoles('organizer'), updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer'), deleteEvent);

// Student registration
router.post('/:id/register', protect, authorizeRoles('student'), registerForEvent);
router.delete('/:id/register', protect, authorizeRoles('student'), cancelRegistration);

// Organizer participant management
router.get('/:id/registrations', protect, authorizeRoles('organizer'), getEventRegistrations);
router.get('/:id/registrations/export', protect, authorizeRoles('organizer'), exportRegistrationsCSV);

// Organizer certificate management for event
router.get('/:id/certificates', protect, authorizeRoles('organizer'), getEventCertificates);
router.post('/:id/certificates/generate', protect, authorizeRoles('organizer'), generateEventCertificatesNow);
router.get('/:id/certificates/zip', protect, authorizeRoles('organizer'), bulkDownloadCertificatesZip);

export default router;
