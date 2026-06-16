import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Thêm Access Token vào Header
api.interceptors.request.use(
  (config) => {
    const rawUser = localStorage.getItem('fb_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response: Xử lý lỗi 401 (Hết hạn token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và không phải là request refresh-token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const rawUser = localStorage.getItem('fb_user');
        if (!rawUser) throw new Error('No user data');
        
        const user = JSON.parse(rawUser);
        const refreshToken = user.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API cấp lại Access Token mới
        const rs = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        const { accessToken } = rs.data;

        // Cập nhật Token mới vào LocalStorage
        const updatedUser = { ...user, accessToken };
        localStorage.setItem('fb_user', JSON.stringify(updatedUser));

        // Thử lại request ban đầu với token mới
        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (_error) {
        // Nếu refresh token cũng lỗi (hết hạn), thực hiện logout
        localStorage.removeItem('fb_user');
        window.location.href = '/login';
        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),
};

export const bookingApi = {
  create: (bookingData) => api.post('/bookings', bookingData),
  confirmMockPayment: (id) => api.post(`/bookings/${id}/payment/mock-confirm`),
  paymentSuccess: (id) => api.post(`/bookings/payment-success?bookingId=${id}`),
  getMine: () => api.get('/bookings/me'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

export const paymentApi = {
  createVnPayUrl: (bookingId) => api.post(`/payments/vnpay/create-url?bookingId=${bookingId}`),
};

export default api;
