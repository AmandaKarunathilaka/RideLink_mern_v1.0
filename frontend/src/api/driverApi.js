import api from './axiosConfig.js';

export const uploadLicenseApi    = (formData) =>
  api.post('/driver/upload-license', formData);

export const getLicenseStatusApi = () =>
  api.get('/driver/license-status');