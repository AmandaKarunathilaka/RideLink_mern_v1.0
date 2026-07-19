import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry globally — only redirect when a session token already exists.
// A 401 during login/register is a normal "wrong credentials" response; intercepting
// it here would hard-redirect before the catch block can show a toast error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = !!localStorage.getItem('token');
    if (error.response?.status === 401 && hasToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;