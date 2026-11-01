import api from './api';

export const collegeSettingsService = {
  getCollegeSettings: async () => {
    return await api.get('/settings/college');
  },

  updateCollegeSettings: async (data) => {
    return await api.put('/settings/college', data);
  }
};

export default collegeSettingsService;
