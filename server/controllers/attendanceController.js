import { Attendance } from '../models/Attendance.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';
import { verifyQRToken, generateQRToken } from '../utils/qrToken.js';
import { isWithinGeofence, getHaversineDistance } from '../utils/geofence.js';
import { getAttendanceWindow } from '../utils/eventTime.js';

// Helper to generate a random 6-digit numeric code
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Student Check-In via Dynamic QR or 6-Digit Code
// @route   POST /api/events/:id/attendance/checkin
// @access  Private (Student)
export const checkIn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qrToken, code, latitude, longitude } = req.body;
  const studentId = req.user._id;
  const usn = req.user.usn;

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only registered students can check in for attendance.'
    });
  }

  // 1. Fetch Event
  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.'
    });
  }

  if (!event.attendance?.enabled) {
    return res.status(400).json({
      success: false,
      message: 'Attendance tracking is not enabled for this event.'
    });
  }

  // 2. Verify Registration
  const registration = await Registration.findOne({
    event: event._id,
    student: studentId,
    status: { $ne: 'cancelled' }
  });

  if (!registration) {
    return res.status(403).json({
      success: false,
      message: 'You are not registered for this event. Please register first before checking in.'
    });
  }

  // 3. Check for Duplicate Attendance
  const existingAttendance = await Attendance.findOne({
    event: event._id,
    student: studentId
  });

  if (existingAttendance) {
    return res.status(400).json({
      success: false,
      message: `Attendance has already been marked as ${existingAttendance.status.toUpperCase()} at ${new Date(existingAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      data: existingAttendance
    });
  }

  // 4. Server-Authoritative Time Window Verification
  const now = new Date();
  const window = getAttendanceWindow(event);

  if (now < window.opensAt) {
    const minutesUntilOpen = Math.ceil((window.opensAt - now) / 60000);
    return res.status(400).json({
      success: false,
      message: `Check-in has not opened yet. Check-in opens in ${minutesUntilOpen} minute(s) at ${window.opensAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });
  }

  if (now > window.closesAt) {
    return res.status(400).json({
      success: false,
      message: `Check-in is closed. Check-in window closed at ${window.closesAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });
  }

  // 5. Method Verification (Dynamic QR vs 6-Digit Code)
  let checkInMethod = 'qr';

  if (qrToken) {
    const qrResult = verifyQRToken(qrToken, event._id.toString());
    if (!qrResult.valid) {
      return res.status(400).json({
        success: false,
        message: qrResult.reason || 'Invalid or expired QR token. Please scan the currently displayed code on the live screen.'
      });
    }
    checkInMethod = 'qr';
  } else if (code) {
    const currentCodeObj = event.attendance?.currentCode;
    const isCodeValid =
      currentCodeObj &&
      currentCodeObj.code === code.trim() &&
      new Date() <= new Date(currentCodeObj.expiresAt);

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit event code. Please check the live projector screen.'
      });
    }
    checkInMethod = 'code';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide either a valid scanned QR token or the 6-digit event code.'
    });
  }

  // 6. Optional Geofence Verification
  let geofenceVerified = false;
  if (event.attendance?.geofence?.enabled) {
    const { latitude: venueLat, longitude: venueLng, radiusMeters } = event.attendance.geofence;
    if (venueLat != null && venueLng != null) {
      if (latitude == null || longitude == null) {
        return res.status(400).json({
          success: false,
          message: 'Location verification is required for this event. Please allow GPS location permissions.'
        });
      }

      const distance = getHaversineDistance(latitude, longitude, venueLat, venueLng);
      if (distance > (radiusMeters || 150)) {
        return res.status(400).json({
          success: false,
          message: `Location check failed: You are ${Math.round(distance)}m from the venue. Check-in is permitted only within ${radiusMeters || 150}m.`
        });
      }
      geofenceVerified = true;
    }
  }

  // 7. Calculate Status (on-time vs late)
  let status = 'on-time';
  if (now > window.onTimeDeadline) {
    status = 'late';
  }

  // 8. Create Attendance Record
  const attendance = await Attendance.create({
    event: event._id,
    student: studentId,
    usn: usn.toUpperCase(),
    checkInTime: now,
    status,
    method: checkInMethod,
    ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    deviceInfo: req.headers['user-agent'] || 'Browser Client',
    geofenceVerified
  });

  // 9. Update Registration Status
  registration.status = 'attended';
  await registration.save();

  return res.status(201).json({
    success: true,
    message: status === 'on-time'
      ? 'Checked in on-time! Your attendance has been verified.'
      : 'Checked in late. Attendance recorded (outside on-time grace period).',
    data: {
      attendanceId: attendance._id,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      method: attendance.method,
      requireCheckOut: Boolean(event.attendance?.requireCheckOut)
    }
  });
});

// @desc    Student Check-Out (for events requiring check-out / minimum duration)
// @route   POST /api/events/:id/attendance/checkout
// @access  Private (Student)
export const checkOut = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const attendance = await Attendance.findOne({
    event: id,
    student: studentId
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'No check-in record found for this event. You must check in first.'
    });
  }

  if (attendance.checkOutTime) {
    return res.status(400).json({
      success: false,
      message: `You already checked out at ${new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });
  }

  const now = new Date();
  attendance.checkOutTime = now;
  attendance.durationMinutes = Math.round((now - new Date(attendance.checkInTime)) / 60000);
  await attendance.save();

  sendResponse(res, 200, 'Check-out recorded successfully', {
    attendanceId: attendance._id,
    checkInTime: attendance.checkInTime,
    checkOutTime: attendance.checkOutTime,
    durationMinutes: attendance.durationMinutes
  });
});

