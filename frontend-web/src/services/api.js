import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('fb_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const bookingApi = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMine: () => api.get('/bookings/me'),
};

export const paymentApi = {
  createVnPayUrl: (bookingId) => api.post(`/payments/vnpay/create-url?bookingId=${bookingId}`),
};

export default api;
