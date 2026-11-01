import express from 'express';
import { getOrganizerStats } from '../controllers/statsController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('organizer'), getOrganizerStats);

export default router;
