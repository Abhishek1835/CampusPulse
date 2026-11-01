import api from './api';

export const statsService = {
  getOrganizerStats: async () => {
    return await api.get('/organizer/stats');
  }
};
