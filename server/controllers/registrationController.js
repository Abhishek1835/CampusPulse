import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Register for an event (Student only)
// @route   POST /api/events/:id/register
// @access  Private (Student)
export const registerForEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { teamName, teamMembers } = req.body;

  // 1. Role validation
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can register for events'
    });
  }

  // 2. Event validation
  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: `Event is currently ${event.status} and not accepting registrations`
    });
  }

  // 3. Deadline check
  const now = new Date();
  if (now > new Date(event.registrationDeadline)) {
    return res.status(400).json({
      success: false,
      message: 'Registration deadline has passed for this event'
    });
  }

  // 4. Duplicate check
  const existingRegistration = await Registration.findOne({
    event: event._id,
    student: req.user._id,
    status: 'registered'
  });

  if (existingRegistration) {
    return res.status(400).json({
      success: false,
      message: 'You are already registered for this event'
    });
  }

  // 5. Concurrency-safe capacity check
  if (event.capacity > 0) {
    const activeCount = await Registration.countDocuments({
      event: event._id,
      status: 'registered'
    });
    if (activeCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event has reached full capacity!'
      });
    }
  }

  // 6. Team validation if team event
  let parsedMembers = [];
  if (event.isTeamEvent) {
    if (!teamName || teamName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Team name is required for team events'
      });
    }

    if (Array.isArray(teamMembers)) {
      parsedMembers = teamMembers.map((m) => ({
        name: m.name ? m.name.trim() : '',
        usn: m.usn ? m.usn.trim().toUpperCase() : ''
      }));

      const totalTeamSize = parsedMembers.length + 1; // including the registering student
      if (
        totalTeamSize < event.teamSizeMin ||
        totalTeamSize > event.teamSizeMax
      ) {
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${event.teamSizeMin} and ${event.teamSizeMax} members (including team lead)`
        });
      }
    }
  }

  // If previous registration was cancelled, re-activate or create new
  let registration = await Registration.findOne({
    event: event._id,
    student: req.user._id
  });

  if (registration) {
    registration.status = 'registered';
    registration.registeredAt = new Date();
    registration.teamName = teamName ? teamName.trim() : '';
    registration.teamMembers = parsedMembers;
    registration.branch = req.user.branch;
    registration.year = req.user.year;
    registration.phone = req.user.phone;
    registration.email = req.user.email;
    registration.name = req.user.name;
    await registration.save();
  } else {
    registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      usn: req.user.usn,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      branch: req.user.branch || '',
      year: req.user.year || 1,
      teamName: teamName ? teamName.trim() : '',
      teamMembers: parsedMembers,
      status: 'registered'
    });
  }

  await registration.populate({
    path: 'event',
    populate: { path: 'club', select: 'name logo' }
  });

  sendResponse(res, 201, 'Successfully registered for event!', registration);
});

// @desc    Cancel event registration (Student only)
// @route   DELETE /api/events/:id/register
// @access  Private (Student)
export const cancelRegistration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const registration = await Registration.findOne({
    event: id,
    student: req.user._id,
    status: 'registered'
  }).populate('event');

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Active registration not found for this event'
    });
  }

  // Check if cancellation is allowed before deadline
  if (
    registration.event &&
    new Date() > new Date(registration.event.registrationDeadline)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel registration after the registration deadline has passed'
    });
  }

  registration.status = 'cancelled';
  await registration.save();

  sendResponse(res, 200, 'Registration cancelled successfully');
});

// @desc    Get student's own registrations
// @route   GET /api/registrations/mine
// @access  Private (Student)
export const getMyRegistrations = asyncHandler(async (req, res, next) => {
  const registrations = await Registration.find({ student: req.user._id })
    .populate({
      path: 'event',
      populate: { path: 'club', select: 'name logo slug tagline' }
    })
    .sort({ registeredAt: -1 });

  sendResponse(res, 200, 'My registrations retrieved', registrations);
});

// @desc    Get all registrations for an event (Organizer for own club)
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer)
export const getEventRegistrations = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { search, branch, year } = req.query;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'You can only view registrations for events hosted by your club'
    });
  }

  const query = { event: id };

  if (branch && branch !== 'all') {
    query.branch = branch;
  }

  if (year && year !== 'all') {
    query.year = Number(year);
  }

  if (search && search.trim() !== '') {
    const sRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: sRegex }, { usn: sRegex }, { email: sRegex }, { teamName: sRegex }];
  }

  const registrations = await Registration.find(query).sort({ registeredAt: -1 }).lean();
  
  // Fetch Attendance and Certificates for all participants of this event
  const attendances = await Attendance.find({ event: id }).lean();
  const certificates = await Certificate.find({ event: id }).lean();

  const attendanceMap = new Map();
  attendances.forEach((att) => {
    attendanceMap.set(att.student.toString(), att);
  });

  const certificateMap = new Map();
  certificates.forEach((cert) => {
    certificateMap.set(cert.student.toString(), cert);
  });

  // Enrich registrations
  const enrichedRegistrations = registrations.map((r) => {
    const sId = r.student ? r.student.toString() : '';
    const att = attendanceMap.get(sId);
    const cert = certificateMap.get(sId);

    return {
      ...r,
      attendanceRecord: att || null,
      attendanceStatus: att ? att.status : (r.status === 'attended' ? 'on-time' : 'absent'),
      checkInTime: att ? att.checkInTime : null,
      checkOutTime: att ? att.checkOutTime : null,
      certificateRecord: cert || null,
      certificateStatus: cert ? cert.status : 'not-issued'
    };
  });

  const totalRegistered = await Registration.countDocuments({
    event: id,
    status: 'registered'
  });
  const totalAttended = await Registration.countDocuments({
    event: id,
    status: 'attended'
  });

  sendResponse(res, 200, 'Registrations retrieved', {
    event: {
      _id: event._id,
      title: event.title,
      capacity: event.capacity,
      date: event.date,
      startTime: event.startTime,
      venue: event.venue,
      attendance: event.attendance,
      certificate: event.certificate
    },
    totalRegistered,
    totalAttended,
    registrations: enrichedRegistrations
  });
});

// @desc    Toggle attendance status of participant
// @route   PATCH /api/registrations/:id/attendance
// @access  Private (Organizer)
export const toggleAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const registration = await Registration.findById(id).populate('event');
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration record not found'
    });
  }

  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = registration.event?.club?._id
    ? registration.event.club._id.toString()
    : registration.event?.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: Participant belongs to another club event'
    });
  }

  registration.status = status || (registration.status === 'attended' ? 'registered' : 'attended');
  await registration.save();

  sendResponse(res, 200, `Participant marked as ${registration.status}`, registration);
});

// @desc    Remove participant from event (Organizer)
// @route   DELETE /api/registrations/:id
// @access  Private (Organizer)
export const removeParticipant = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const registration = await Registration.findById(id).populate('event');
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration record not found'
    });
  }

  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = registration.event?.club?._id
    ? registration.event.club._id.toString()
    : registration.event?.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only remove participants from your club events'
    });
  }

  registration.status = 'cancelled';
  await registration.save();

  sendResponse(res, 200, 'Participant removed from event registration');
});

// @desc    Export registrations to CSV
// @route   GET /api/events/:id/registrations/export
// @access  Private (Organizer)
export const exportRegistrationsCSV = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();

  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to export registrations for this event'
    });
  }

  const registrations = await Registration.find({ event: id }).sort({ registeredAt: -1 }).lean();
  const attendances = await Attendance.find({ event: id }).lean();
  const certificates = await Certificate.find({ event: id }).lean();

  const attendanceMap = new Map();
  attendances.forEach((att) => {
    attendanceMap.set(att.student.toString(), att);
  });

  const certificateMap = new Map();
  certificates.forEach((cert) => {
    certificateMap.set(cert.student.toString(), cert);
  });

  // Generate enriched CSV Header & rows
  const headers = [
    'Registration ID',
    'USN',
    'Full Name',
    'Email',
    'Phone',
    'Branch',
    'Year',
    'Team Name',
    'Team Members',
    'Registration Status',
    'Registered At',
    'Attendance Status',
    'Check-in Time',
    'Check-out Time',
    'Duration (min)',
    'Certificate ID',
    'Certificate Status'
  ];

  const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

  const rows = registrations.map((r) => {
    const sId = r.student ? r.student.toString() : '';
    const att = attendanceMap.get(sId);
    const cert = certificateMap.get(sId);

    const teamMembersStr = r.teamMembers
      ? r.teamMembers.map((m) => `${m.name} (${m.usn})`).join('; ')
      : '';

    const attStatus = att ? att.status : (r.status === 'attended' ? 'on-time' : 'absent');
    const checkInStr = att && att.checkInTime ? new Date(att.checkInTime).toLocaleString() : '';
    const checkOutStr = att && att.checkOutTime ? new Date(att.checkOutTime).toLocaleString() : '';
    const durationStr = att && att.durationMinutes != null ? String(att.durationMinutes) : '';
    const certIdStr = cert ? cert.certificateId : '';
    const certStatusStr = cert ? cert.status : 'not-issued';

    return [
      escapeCSV(r._id),
      escapeCSV(r.usn),
      escapeCSV(r.name),
      escapeCSV(r.email),
      escapeCSV(r.phone),
      escapeCSV(r.branch),
      escapeCSV(r.year),
      escapeCSV(r.teamName),
      escapeCSV(teamMembersStr),
      escapeCSV(r.status),
      escapeCSV(r.registeredAt ? r.registeredAt.toISOString() : ''),
      escapeCSV(attStatus),
      escapeCSV(checkInStr),
      escapeCSV(checkOutStr),
      escapeCSV(durationStr),
      escapeCSV(certIdStr),
      escapeCSV(certStatusStr)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');

  const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
});
