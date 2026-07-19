import api from './axiosConfig.js';

export const postRideApi       = (data)    => api.post('/rides', data);
export const searchRidesApi    = (params)  => api.get('/rides/search', { params });
export const getTodaysRidesApi = (limit=6) => api.get('/rides/today', { params: { limit } });
export const getRideByIdApi    = (id)      => api.get(`/rides/${id}`);
export const getMyRidesApi     = ()        => api.get('/rides/my-rides');
export const cancelRideApi     = (id)      => api.put(`/rides/${id}/cancel`);