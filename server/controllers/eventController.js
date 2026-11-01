import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get all public events with filters, search, sort, pagination
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res, next) => {
  const {
    search,
    category,
    club,
    from,
    to,
    fee,
    mode,
    availability,
    sort = 'date_asc',
    page = 1,
    limit = 9
  } = req.query;

  const query = { status: 'published' };

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Club filter
  if (club && club !== 'all') {
    query.club = club;
  }

  // Mode filter
  if (mode && mode !== 'all') {
    query.mode = mode;
  }

  // Fee filter (free vs paid)
  if (fee === 'free') {
    query.fee = 0;
  } else if (fee === 'paid') {
    query.fee = { $gt: 0 };
  }

  // Date range filter
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  // Search filter (text across title, description, tags)
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { tags: { $in: [searchRegex] } },
      { venue: searchRegex }
    ];
  }

  // Sorting
  let sortOption = { date: 1 };
  if (sort === 'date_desc') sortOption = { date: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 9;
  const skip = (pageNum - 1) * limitNum;

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate('club', 'name logo slug tagline')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // Attach live registration count and seats left for each event
  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const regCount = await Registration.countDocuments({
        event: event._id,
        status: 'registered'
      });
      const seatsLeft =
        event.capacity > 0 ? Math.max(0, event.capacity - regCount) : null;
      const isPastDeadline = new Date() > new Date(event.registrationDeadline);
      const isFull = event.capacity > 0 && regCount >= event.capacity;

      return {
        ...event.toObject(),
        registeredCount: regCount,
        seatsLeft,
        isFull,
        isPastDeadline
      };
    })
  );

  // Filter by availability if requested
  let filteredEvents = eventsWithStats;
  if (availability === 'open') {
    filteredEvents = eventsWithStats.filter(
      (ev) => !ev.isPastDeadline && !ev.isFull
    );
  }

  sendResponse(res, 200, 'Events retrieved successfully', {
    events: filteredEvents,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get single event details with club and user registration status
// @route   GET /api/events/:id
// @access  Public (Optional auth for checking registration)
export const getEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate('club')
    .populate('createdBy', 'name usn email designation');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Get current active registrations count
  const registeredCount = await Registration.countDocuments({
    event: event._id,
    status: 'registered'
  });

  const seatsLeft =
    event.capacity > 0 ? Math.max(0, event.capacity - registeredCount) : null;
  const isFull = event.capacity > 0 && registeredCount >= event.capacity;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);

  // Check if current user is registered (if logged in)
  let userRegistration = null;
  if (req.user && req.user.role === 'student') {
    userRegistration = await Registration.findOne({
      event: event._id,
      student: req.user._id,
      status: 'registered'
    });
  }

  sendResponse(res, 200, 'Event retrieved successfully', {
    event,
    registeredCount,
    seatsLeft,
    isFull,
    isPastDeadline,
    userRegistration
  });
});

// @desc    Create new event (Organizer for own club)
// @route   POST /api/events
// @access  Private (Organizer)
export const createEvent = asyncHandler(async (req, res, next) => {
  if (!req.user.club) {
    return res.status(400).json({
      success: false,
      message: 'You must belong to a club to create events. Please set up your club first.'
    });
  }

  const {
    title,
    description,
    shortDescription,
    poster,
    category,
    tags,
    date,
    startTime,
    endTime,
    venue,
    mode,
    meetingLink,
    registrationDeadline,
    capacity,
    fee,
    isTeamEvent,
    teamSizeMin,
    teamSizeMax,
    rules,
    prizes,
    eligibility,
    contactPersons,
    status
  } = req.body;

  if (!title || !description || !category || !date || !startTime || !endTime || !venue || !registrationDeadline) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all mandatory event fields'
    });
  }

  // Parse tags and rules if provided as strings or arrays
  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const parsedRules = Array.isArray(rules)
    ? rules
    : typeof rules === 'string'
    ? rules.split('\n').map((r) => r.trim()).filter(Boolean)
    : [];

  const event = await Event.create({
    title: title.trim(),
    description,
    shortDescription: shortDescription || '',
    poster: poster || '',
    club: req.user.club,
    createdBy: req.user._id,
    category,
    tags: parsedTags,
    date: new Date(date),
    startTime,
    endTime,
    venue: venue.trim(),
    mode: mode || 'offline',
    meetingLink: meetingLink || '',
    registrationDeadline: new Date(registrationDeadline),
    capacity: capacity ? Number(capacity) : 0,
    fee: fee ? Number(fee) : 0,
    isTeamEvent: Boolean(isTeamEvent),
    teamSizeMin: isTeamEvent ? Number(teamSizeMin) || 1 : 1,
    teamSizeMax: isTeamEvent ? Number(teamSizeMax) || 1 : 1,
    rules: parsedRules,
    prizes: prizes || '',
    eligibility: eligibility || 'Open to all college students',
    contactPersons: contactPersons || [
      {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      }
    ],
    status: status || 'published'
  });

  await event.populate('club');

  sendResponse(res, 201, 'Event created successfully!', event);
});

// @desc    Update existing event (Organizer for own club)
// @route   PUT /api/events/:id
// @access  Private (Organizer)
export const updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if organizer belongs to the club hosting this event
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'You can only update events created by your club'
    });
  }

  const updatableFields = [
    'title',
    'description',
    'shortDescription',
    'poster',
    'category',
    'tags',
    'date',
    'startTime',
    'endTime',
    'venue',
    'mode',
    'meetingLink',
    'registrationDeadline',
    'capacity',
    'fee',
    'isTeamEvent',
    'teamSizeMin',
    'teamSizeMax',
    'rules',
    'prizes',
    'eligibility',
    'contactPersons',
    'status'
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'tags' && typeof req.body.tags === 'string') {
        event.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      } else if (field === 'rules' && typeof req.body.rules === 'string') {
        event.rules = req.body.rules.split('\n').map((r) => r.trim()).filter(Boolean);
      } else if (field === 'date' || field === 'registrationDeadline') {
        event[field] = new Date(req.body[field]);
      } else {
        event[field] = req.body[field];
      }
    }
  });

  const updatedEvent = await event.save();
  await updatedEvent.populate('club');

  sendResponse(res, 200, 'Event updated successfully', updatedEvent);
});

// @desc    Delete event (Organizer for own club)
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check authorization
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete events created by your club'
    });
  }

  // Delete event registrations as required by specification
  await Registration.deleteMany({ event: event._id });
  await Event.findByIdAndDelete(id);

  sendResponse(res, 200, 'Event and associated registrations deleted successfully');
});

// @desc    Get organizer's club events with metrics
// @route   GET /api/events/organizer/mine
// @access  Private (Organizer)
export const getOrganizerEvents = asyncHandler(async (req, res, next) => {
  if (!req.user.club) {
    return res.status(400).json({
      success: false,
      message: 'No club associated with your organizer account'
    });
  }

  const events = await Event.find({ club: req.user.club })
    .populate('club', 'name logo')
    .sort({ createdAt: -1 });

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const regCount = await Registration.countDocuments({
        event: event._id,
        status: 'registered'
      });
      const attendedCount = await Registration.countDocuments({
        event: event._id,
        status: 'attended'
      });
      return {
        ...event.toObject(),
        registeredCount: regCount,
        attendedCount,
        seatsLeft: event.capacity > 0 ? Math.max(0, event.capacity - regCount) : 'Unlimited'
      };
    })
  );

  sendResponse(res, 200, 'Organizer events retrieved', eventsWithStats);
});
