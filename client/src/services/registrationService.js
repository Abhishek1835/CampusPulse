import api from './api';

export const registrationService = {
  registerForEvent: async (eventId, teamData = {}) => {
    return await api.post(`/events/${eventId}/register`, teamData);
  },
  cancelRegistration: async (eventId) => {
    return await api.delete(`/events/${eventId}/register`);
  },
  getMyRegistrations: async () => {
    return await api.get('/registrations/mine');
  },
  getEventRegistrations: async (eventId, params = {}) => {
    return await api.get(`/events/${eventId}/registrations`, { params });
  },
  toggleAttendance: async (regId, status) => {
    return await api.patch(`/registrations/${regId}/attendance`, { status });
  },
  removeParticipant: async (regId) => {
    return await api.delete(`/registrations/${regId}`);
  },
  exportRegistrationsCSV: (eventId) => {
    // Direct link to initiate download with auth cookie/token
    window.open(`/api/events/${eventId}/registrations/export`, '_blank');
  }
};
