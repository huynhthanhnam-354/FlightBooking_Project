import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Flight, Booking, User } from '../types/flight';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthData extends User {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// Interceptor cho Request: Thêm Access Token vào Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const rawUser = localStorage.getItem('fb_user');
    if (rawUser) {
      const user: AuthData = JSON.parse(rawUser);
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
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và không phải là request refresh-token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const rawUser = localStorage.getItem('fb_user');
        if (!rawUser) throw new Error('No user data');
        
        const user: AuthData = JSON.parse(rawUser);
        const refreshToken = user.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API cấp lại Access Token mới
        const rs = await axios.post<{ accessToken: string }>(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        const { accessToken } = rs.data;

        // Cập nhật Token mới vào LocalStorage
        const updatedUser: AuthData = { ...user, accessToken };
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
  login: (credentials: any) => api.post<AuthData>('/auth/login', credentials),
  register: (userData: any) => api.post<AuthData>('/auth/register', userData),
  refreshToken: (token: string) => api.post<{ accessToken: string }>('/auth/refresh-token', { refreshToken: token }),
};

export const bookingApi = {
  create: (bookingData: any) => api.post<Booking>('/bookings', bookingData),
  getMine: () => api.get<Booking[]>('/bookings/me'),
  cancel: (id: number) => api.post<Booking>(`/bookings/${id}/cancel`),
};

export const paymentApi = {
  createVnPayUrl: (bookingId: number) => api.post<{ paymentUrl: string }>(`/payments/vnpay/create-url?bookingId=${bookingId}`),
};

export default api;
