import express from 'express';
import {
  getClubs,
  getClubBySlug,
  createClub,
  updateClub
} from '../controllers/clubController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getClubs);
router.get('/:slug', getClubBySlug);
router.post('/', protect, authorizeRoles('organizer'), createClub);
router.put('/:id', protect, authorizeRoles('organizer'), updateClub);

export default router;
