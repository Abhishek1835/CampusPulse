import { Signatory } from '../models/Signatory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get All Signatories for Organizer
// @route   GET /api/signatories
// @access  Private (Organizer)
export const getSignatories = asyncHandler(async (req, res) => {
  const userClubId = req.user.club?._id || req.user.club;
  
  // Return signatories belonging to the club or global ones
  const filter = { isActive: true };
  if (userClubId) {
    filter.$or = [{ club: userClubId }, { club: null }, { club: { $exists: false } }];
  }

  const signatories = await Signatory.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Signatories fetched successfully', signatories);
});

// @desc    Create New Signatory
// @route   POST /api/signatories
// @access  Private (Organizer)
export const createSignatory = asyncHandler(async (req, res) => {
  const { name, designation, department, signatureImage } = req.body;
  const userClubId = req.user.club?._id || req.user.club;

  if (!name || !designation) {
    return res.status(400).json({
      success: false,
      message: 'Name and designation are required.'
    });
  }

  const signatory = await Signatory.create({
    name: name.trim(),
    designation: designation.trim(),
    department: department ? department.trim() : '',
    signatureImage: signatureImage || '',
    isActive: true,
    createdBy: req.user._id,
    club: userClubId || null
  });

  sendResponse(res, 201, 'Signatory created successfully', signatory);
});

// @desc    Update Signatory
// @route   PUT /api/signatories/:id
// @access  Private (Organizer)
export const updateSignatory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, designation, department, signatureImage, isActive } = req.body;

  const signatory = await Signatory.findById(id);
  if (!signatory) {
    return res.status(404).json({ success: false, message: 'Signatory not found.' });
  }

  if (name !== undefined) signatory.name = name.trim();
  if (designation !== undefined) signatory.designation = designation.trim();
  if (department !== undefined) signatory.department = department ? department.trim() : '';
  if (signatureImage !== undefined) signatory.signatureImage = signatureImage;
  if (isActive !== undefined) signatory.isActive = Boolean(isActive);

  await signatory.save();
  sendResponse(res, 200, 'Signatory updated successfully', signatory);
});

// @desc    Delete (Soft Delete) Signatory
// @route   DELETE /api/signatories/:id
// @access  Private (Organizer)
export const deleteSignatory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const signatory = await Signatory.findById(id);
  if (!signatory) {
    return res.status(404).json({ success: false, message: 'Signatory not found.' });
  }

  signatory.isActive = false;
  await signatory.save();

  sendResponse(res, 200, 'Signatory deactivated successfully');
});
