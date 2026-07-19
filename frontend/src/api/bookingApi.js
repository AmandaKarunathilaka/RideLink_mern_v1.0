import api from './axiosConfig.js';

export const bookRideApi       = (data)  => api.post('/bookings', data);
export const getMyBookingsApi  = ()      => api.get('/bookings/my-bookings');
export const getBookingByIdApi = (id)    => api.get(`/bookings/${id}`);
export const cancelBookingApi  = (id)    => api.put(`/bookings/${id}/cancel`);