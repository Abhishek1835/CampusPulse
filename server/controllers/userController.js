import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('club');
  sendResponse(res, 200, 'Profile retrieved', user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Fields allowed to update (USN and email remain strictly protected)
  const { name, phone, branch, year, designation, avatar } = req.body;

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (branch) user.branch = branch;
  if (year) user.year = Number(year);
  if (avatar !== undefined) user.avatar = avatar;

  if (user.role === 'organizer' && designation) {
    user.designation = designation.trim();
  }

  const updatedUser = await user.save();
  await updatedUser.populate('club');

  sendResponse(res, 200, 'Profile updated successfully', updatedUser);
});