// @desc    Get Dynamic QR Token and 6-Digit Code for Live Screen
// @route   GET /api/events/:id/attendance/live-token
// @access  Private (Organizer)
export const getLiveAttendanceToken = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.'
    });
  }

  // Authorization check
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();
  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only access live attendance for your club events.'
    });
  }

  const now = new Date();
  const window = getAttendanceWindow(event);

  // Generate 30-second HMAC QR token
  const qrExpirySeconds = 30;
  const qrToken = generateQRToken(event._id.toString(), qrExpirySeconds);

  // Ensure valid 6-digit code exists or generate new one expiring in 5 minutes
  let currentCode = event.attendance?.currentCode?.code;
  let codeExpiresAt = event.attendance?.currentCode?.expiresAt;

  if (!currentCode || !codeExpiresAt || now >= new Date(codeExpiresAt)) {
    currentCode = generateSixDigitCode();
    codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity

    if (!event.attendance) {
      event.attendance = { enabled: true };
    }
    event.attendance.currentCode = {
      code: currentCode,
      generatedAt: now,
      expiresAt: codeExpiresAt
    };
    await event.save();
  }

  res.status(200).json({
    success: true,
    data: {
      qrToken,
      qrPayload: JSON.stringify({
        eventId: event._id.toString(),
        token: qrToken
      }),
      tokenExpiresInSeconds: qrExpirySeconds,
      code: currentCode,
      codeExpiresAt,
      serverTime: now,
      window: {
        opensAt: window.opensAt,
        closesAt: window.closesAt,
        onTimeDeadline: window.onTimeDeadline,
        isCurrentlyOpen: now >= window.opensAt && now <= window.closesAt
      },
      geofence: event.attendance?.geofence || { enabled: false }
    }
  });
});

// @desc    Get Event Attendance List & Realtime Stats
// @route   GET /api/events/:id/attendance
// @access  Private (Organizer)
export const getEventAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, search } = req.query;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  // Authorization check
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();
  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to view attendance for this event.'
    });
  }

  // Build filter
  const filter = { event: id };
  if (status && status !== 'all') {
    filter.status = status;
  }

  const attendanceList = await Attendance.find(filter)
    .populate('student', 'name usn email branch year avatar')
    .populate('markedBy', 'name email')
    .sort({ checkInTime: -1 });

  // Filter by search if provided
  let filtered = attendanceList;
  if (search) {
    const query = search.toLowerCase();
    filtered = attendanceList.filter(
      (a) =>
        a.usn.toLowerCase().includes(query) ||
        a.student?.name?.toLowerCase().includes(query) ||
        a.student?.email?.toLowerCase().includes(query)
    );
  }

  // Compute aggregate numbers
  const totalRegistrations = await Registration.countDocuments({
    event: id,
    status: { $ne: 'cancelled' }
  });

  const onTimeCount = await Attendance.countDocuments({ event: id, status: 'on-time' });
  const lateCount = await Attendance.countDocuments({ event: id, status: 'late' });
  const manualCount = await Attendance.countDocuments({ event: id, status: 'manual' });
  const totalCheckedIn = onTimeCount + lateCount + manualCount;
  const notCheckedIn = Math.max(0, totalRegistrations - totalCheckedIn);

  res.status(200).json({
    success: true,
    data: {
      attendance: filtered,
      stats: {
        totalRegistrations,
        totalCheckedIn,
        onTimeCount,
        lateCount,
        manualCount,
        notCheckedIn
      }
    }
  });
});

