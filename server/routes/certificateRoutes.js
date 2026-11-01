import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getMyCertificates,
  downloadCertificate,
  viewCertificateInline,
  getEventCertificates,
  generateEventCertificatesNow,
  regenerateCertificate,
  revokeCertificate,
  bulkDownloadCertificatesZip,
  verifyCertificatePublic
} from '../controllers/certificateController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for public verification endpoint
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this IP. Please try again later.'
  }
});

// Public certificate routes
router.get('/verify/:certificateId', verifyLimiter, verifyCertificatePublic);
router.get('/:id/download', downloadCertificate);
router.get('/:id/view', viewCertificateInline);

// Student routes
router.get('/mine', protect, authorizeRoles('student'), getMyCertificates);

// Organizer routes
router.post('/:id/regenerate', protect, authorizeRoles('organizer'), regenerateCertificate);
router.post('/:id/revoke', protect, authorizeRoles('organizer'), revokeCertificate);

export default router;
