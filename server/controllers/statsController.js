import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get organizer dashboard analytics and statistics
// @route   GET /api/organizer/stats
// @access  Private (Organizer)
export const getOrganizerStats = asyncHandler(async (req, res, next) => {
  if (!req.user.club) {
    return res.status(400).json({
      success: false,
      message: 'No club associated with your organizer account'
    });
  }

  const clubId = req.user.club._id || req.user.club;
  const now = new Date();

  // 1. Get all events for this club
  const clubEvents = await Event.find({ club: clubId });
  const eventIds = clubEvents.map((e) => e._id);

  // 2. Summary numbers
  const totalEvents = clubEvents.length;
  const upcomingEventsCount = clubEvents.filter(
    (e) => new Date(e.date) >= now && e.status === 'published'
  ).length;

  const totalRegistrations = await Registration.countDocuments({
    event: { $in: eventIds },
    status: 'registered'
  });

  const totalCapacity = clubEvents.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const seatsFilledPercentage =
    totalCapacity > 0 ? Math.min(100, Math.round((totalRegistrations / totalCapacity) * 100)) : 100;

  // 3. Category distribution (for Recharts PieChart)
  const categoryMap = {};
  clubEvents.forEach((ev) => {
    categoryMap[ev.category] = (categoryMap[ev.category] || 0) + 1;
  });
  const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: categoryMap[cat]
  }));

  // 4. Registrations over time (e.g. past 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = await Registration.countDocuments({
      event: { $in: eventIds },
      registeredAt: { $gte: d, $lt: nextDay }
    });

    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    last7Days.push({ date: label, registrations: count });
  }

  // 5. Attendance & Certificate Analytics
  const onTimeAttendance = await Attendance.countDocuments({
    event: { $in: eventIds },
    status: 'on-time'
  });
  const lateAttendance = await Attendance.countDocuments({
    event: { $in: eventIds },
    status: 'late'
  });
  const manualAttendance = await Attendance.countDocuments({
    event: { $in: eventIds },
    status: 'manual'
  });
  const totalAttendance = onTimeAttendance + lateAttendance + manualAttendance;
  const attendanceRate = totalRegistrations > 0
    ? Math.min(100, Math.round((totalAttendance / totalRegistrations) * 100))
    : 0;

  const totalCertificatesIssued = await Certificate.countDocuments({
    event: { $in: eventIds },
    status: 'issued'
  });

  // 6. Recent registrations list
  const recentRegistrations = await Registration.find({
    event: { $in: eventIds }
  })
    .sort({ registeredAt: -1 })
    .limit(8)
    .populate('event', 'title category date venue');

  sendResponse(res, 200, 'Organizer stats retrieved successfully', {
    overview: {
      totalEvents,
      upcomingEventsCount,
      totalRegistrations,
      totalCapacity,
      seatsFilledPercentage,
      totalAttendance,
      attendanceRate,
      onTimeAttendance,
      lateAttendance,
      manualAttendance,
      totalCertificatesIssued
    },
    attendanceBreakdown: [
      { name: 'On-Time', value: onTimeAttendance, color: '#5F7F5B' },
      { name: 'Late', value: lateAttendance, color: '#D9A441' },
      { name: 'Manual Override', value: manualAttendance, color: '#C9895A' }
    ],
    categoryDistribution,
    registrationsOverTime: last7Days,
    recentRegistrations
  });
});
