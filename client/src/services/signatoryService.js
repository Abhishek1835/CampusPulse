import api from './api';

export const signatoryService = {
  getSignatories: async () => {
    return await api.get('/signatories');
  },

  createSignatory: async (data) => {
    return await api.post('/signatories', data);
  },

  updateSignatory: async (id, data) => {
    return await api.put(`/signatories/${id}`, data);
  },

  deleteSignatory: async (id) => {
    return await api.delete(`/signatories/${id}`);
  }
};

export default signatoryService;
