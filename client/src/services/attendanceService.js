import api from './api';

export const attendanceService = {
  // Student check-in with dynamic QR token or 6-digit code
  checkIn: async (eventId, { qrToken, code, latitude, longitude }) => {
    return await api.post(`/events/${eventId}/attendance/checkin`, {
      qrToken,
      code,
      latitude,
      longitude
    });
  },

  // Student check-out
  checkOut: async (eventId) => {
    return await api.post(`/events/${eventId}/attendance/checkout`);
  },

  // Organizer: fetch live 30s QR token and current 6-digit code
  getLiveAttendanceToken: async (eventId) => {
    return await api.get(`/events/${eventId}/attendance/live-token`);
  },

  // Organizer: get attendance list and summary counters
  getEventAttendance: async (eventId, params = {}) => {
    return await api.get(`/events/${eventId}/attendance`, { params });
  },

  // Organizer: manual attendance marking with mandatory audit reason
  manualMarkAttendance: async (eventId, { usn, reason, status = 'manual' }) => {
    return await api.post(`/events/${eventId}/attendance/manual`, {
      usn,
      reason,
      status
    });
  },

  // Organizer: update attendance status
  updateAttendanceStatus: async (eventId, attendanceId, { status, manualReason }) => {
    return await api.patch(`/events/${eventId}/attendance/${attendanceId}`, {
      status,
      manualReason
    });
  },

  // Organizer: update live attendance settings
  updateLiveSettings: async (eventId, settings) => {
    return await api.patch(`/events/${eventId}/attendance/settings`, settings);
  }
};

export default attendanceService;
