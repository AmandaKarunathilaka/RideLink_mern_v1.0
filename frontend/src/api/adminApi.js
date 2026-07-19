import api from './axiosConfig.js';

export const getPendingLicensesApi = ()      => api.get('/admin/pending-licenses');
export const getAllUsersApi         = ()      => api.get('/admin/all-users');
export const getAllRidesApi         = ()      => api.get('/admin/all-rides');
export const getAllBookingsApi      = ()      => api.get('/admin/all-bookings');
export const getAdminStatsApi      = ()      => api.get('/admin/stats');
export const verifyDriverApi       = (id, data) => api.put(`/admin/verify-driver/${id}`, data);
export const adminCancelRideApi    = (id)    => api.put(`/admin/cancel-ride/${id}`);