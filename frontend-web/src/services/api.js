import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
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
  paymentSuccess: (id) => api.post(`/bookings/payment-success?bookingId=${id}`, { bookingId: id }),
  getMine: () => api.get('/bookings/me'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  cancelPut: (id) => api.put(`/bookings/${id}/cancel`),
  holdSeat: (flightId, seatNumber) => api.post('/bookings/seat-holds', { flightId, seatNumber }),
  releaseSeatHold: (flightId, seatNumber) => api.post('/bookings/seat-holds/release', { flightId, seatNumber }),
};

const mockCombos = [
  {
    id: 1,
    title: 'Kỳ nghỉ trọn gói Đà Nẵng 3N2Đ',
    location: 'Đà Nẵng',
    hotelName: 'InterContinental Danang Sun Peninsula Resort',
    price: 6890000,
    region: 'Miền Trung',
    description: 'Tuyệt tác nghỉ dưỡng bên vịnh Bán đảo Sơn Trà hoang sơ, tận hưởng dịch vụ đẳng cấp thế giới cùng bãi biển riêng tư tuyệt đẹp.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1559592481-74418d7cd362?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Khám phá Đảo Ngọc Phú Quốc 4N3Đ',
    location: 'Phú Quốc',
    hotelName: 'JW Marriott Phu Quoc Emerald Bay Resort',
    price: 9450000,
    region: 'Miền Nam',
    description: 'Tuyệt tác thiết kế mang cảm hứng học đường cổ điển bên Bãi Khem cát trắng mịn, trải nghiệm ẩm thực đỉnh cao và hồ bơi vỏ sò độc đáo.',
    duration: '4 ngày 3 đêm',
    image: 'https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Nha Trang Biển Gọi 3N2Đ',
    location: 'Nha Trang',
    hotelName: 'Amiana Resort Nha Trang',
    price: 5900000,
    region: 'Miền Trung',
    description: 'Thư giãn bên hồ bơi vô cực nước biển tự nhiên rộng lớn cùng bãi tắm cát trắng riêng tư yên bình giữa vịnh Nha Trang lộng gió.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Sapa Mây Ngàn Kỳ Thú 3N2Đ',
    location: 'Sa Pa',
    hotelName: 'Hotel de la Coupole - MGallery',
    price: 4890000,
    region: 'Miền Bắc',
    description: 'Trải nghiệm nét lãng mạn phong cách Pháp hòa quyện nét văn hóa Tây Bắc độc đáo giữa thị trấn mờ sương đẹp như tranh vẽ.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Vịnh Hạ Long Du Thuyền Sang Trọng 2N1Đ',
    location: 'Hạ Long',
    hotelName: 'Paradise Elegance Cruise Halong',
    price: 5490000,
    region: 'Miền Bắc',
    description: 'Hành trình di sản kỳ diệu lênh đênh giữa vịnh biển kỳ vĩ, ngắm hoàng hôn buông xuống từ cabin ban công riêng cao cấp.',
    duration: '2 ngày 1 đêm',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Hùng Vĩ Cao Nguyên Đá Hà Giang 3N2Đ',
    location: 'Hà Giang',
    hotelName: 'P\'apiu Resort Hà Giang',
    price: 6200000,
    region: 'Miền Bắc',
    description: 'Chinh phục cung đường đèo hiểm trở, ngắm mùa hoa tam giác mạch rực rỡ và ẩn mình tại resort sinh thái đẳng cấp biệt lập.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    title: 'Hội An Hoài Niệm Phố Cổ 3N2Đ',
    location: 'Hội An',
    hotelName: 'Anantara Hoi An Resort',
    price: 4500000,
    region: 'Miền Trung',
    description: 'Lưu trú bên dòng sông Hoài thơ mộng, thả đèn hoa đăng lung linh và len lỏi qua từng con hẻm rêu phong nhuộm màu thời gian.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    title: 'Quy Nhơn Hoang Sơ Kỳ Vĩ 3N2Đ',
    location: 'Quy Nhơn',
    hotelName: 'Anantara Quy Nhon Villas',
    price: 7800000,
    region: 'Miền Trung',
    description: 'Bờ biển nguyên sơ cát vàng mịn màng bao quanh bởi những mỏm đá tuyệt tác, tận hưởng hồ bơi riêng biệt độc bản xa hoa.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 9,
    title: 'Đà Lạt Sương Mờ Lãng Mạn 3N2Đ',
    location: 'Đà Lạt',
    hotelName: 'Ana Mandara Villas Dalat Resort & Spa',
    price: 3950000,
    region: 'Miền Trung',
    description: 'Ẩn mình dưới những tán thông ngút ngàn, biệt thự kiến trúc Pháp cổ kính mở ra không gian lãng mạn ấm áp giữa cao nguyên.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 10,
    title: 'Côn Đảo Thiên Đường Tự Nhiên 3N2Đ',
    location: 'Côn Đảo',
    hotelName: 'Six Senses Con Dao Resort',
    price: 12500000,
    region: 'Miền Nam',
    description: 'Thiên đường bảo tồn thiên nhiên biển đảo đỉnh cao, biệt thự gỗ sang trọng ven biển lộng gió mang lại sự thư thái tuyệt hảo.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 11,
    title: 'Gió Biển Hồ Tràm Thanh Bình 3N2Đ',
    location: 'Vũng Tàu',
    hotelName: 'InterContinental Grand Ho Tram',
    price: 3200000,
    region: 'Miền Nam',
    description: 'Trải nghiệm không gian sòng bài, sân golf chuẩn quốc tế ven bãi biển Hồ Tràm hoang sơ cách TP.HCM chỉ hơn 2 giờ di chuyển.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 12,
    title: 'Combo Mũi Né Cát Vàng Lấp Lánh 3N2Đ',
    location: 'Mũi Né',
    hotelName: 'Anantara Mui Ne Resort',
    price: 4100000,
    region: 'Miền Nam',
    description: 'Những rặng dừa xanh đung đưa trước gió bên bờ biển êm đềm, khám phá đồi cát bay trứ danh và thưởng ngoạn hoàng hôn tuyệt mỹ.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80'
  }
];

export const searchCombosApi = async (params) => {
  try {
    const response = await api.get('/combos', { params });
    return response;
  } catch (err) {
    console.warn("Backend /api/combos endpoint not found. Performing local filter fallback.", err);
    let results = [...mockCombos];
    if (params?.destination) {
      const dest = params.destination.toLowerCase().trim();
      results = results.filter(c => 
        c.location.toLowerCase().includes(dest) || 
        c.title.toLowerCase().includes(dest)
      );
    }
    return { data: results };
  }
};

export default api;
