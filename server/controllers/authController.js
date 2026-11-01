import { User } from '../models/User.js';
import { Club } from '../models/Club.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendTokenResponse } from '../utils/jwt.js';
import { sendResponse } from '../utils/apiResponse.js';
import { USN_REGEX } from '../utils/constants.js';

// @desc    Register a new user (Student or Organizer)
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const {
    usn,
    name,
    email,
    phone,
    password,
    confirmPassword,
    role = 'student',
    branch,
    year,
    designation,
    clubId,
    newClubName,
    newClubCategory,
    newClubDescription,
    accessCode
  } = req.body;

  // Basic validation
  if (!usn || !name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  const cleanUsn = usn.trim().toUpperCase();
  if (!USN_REGEX.test(cleanUsn)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid USN format. Example: 1BM22CS045 (VTU standard)'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  // Check unique USN
  const existingUsn = await User.findOne({ usn: cleanUsn });
  if (existingUsn) {
    return res.status(400).json({
      success: false,
      message: 'This USN is already registered'
    });
  }

  // Check unique email
  const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'This email is already registered'
    });
  }

  let assignedClubId = null;

  // Role specific logic
  if (role === 'organizer') {
    const requiredAccessCode = process.env.ORGANIZER_ACCESS_CODE || 'COLLEGE_ORG_2025';
    if (!accessCode || accessCode.trim() !== requiredAccessCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid organizer access code. Please contact the administrator.'
      });
    }

    if (!designation) {
      return res.status(400).json({
        success: false,
        message: 'Designation is required for organizers (e.g., Club President, Coordinator)'
      });
    }

    // Either attach to existing club or create new club
    if (clubId) {
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Selected club does not exist'
        });
      }
      assignedClubId = club._id;
    } else if (newClubName) {
      const slug = newClubName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existingClub = await Club.findOne({
        $or: [{ name: newClubName.trim() }, { slug }]
      });

      if (existingClub) {
        return res.status(400).json({
          success: false,
          message: 'A club with this name already exists'
        });
      }

      const createdClub = await Club.create({
        name: newClubName.trim(),
        slug,
        category: newClubCategory || 'technical',
        description: newClubDescription || `Official ${newClubName} club page`,
        contactEmail: email.trim().toLowerCase(),
        contactPhone: phone.trim(),
        isVerified: true
      });
      assignedClubId = createdClub._id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please select an existing club or create a new club'
      });
    }
  }

  // Create User
  const user = await User.create({
    usn: cleanUsn,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    passwordHash: password,
    role,
    branch: branch || '',
    year: year ? Number(year) : 1,
    designation: designation || '',
    club: assignedClubId
  });

  // If organizer, add user ID to club's organizers list
  if (assignedClubId) {
    await Club.findByIdAndUpdate(assignedClubId, {
      $addToSet: { organizers: user._id }
    });
  }

  // Populate club before returning
  await user.populate('club');

  sendTokenResponse(user, 201, res, 'Account created successfully!');
});

// @desc    Login user (Student or Organizer) using USN + Password
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { usn, password } = req.body;

  if (!usn || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both USN and password'
    });
  }

  const cleanUsn = usn.trim().toUpperCase();

  // Find user with passwordHash
  const user = await User.findOne({ usn: cleanUsn }).populate('club');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid USN or password'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid USN or password'
    });
  }

  sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
    sameSite: 'lax'
  });

  sendResponse(res, 200, 'Logged out successfully');
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('club');
  sendResponse(res, 200, 'Current user retrieved', user);
});
