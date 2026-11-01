import express from 'express';
import {
  getCollegeSettings,
  updateCollegeSettings
} from '../controllers/collegeSettingsController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Publicly readable, organizer writable
router.get('/college', getCollegeSettings);
router.put('/college', protect, authorizeRoles('organizer'), updateCollegeSettings);

export default router;