// @desc    Organizer Manual Check-In by USN or Student ID
// @route   POST /api/events/:id/attendance/manual
// @access  Private (Organizer)
export const manualMarkAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usn, reason, status = 'manual' } = req.body;

  if (!usn) {
    return res.status(400).json({ success: false, message: 'USN is required.' });
  }

  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'A mandatory reason is required for manual attendance marking.'
    });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  // Authorization check
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();
  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to mark attendance for this event.'
    });
  }

  const normalizedUSN = usn.trim().toUpperCase();
  const student = await User.findOne({ usn: normalizedUSN, role: 'student' });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: `No student found with USN: ${normalizedUSN}`
    });
  }

  // Verify registration
  let registration = await Registration.findOne({
    event: id,
    student: student._id
  });

  if (!registration) {
    // Optionally auto-register or reject
    return res.status(400).json({
      success: false,
      message: `Student (${normalizedUSN}) was not registered for this event.`
    });
  }

  // Check if already checked in
  let attendance = await Attendance.findOne({ event: id, student: student._id });
  const now = new Date();

  if (attendance) {
    attendance.status = status;
    attendance.method = 'manual';
    attendance.markedBy = req.user._id;
    attendance.manualReason = reason.trim();
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      event: event._id,
      student: student._id,
      usn: normalizedUSN,
      checkInTime: now,
      status: status || 'manual',
      method: 'manual',
      markedBy: req.user._id,
      manualReason: reason.trim(),
      ip: req.ip || '127.0.0.1',
      deviceInfo: 'Organizer Manual Override'
    });
  }

  registration.status = 'attended';
  await registration.save();

  sendResponse(res, 200, `Manual attendance marked for ${student.name} (${normalizedUSN})`, attendance);
});

// @desc    Update Attendance Status with Audit Trail
// @route   PATCH /api/events/:id/attendance/:attendanceId
// @access  Private (Organizer)
export const updateAttendanceStatus = asyncHandler(async (req, res) => {
  const { id, attendanceId } = req.params;
  const { status, manualReason } = req.body;

  if (!status || !['on-time', 'late', 'absent', 'manual'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be on-time, late, absent, or manual.'
    });
  }

  if (!manualReason || manualReason.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'A mandatory audit reason is required when modifying attendance status.'
    });
  }

  const attendance = await Attendance.findOne({ _id: attendanceId, event: id });
  if (!attendance) {
    return res.status(404).json({ success: false, message: 'Attendance record not found.' });
  }

  attendance.status = status;
  attendance.markedBy = req.user._id;
  attendance.manualReason = manualReason.trim();
  await attendance.save();

  sendResponse(res, 200, 'Attendance status updated successfully', attendance);
});

// @desc    Toggle or update attendance settings during live session
// @route   PATCH /api/events/:id/attendance/settings
// @access  Private (Organizer)
export const updateLiveSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enabled, checkInClosesAfter, onTimeGraceMinutes } = req.body;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  if (enabled !== undefined) event.attendance.enabled = Boolean(enabled);
  if (checkInClosesAfter !== undefined) event.attendance.checkInClosesAfter = Number(checkInClosesAfter);
  if (onTimeGraceMinutes !== undefined) event.attendance.onTimeGraceMinutes = Number(onTimeGraceMinutes);

  await event.save();
  sendResponse(res, 200, 'Attendance settings updated', event.attendance);
});
