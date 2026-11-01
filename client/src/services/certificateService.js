import api from './api';

export const certificateService = {
  // Student: fetch current user's earned certificates & notes
  getMyCertificates: async () => {
    return await api.get('/certificates/mine');
  },

  // Public: verify certificate by ID (works unauthenticated)
  verifyCertificatePublic: async (certificateId) => {
    return await api.get(`/verify/${certificateId}`);
  },

  // Organizer: get certificates for an event
  getEventCertificates: async (eventId, status = 'all') => {
    return await api.get(`/events/${eventId}/certificates`, {
      params: { status }
    });
  },

  // Organizer: manual override trigger to generate all certificates now
  generateCertificatesNow: async (eventId) => {
    return await api.post(`/events/${eventId}/certificates/generate`);
  },

  // Organizer: regenerate a single certificate
  regenerateCertificate: async (certificateId) => {
    return await api.post(`/certificates/${certificateId}/regenerate`);
  },

  // Organizer: revoke a certificate
  revokeCertificate: async (certificateId, reason) => {
    return await api.post(`/certificates/${certificateId}/revoke`, { reason });
  },

  // Direct download URL helper
  getDownloadUrl: (certificateId) => {
    return `/api/certificates/${certificateId}/download`;
  },

  // Direct view inline URL helper
  getViewUrl: (certificateId) => {
    return `/api/certificates/${certificateId}/view`;
  },

  // Bulk ZIP download URL helper
  getZipDownloadUrl: (eventId) => {
    return `/api/events/${eventId}/certificates/zip`;
  }
};

export default certificateService;
