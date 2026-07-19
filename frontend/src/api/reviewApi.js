import api from './axiosConfig.js';

export const addReviewApi        = (data)     => api.post('/reviews', data);
export const getDriverReviewsApi = (driverId) => api.get(`/reviews/driver/${driverId}`);
export const getBookingReviewApi = (bookingId) => api.get(`/reviews/booking/${bookingId}`);
export const getMyReviewsApi     = ()         => api.get('/reviews/my-reviews');