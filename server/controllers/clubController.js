import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get all clubs with optional search and category filter
// @route   GET /api/clubs
// @access  Public
export const getClubs = asyncHandler(async (req, res, next) => {
  const { search, category } = req.query;
  const filter = {};

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tagline: searchRegex }
    ];
  }

  const clubs = await Club.find(filter)
    .populate('organizers', 'name usn designation avatar')
    .sort({ createdAt: -1 });

  // Attach event counts for each club
  const clubsWithStats = await Promise.all(
    clubs.map(async (club) => {
      const eventCount = await Event.countDocuments({
        club: club._id,
        status: { $ne: 'cancelled' }
      });
      return {
        ...club.toObject(),
        eventCount
      };
    })
  );

  sendResponse(res, 200, 'Clubs retrieved successfully', clubsWithStats);
});

// @desc    Get single club by slug with upcoming & past events
// @route   GET /api/clubs/:slug
// @access  Public
export const getClubBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const club = await Club.findOne({ slug }).populate(
    'organizers',
    'name usn designation avatar email phone'
  );

  if (!club) {
    return res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }

  const now = new Date();

  // Find upcoming and past events for this club
  const upcomingEvents = await Event.find({
    club: club._id,
    status: 'published',
    date: { $gte: now }
  })
    .sort({ date: 1 })
    .populate('club', 'name logo slug');

  const pastEvents = await Event.find({
    club: club._id,
    $or: [{ date: { $lt: now } }, { status: 'completed' }]
  })
    .sort({ date: -1 })
    .populate('club', 'name logo slug');

  sendResponse(res, 200, 'Club details retrieved', {
    club,
    upcomingEvents,
    pastEvents
  });
});

// @desc    Create a new club (Organizer only)
// @route   POST /api/clubs
// @access  Private (Organizer)
export const createClub = asyncHandler(async (req, res, next) => {
  const {
    name,
    tagline,
    description,
    category,
    foundedYear,
    facultyCoordinator,
    contactEmail,
    contactPhone,
    socialLinks,
    logo,
    banner
  } = req.body;

  if (!name || !description || !category || !contactEmail) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required club details'
    });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const existing = await Club.findOne({ $or: [{ name: name.trim() }, { slug }] });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A club with this name or slug already exists'
    });
  }

  const club = await Club.create({
    name: name.trim(),
    slug,
    tagline: tagline || '',
    description,
    category,
    foundedYear: foundedYear || new Date().getFullYear(),
    facultyCoordinator: facultyCoordinator || {},
    contactEmail: contactEmail.toLowerCase().trim(),
    contactPhone: contactPhone || '',
    socialLinks: socialLinks || {},
    logo: logo || '',
    banner: banner || '',
    organizers: [req.user._id],
    isVerified: true
  });

  // Assign this club to the organizer
  req.user.club = club._id;
  await req.user.save();

  sendResponse(res, 201, 'Club created successfully', club);
});

// @desc    Update club profile (Organizer of this club only)
// @route   PUT /api/clubs/:id
// @access  Private (Organizer)
export const updateClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const club = await Club.findById(id);

  if (!club) {
    return res.status(404).json({
      success: false,
      message: 'Club not found'
    });
  }

  // Authorization: check if current user is an organizer of this club
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const isOrganizer = userClubId && userClubId === club._id.toString();

  if (!isOrganizer && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are only authorized to manage your own club'
    });
  }

  const allowedFields = [
    'tagline',
    'description',
    'category',
    'foundedYear',
    'facultyCoordinator',
    'contactEmail',
    'contactPhone',
    'socialLinks',
    'logo',
    'banner'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      club[field] = req.body[field];
    }
  });

  const updatedClub = await club.save();
  sendResponse(res, 200, 'Club updated successfully', updatedClub);
});
