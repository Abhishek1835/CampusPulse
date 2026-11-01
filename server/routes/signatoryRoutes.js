import express from 'express';
import {
  getSignatories,
  createSignatory,
  updateSignatory,
  deleteSignatory
} from '../controllers/signatoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('organizer'), getSignatories);
router.post('/', protect, authorizeRoles('organizer'), createSignatory);
router.put('/:id', protect, authorizeRoles('organizer'), updateSignatory);
router.delete('/:id', protect, authorizeRoles('organizer'), deleteSignatory);

export default router;
