import api from './api';

export const clubService = {
  getClubs: async (params = {}) => {
    return await api.get('/clubs', { params });
  },
  getClubBySlug: async (slug) => {
    return await api.get(`/clubs/${slug}`);
  },
  createClub: async (clubData) => {
    return await api.post('/clubs', clubData);
  },
  updateClub: async (id, clubData) => {
    return await api.put(`/clubs/${id}`, clubData);
  }
};
