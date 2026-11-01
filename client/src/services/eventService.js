import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    return await api.get('/events', { params });
  },
  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },
  createEvent: async (eventData) => {
    return await api.post('/events', eventData);
  },
  updateEvent: async (id, eventData) => {
    return await api.put(`/events/${id}`, eventData);
  },
  deleteEvent: async (id) => {
    return await api.delete(`/events/${id}`);
  },
  getOrganizerEvents: async () => {
    return await api.get('/events/organizer/mine');
  }
};
