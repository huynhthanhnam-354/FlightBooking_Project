import React, { useState, useEffect } from 'react';
import { 
  FaPlane, FaHotel, FaCalendarAlt, FaStar, FaSlidersH, FaSearch, FaUser, FaTimes, FaMinus, FaPlus 
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchCombosApi } from '../services/api';
import BookingModal from '../components/BookingModal';
import ComboAiAssistant from '../components/ComboAiAssistant';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Polyfill for global object required by stompjs
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

const mockData = [
  {
    id: 1,
    title: 'Kỳ nghỉ trọn gói Đà Nẵng 3N2Đ',
    location: 'Đà Nẵng',
    hotelName: 'InterContinental Danang Sun Peninsula Resort',
    price: 6890000,
    region: 'Miền Trung',
    description: 'Tuyệt tác nghỉ dưỡng bên vịnh Bán đảo Sơn Trà hoang sơ, tận hưởng dịch vụ đẳng cấp thế giới cùng bãi biển riêng tư tuyệt đẹp.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1559592481-74418d7cd362?auto=format&fit=crop&w=600&q=80',
    popularity: 95,
    discount: 20,
    aiRecommendation: 'best_price',
    availableSlots: 5
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
    image: 'https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=600&q=80',
    popularity: 98,
    discount: 15,
    aiRecommendation: 'price_up',
    availableSlots: 2
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
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    popularity: 88,
    discount: 10,
    availableSlots: 8
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
    image: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=600&q=80',
    popularity: 92,
    discount: 25,
    aiRecommendation: 'best_price',
    availableSlots: 1
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
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80',
    popularity: 87,
    discount: 18,
    availableSlots: 6
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
    image: 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80',
    popularity: 89,
    discount: 12,
    availableSlots: 4
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
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    popularity: 91,
    discount: 30,
    aiRecommendation: 'best_price',
    availableSlots: 3
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
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    popularity: 84,
    discount: 14,
    availableSlots: 7
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
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    popularity: 93,
    discount: 22,
    aiRecommendation: 'price_up',
    availableSlots: 2
  },
  {
    id: 10,
    title: 'Côn Đảo Thiên Đường Tự Nhiên 3N2Đ',
    location: 'Côn Đảo',
    hotelName: 'Six Senses Con Dao Resort',
    price: 12500000,
    region: 'Miền Nam',
    description: 'Thiên đường bảo tồn thiên nhiên biển đảo đỉnh cao, biệt thự gỗ sang trọng ven biển lộng gió mang lại sự thái tuyệt hảo.',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    popularity: 96,
    discount: 8,
    availableSlots: 5
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
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
    popularity: 82,
    discount: 16,
    availableSlots: 9
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
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    popularity: 86,
    discount: 21,
    availableSlots: 4
  }
];

// Stable hash-based weather recommendation matching the Java service
const generateMockAiRecommendation = (location) => {
  if (!location) return "";
  const loc = location.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < loc.length; i++) {
    hash = loc.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const statuses = ["Sunny", "Rainy", "Cloudy"];
  const weather = statuses[hash % statuses.length];
  
  if (weather === "Sunny") {
    return `☀️ Thời tiết hôm nay tại ${location} đang nắng đẹp 28°C. AI gợi ý bạn tham gia các hoạt động tắm biển, lặn ngắm san hô và thưởng thức tiệc BBQ bãi biển vào chiều nay!`;
  } else if (weather === "Rainy") {
    return `🌧️ ${location} hôm nay có mưa rào. Để chuyến đi trọn vẹn, AI gợi ý bạn dành thời gian thư giãn tại Spa của resort, trải nghiệm lớp học nấu ăn truyền thống và thưởng thức cafe ngắm mưa.`;
  } else {
    return `⛅ Thời tiết ${location} hôm nay dịu mát, nhiều mây rất thích hợp cho việc đi dạo phố cổ, tham quan bảo tàng hoặc check-in các địa điểm di sản mà không lo bị nắng gắt.`;
  }
};

// Helper to enrich static mock data with detailed hotel profiles
const enrichMockWithHotelProfile = (item) => {
  const profiles = {
    1: {
      hotelStars: 5,
      roomQuality: "Cao cấp, biệt thự sườn đồi view biển Sơn Trà trọn vẹn, nội thất tinh xảo đậm chất văn hóa Việt",
      hotelAmenities: ["Bãi biển riêng tư", "Hồ bơi vô cực ngoài trời", "Harnn Heritage Spa", "Nhà hàng La Maison 1888", "Trung tâm thể hình hiện đại", "Bữa sáng buffet thượng hạng"]
    },
    2: {
      hotelStars: 5,
      roomQuality: "Tuyệt tác thiết kế Bãi Khem, phòng Deluxe view biển ngoạn mục, nội thất cổ điển chuẩn xa hoa",
      hotelAmenities: ["Hồ bơi vỏ sò độc đáo", "Spa by JW cao cấp", "Nhà hàng Pink Pearl ẩm thực Pháp", "Bãi tắm cát trắng riêng tư", "Lớp học làm bánh miễn phí", "Bữa sáng buffet chuẩn quốc tế"]
    },
    3: {
      hotelStars: 5,
      roomQuality: "Biệt thự sát biển lãng mạn, phòng tắm mở hòa mình vào thiên nhiên, view vịnh Nha Trang xanh mát",
      hotelAmenities: ["Hồ bơi nước biển tự nhiên", "Hồ bơi nước ngọt vô cực", "Tắm bùn khoáng nóng ôn tuyền", "Bãi tắm riêng yên bình", "Nhà hàng hải sản tươi sống", "Bữa sáng buffet miễn phí"]
    },
    4: {
      hotelStars: 5,
      roomQuality: "Phòng Indochine Pháp cổ kính quyến rũ, view núi Fansipan hùng vĩ, bồn tắm đứng nghệ thuật",
      hotelAmenities: ["Hồ bơi nước nóng Le Grand Bassin", "Nuages Spa cao cấp", "Nhà hàng Chic ẩm thực Pháp-Việt", "Quầy bar ngoài trời trên tầng mái", "Câu lạc bộ trẻ em", "Bữa sáng buffet miễn phí"]
    },
    5: {
      hotelStars: 5,
      roomQuality: "Cabin sang trọng ban công riêng ngắm vịnh di sản, nội thất gỗ ấm cúng quý phái",
      hotelAmenities: ["Spa trị liệu chuyên sâu", "Lớp học Taichi sáng sớm", "Nhà hàng Le Marin ẩm thực cao cấp", "Boong tàu tắm nắng 360 độ", "Trải nghiệm chèo thuyền kayak", "Tiệc tối hoàng hôn lãng mạn"]
    },
    6: {
      hotelStars: 5,
      roomQuality: "Biệt thự biệt lập ẩn mình giữa thiên nhiên cao nguyên đá, nội thất gỗ thủ công tinh tế",
      hotelAmenities: ["Hồ Jacuzzi ngoài trời", "Dịch vụ quản gia riêng 24/7", "Trải nghiệm đi bộ trekking", "Rạp chiếu phim ngoài trời", "Bữa tối BBQ tại đỉnh núi", "Bữa sáng tại phòng miễn phí"]
    },
    7: {
      hotelStars: 5,
      roomQuality: "Phòng suite ban công lớn hướng sông Hoài thơ mộng, nội thất gỗ mang âm hưởng phố cổ",
      hotelAmenities: ["Hồ bơi ngoài trời xanh mát", "Lớp học nấu ăn truyền thống", "Spa chăm sóc thảo dược", "Du thuyền sông Hoài hoàng hôn", "Nhà hàng ẩm thực Hội An", "Bữa sáng buffet miễn phí"]
    },
    8: {
      hotelStars: 5,
      roomQuality: "Biệt thự hồ bơi riêng hướng vịnh Quy Nhơn, nội thất đá tự nhiên và gỗ tếch đẳng cấp",
      hotelAmenities: ["Hồ bơi riêng biệt độc bản", "Trị liệu Spa bên bờ đá", "Dịch vụ ăn uống tại biệt thự", "Lớp dạy Yoga sáng sớm", "Trung tâm thể hình hiện đại", "Bữa sáng buffet miễn phí"]
    },
    9: {
      hotelStars: 5,
      roomQuality: "Biệt thự Pháp cổ kính nép mình dưới rừng thông, lò sưởi ấm cúng và bồn tắm vintage",
      hotelAmenities: ["Hồ bơi nước ấm ngoài trời", "La Cochinchine Spa", "Nhà hàng Le Petit ẩm thực Pháp", "Vườn rau hữu cơ sinh thái", "Tour khám phá biệt thự cổ", "Bữa sáng buffet miễn phí"]
    },
    10: {
      hotelStars: 5,
      roomQuality: "Biệt thự gỗ mộc mạc tinh tế ven biển, hồ bơi tràn bờ riêng tư tuyệt hảo",
      hotelAmenities: ["Hồ bơi tràn bờ riêng biệt", "Spa Six Senses đẳng cấp thế giới", "Rạp chiếu phim ngoài trời", "Trải nghiệm xem rùa đẻ trứng", "Nhà hàng By The Beach hải sản", "Bữa sáng buffet hữu cơ"]
    },
    11: {
      hotelStars: 5,
      roomQuality: "Phòng Grand view biển Hồ Tràm thanh bình, thiết kế hiện đại trang nhã rộng rãi",
      hotelAmenities: ["Sân golf The Bluffs chuẩn quốc tế", "Khu phức hợp sòng bài giải trí", "Hệ thống 4 hồ bơi tràn bờ", "Spa trị liệu cao cấp", "Rạp chiếu phim hiện đại", "Bữa sáng buffet miễn phí"]
    },
    12: {
      hotelStars: 5,
      roomQuality: "Biệt thự vườn nhiệt đới thanh bình, bồn tắm bằng đá nguyên khối ngắm vườn cây xanh mát",
      hotelAmenities: ["Hồ bơi vô cực hướng biển", "Anantara Spa cao cấp", "Nhà hàng L'Anmien ẩm thực Á-Âu", "Hoạt động thể thao dưới nước", "Lớp học pha chế cocktail", "Bữa sáng buffet miễn phí"]
    }
  };

  const profile = profiles[item.id] || {
    hotelStars: 5,
    roomQuality: "Phòng nghỉ dưỡng chất lượng cao, ban công thoáng đãng, trang thiết bị tiện nghi chuẩn 5 sao",
    hotelAmenities: ["Bãi tắm riêng", "Hồ bơi vô cực ngoài trời", "Trung tâm Spa", "Nhà hàng Á-Âu", "Bữa sáng miễn phí"]
  };

  return {
    ...item,
    ...profile
  };
};

const enrichedMockData = mockData.map(item => {
  const enrichedItem = enrichMockWithHotelProfile(item);
  return {
    ...enrichedItem,
    aiRecommendation: generateMockAiRecommendation(item.location)
  };
});

const regions = [
  { id: 'all', label: 'Tất cả điểm đến' },
  { id: 'Miền Bắc', label: 'Miền Bắc' },
  { id: 'Miền Trung', label: 'Miền Trung' },
  { id: 'Miền Nam', label: 'Miền Nam' }
];

export default function ComboList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [customizingCombo, setCustomizingCombo] = useState(null);
  const [sortOption, setSortOption] = useState('');

  // Search Bar & Filter States
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    guests: 1,
    budget: 0
  });
  
  const [combos, setCombos] = useState(enrichedMockData);
  const [isSearching, setIsSearching] = useState(false);

  // Hook to parse initial URL search parameters on mount/navigation
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const fromVal = queryParams.get('from');
    const toVal = queryParams.get('to');
    const dateVal = queryParams.get('date');
    const guestsVal = queryParams.get('guests');

    const parsedParams = {
      origin: fromVal || '',
      destination: toVal || '',
      departureDate: dateVal || '',
      guests: parseInt(guestsVal) || 1,
      budget: 0
    };

    if (fromVal || toVal || dateVal || guestsVal) {
      setSearchParams(parsedParams);
    }
    
    const fetchInitialCombos = async () => {
      setIsSearching(true);
      try {
        const res = await searchCombosApi(parsedParams);
        setCombos(res.data || []);
      } catch (err) {
        console.error("Initial combos search error:", err);
      } finally {
        setIsSearching(false);
      }
    };
    fetchInitialCombos();
  }, [location.search]);

  // 1. Establish STOMP connection over SockJS and subscribe to topic
  useEffect(() => {
    let socket;
    let client;
    try {
      socket = new SockJS('/ws-seat-selection');
      client = Stomp.over(socket);
      client.debug = () => {}; // Disable verbose logs in console

      client.connect({}, (frame) => {
        // Subscribe to combos availability topic
        client.subscribe('/topic/combos-availability', (message) => {
          try {
            const payload = JSON.parse(message?.body || '{}');
            const { comboId, availableSlots, customerCity, cityName, messageText } = payload;

            // 2. Update availability counts
            if (comboId !== undefined && availableSlots !== undefined) {
              setCombos(prev => prev.map(c => 
                c.id === Number(comboId) 
                  ? { ...c, availableSlots: Number(availableSlots) } 
                  : c
              ));
            }

            // 3. Show Toast notification when a booking occurs
            const city = customerCity || cityName;
            if (city) {
              toast.info(`Một khách hàng tại ${city} vừa đặt thành công combo này!`, {
                position: "bottom-right",
                autoClose: 5000
              });
            } else if (messageText && messageText.includes("đặt thành công")) {
              toast.info(messageText, {
                position: "bottom-right",
                autoClose: 5000
              });
            }
          } catch (err) {
            console.error("Error parsing combos-availability websocket payload:", err);
          }
        });
      }, (error) => {
        console.warn("STOMP connection failed for ComboList, running offline:", error);
      });
    } catch (e) {
      console.error("Failed to connect websocket client:", e);
    }

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const res = await searchCombosApi(searchParams);
      setCombos(res.data || []);
      toast.success('Đã cập nhật danh sách Combo!');
    } catch (err) {
      console.error("Search error:", err);
      toast.error('Lỗi khi tải kết quả tìm kiếm Combo.');
    } finally {
      setIsSearching(false);
    }
  };

  // Callback to handle updates sent from the AI Combo Assistant Chat widget
  const handleApplyAiFilters = ({ origin, destination, budget }) => {
    const airportToCity = {
      'pqc': 'Phú Quốc',
      'dad': 'Đà Nẵng',
      'cxr': 'Nha Trang',
      'han': 'Hà Nội',
      'sgn': 'Hồ Chí Minh',
      'dli': 'Đà Lạt',
      'uih': 'Quy Nhơn'
    };

    const resolvedDestination = airportToCity[destination?.toLowerCase()] || destination;
    const resolvedOrigin = airportToCity[origin?.toLowerCase()] || origin;

    setSearchParams(prev => ({
      ...prev,
      origin: resolvedOrigin || prev.origin,
      destination: resolvedDestination || prev.destination,
      budget: budget || 0
    }));

    // Perform local destination filtering if matches found
    if (resolvedDestination) {
      const dest = resolvedDestination.toLowerCase().trim();
      const filtered = enrichedMockData.filter(c => 
        c.location.toLowerCase().includes(dest) || 
        c.title.toLowerCase().includes(dest)
      );
      setCombos(filtered);
    } else {
      setCombos(enrichedMockData);
    }
  };

  // Filter combos by Region tab
  const filteredCombos = selectedRegion === 'all'
    ? combos
    : combos.filter(item => item.region === selectedRegion);

  // Apply optional budget constraints from AI suggestions
  const budgetFilteredCombos = searchParams.budget > 0
    ? filteredCombos.filter(item => item.price <= searchParams.budget)
    : filteredCombos;

  // Sort combos based on Sort Bar selection
  const sortedCombos = [...budgetFilteredCombos].sort((a, b) => {
    if (sortOption === 'price_asc') {
      return a.price - b.price;
    } else if (sortOption === 'popularity') {
      return b.popularity - a.popularity;
    } else if (sortOption === 'discount') {
      return b.discount - a.discount;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-28 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 opacity-90 z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest inline-block font-black">
            ✨ Đặc quyền du lịch trọn gói
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
            Combo Vé Máy Bay + Khách Sạn
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium">
            Đặt trọn gói hành trình khứ hồi chất lượng cao cùng các resort nghỉ dưỡng 5 sao hàng đầu Việt Nam để nhận ưu đãi tiết kiệm tới 20%.
          </p>

          {/* Connected Search Bar Form */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto mt-10 bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-black">Điểm khởi hành</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaPlane className="-rotate-45" size={11} /></span>
                <input 
                  type="text" 
                  value={searchParams.origin}
                  onChange={e => setSearchParams({...searchParams, origin: e.target.value})}
                  placeholder="Hà Nội (HAN)" 
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-black">Điểm đến</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaPlane className="rotate-45" size={11} /></span>
                <input 
                  type="text" 
                  value={searchParams.destination}
                  onChange={e => setSearchParams({...searchParams, destination: e.target.value})}
                  placeholder="Điểm du lịch..." 
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-black">Ngày đi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaCalendarAlt size={11} /></span>
                <input 
                  type="date" 
                  value={searchParams.departureDate}
                  onChange={e => setSearchParams({...searchParams, departureDate: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-black">Số khách</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaUser size={11} /></span>
                  <input 
                    type="number" 
                    min="1" 
                    max="9"
                    value={searchParams.guests}
                    onChange={e => setSearchParams({...searchParams, guests: parseInt(e.target.value) || 1})}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 h-[42px]"
              >
                {isSearching ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <FaSearch size={10} />}
                Tìm chuyến
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Regional Filter Tabs */}
      <div className="flex justify-center -translate-y-6 relative z-20">
        <div className="bg-white p-1.5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-1.5">
          {regions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRegion(tab.id)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                selectedRegion === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="text-xs font-bold text-slate-500">
          Tìm thấy <span className="text-slate-800 font-black">{sortedCombos.length}</span> Combo nghỉ dưỡng sang trọng
          {searchParams.budget > 0 && ` (Ngân sách dưới ${searchParams.budget.toLocaleString()}₫)`}
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 flex items-center gap-1"><FaSlidersH size={10} /> Sắp xếp:</span>
          <button 
            type="button"
            onClick={() => setSortOption(sortOption === 'price_asc' ? '' : 'price_asc')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${sortOption === 'price_asc' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800 font-bold'}`}
          >
            Giá: Thấp - Cao
          </button>
          <button 
            type="button"
            onClick={() => setSortOption(sortOption === 'popularity' ? '' : 'popularity')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${sortOption === 'popularity' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800 font-bold'}`}
          >
            Phổ biến nhất
          </button>
          <button 
            type="button"
            onClick={() => setSortOption(sortOption === 'discount' ? '' : 'discount')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${sortOption === 'discount' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800 font-bold'}`}
          >
            Ưu đãi lớn nhất
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {sortedCombos.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('/combos/' + item.id)}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              {/* Card Image */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80' }}
                />
                
                {/* AI Recommendation Weather Badge */}
                {item.aiRecommendation && (
                  <div className={`absolute bottom-3 left-3 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-sm z-10 border ${
                    item.aiRecommendation.includes('☀️') 
                      ? 'bg-amber-600/95 border-amber-500/20' 
                      : item.aiRecommendation.includes('🌧️') 
                        ? 'bg-sky-600/95 border-sky-500/20' 
                        : 'bg-slate-600/95 border-slate-500/20'
                  }`}>
                    {item.aiRecommendation.includes('☀️') && '☀️ Nắng đẹp • Ngoài trời'}
                    {item.aiRecommendation.includes('🌧️') && '🌧️ Mưa rào • Nghỉ dưỡng'}
                    {item.aiRecommendation.includes('⛅') && '⛅ Nhiều mây • Dạo phố'}
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-blue-600 shadow-sm border border-slate-100 tracking-wider">
                   ✈️ Bay + 🏨 Hotel 5★
                </div>
                {item.discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                     -{item.discount}%
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-black">{item.location}</span>
                   <div className="flex items-center gap-0.5 text-amber-400">
                     <FaStar size={10} />
                     <FaStar size={10} />
                     <FaStar size={10} />
                     <FaStar size={10} />
                     <FaStar size={10} />
                   </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-tight line-clamp-1">
                  {item.title}
                </h3>
                
                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed line-clamp-2 h-8">
                  {item.description}
                </p>

                <div className="space-y-1.5 mb-4 text-xs font-semibold text-slate-500">
                  <p className="flex items-center gap-2 text-slate-600">
                    <FaHotel className="text-slate-300 shrink-0" size={12} /> 
                    <span className="truncate">{item.hotelName}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <FaCalendarAlt className="text-slate-300 shrink-0" size={12} /> 
                    <span>{item.duration}</span>
                  </p>

                  {/* WebSocket availability updates indicator */}
                  {item.availableSlots !== undefined && (
                    <div className="pt-1">
                      {item.availableSlots <= 3 ? (
                        <p className="text-[10px] text-red-500 font-black animate-pulse flex items-center gap-1">
                          🔥 Chỉ còn {item.availableSlots} combo giá này
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                          🟢 Còn lại {item.availableSlots} combo
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Dynamic Weather & Itinerary Suggestion */}
                {(() => {
                  const rec = item.aiRecommendation;
                  if (!rec) return null;
                  
                  let theme = {
                    bg: 'bg-slate-50/80',
                    border: 'border-slate-200/50',
                    text: 'text-slate-700',
                    badgeBg: 'bg-slate-200/60',
                    badgeText: 'text-slate-700',
                    title: 'Dự báo thời tiết'
                  };

                  if (rec.includes('☀️')) {
                    theme = {
                      bg: 'bg-amber-50/60',
                      border: 'border-amber-100',
                      text: 'text-amber-950',
                      badgeBg: 'bg-amber-100/60',
                      badgeText: 'text-amber-800',
                      title: 'Thời tiết: Nắng đẹp'
                    };
                  } else if (rec.includes('🌧️')) {
                    theme = {
                      bg: 'bg-sky-50/60',
                      border: 'border-sky-100',
                      text: 'text-sky-950',
                      badgeBg: 'bg-sky-100/60',
                      badgeText: 'text-sky-800',
                      title: 'Thời tiết: Có mưa'
                    };
                  } else if (rec.includes('⛅')) {
                    theme = {
                      bg: 'bg-indigo-50/40',
                      border: 'border-indigo-100/60',
                      text: 'text-indigo-950',
                      badgeBg: 'bg-indigo-100/50',
                      badgeText: 'text-indigo-800',
                      title: 'Thời tiết: Nhiều mây'
                    };
                  }

                  // Strip weather emoji prefix from the paragraph to look clean
                  const cleanRec = rec.replace(/^[☀️🌧️⛅]\s*/, '');

                  return (
                    <div className={`mt-3 p-3 ${theme.bg} rounded-2xl border ${theme.border} text-[11px] leading-relaxed font-medium transition-all duration-300 hover:shadow-sm`}>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${theme.badgeText}`}>{theme.title}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText}`}>AI Gợi ý</span>
                      </div>
                      <p className={`line-clamp-3 text-[10px] ${theme.text}`}>
                        {cleanRec}
                      </p>
                    </div>
                  );
                })()}

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-black">Giá từ</p>
                    <p className="text-sm font-black text-slate-900">{item.price.toLocaleString()}₫</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomizingCombo(item);
                      }}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                    >
                      Tùy chỉnh
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCombo(item);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 active:scale-95"
                    >
                      Đặt ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedCombo && (
        <BookingModal combo={selectedCombo} onClose={() => setSelectedCombo(null)} />
      )}

      {/* Customization Modal Component */}
      {customizingCombo && (
        <CustomizationModal 
          combo={customizingCombo} 
          onClose={() => setCustomizingCombo(null)} 
          onConfirm={(customizedCombo) => {
            setCustomizingCombo(null);
            setSelectedCombo(customizedCombo);
          }}
        />
      )}

      {/* Floating Action Button (FAB) and Chatbot */}
      <ComboAiAssistant onApplyFilters={handleApplyAiFilters} />

      {/* Footer Info */}
      <div className="pb-12 text-center">
        <p className="text-sm text-slate-400 font-medium">Phiên bản v2.0.0 (FlightBook AI Premium)</p>
      </div>
    </div>
  );
}

/* Subcomponent: CustomizationModal */
function CustomizationModal({ combo, onClose, onConfirm }) {
  const [passengers, setPassengers] = useState(1);
  const [flightOption, setFlightOption] = useState('vna'); // 'vna', 'bamboo', 'vietjet'
  const [roomOption, setRoomOption] = useState('std'); // 'std', 'deluxe', 'suite'

  const flightDiffs = {
    vna: 0,
    bamboo: -150000,
    vietjet: -350000
  };

  const roomDiffs = {
    std: 0,
    deluxe: 750000,
    suite: 2000000
  };

  const currentPrice = combo.price + flightDiffs[flightOption] + roomDiffs[roomOption];
  const totalPrice = currentPrice * passengers;

  const handleConfirm = () => {
    onConfirm({
      ...combo,
      price: currentPrice,
      selectedRoomTypeId: roomOption,
      selectedFlightId: combo.flightResponse?.id || combo.flight?.id || combo.selectedFlightId || 1,
      passengerCount: passengers
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-[160] text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
        >
          <FaTimes size={16} />
        </button>

        {/* Left Column: Combo Details */}
        <div className="w-full md:w-5/12 bg-[#1a2b49] text-white p-10 flex flex-col justify-between">
          <div className="space-y-8">
            <div>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-[9px] font-black uppercase tracking-wider inline-block font-black">
                Tùy chỉnh Combo
              </span>
              <h3 className="text-xl font-black mt-3 leading-tight tracking-tight text-white">{combo.title}</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium flex items-center gap-1.5">
                {combo.location} • Khách sạn {combo.hotelStars || 5}★
                <span className="flex text-[8px]">
                  {Array.from({ length: combo.hotelStars || 5 }).map((_, i) => "⭐")}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  <FaHotel size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-black">Lưu trú</p>
                  <p className="text-xs font-bold text-white truncate mt-0.5">{combo.hotelName}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-medium">
                    {roomOption === 'std' && 'Hạng phòng: Standard (Đã bao gồm)'}
                    {roomOption === 'deluxe' && 'Hạng phòng: Deluxe Ocean (+750k₫)'}
                    {roomOption === 'suite' && 'Hạng phòng: Suite VIP (+2.0M₫)'}
                  </p>
                  <p className="text-[9px] text-slate-300 mt-2 leading-relaxed italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                    🏨 {combo.roomQuality || "Phòng nghỉ dưỡng cao cấp view đẹp"}
                  </p>
                  {combo.hotelAmenities && (
                    <div className="mt-2.5 flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pt-2 border-t border-white/5">
                      {combo.hotelAmenities.map((amenity, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/5 text-[8px] text-slate-200 rounded-full font-medium transition-colors">
                          ✨ {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  <FaPlane size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-black">Vé máy bay khứ hồi</p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {flightOption === 'vna' && 'Vietnam Airlines (Mặc định)'}
                    {flightOption === 'bamboo' && 'Bamboo Airways (-150k₫)'}
                    {flightOption === 'vietjet' && 'Vietjet Air (-350k₫)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8 md:mt-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-black">Tổng chi phí ({passengers} khách)</p>
            <p className="text-3xl font-black text-blue-400 tracking-tight mt-1">{totalPrice.toLocaleString()}₫</p>
            <p className="text-[9px] text-slate-300 mt-2 italic font-medium">* Đã bao gồm thuế, phí và các tùy chỉnh dịch vụ</p>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="w-full md:w-7/12 p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cá Nhân Hóa Dịch Vụ</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Lựa chọn chuyến bay ưa thích và nâng cấp hạng phòng khách sạn</p>
            </div>

            {/* Stepper Passenger Count Selector */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Số lượng hành khách</p>
                <p className="text-[10px] text-slate-400 font-medium">Tối đa 9 khách mỗi lượt đặt</p>
              </div>
              <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => passengers > 1 && setPassengers(p => p - 1)}
                  disabled={passengers <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-30"
                >
                  <FaMinus size={10} />
                </button>
                <span className="text-sm font-black text-slate-800 w-4 text-center">{passengers}</span>
                <button
                  type="button"
                  onClick={() => passengers < 9 && setPassengers(p => p + 1)}
                  disabled={passengers >= 9}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-30"
                >
                  <FaPlus size={10} />
                </button>
              </div>
            </div>

            {/* Change Flight */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-black">Đổi chuyến bay khứ hồi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'vna', label: 'VNA khứ hồi', diff: '+0₫' },
                  { key: 'bamboo', label: 'Bamboo khứ hồi', diff: '-150.000₫' },
                  { key: 'vietjet', label: 'Vietjet khứ hồi', diff: '-350.000₫' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFlightOption(opt.key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      flightOption === opt.key 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-black' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    <p className="text-[9px] uppercase tracking-wider">{opt.label}</p>
                    <p className="text-[8px] mt-0.5 opacity-80">{opt.diff}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade Room */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-black">Nâng cấp hạng phòng</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'std', label: 'Standard Room', diff: '+0₫' },
                  { key: 'deluxe', label: 'Deluxe Ocean', diff: '+750.000₫' },
                  { key: 'suite', label: 'Suite VIP', diff: '+2.000.000₫' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRoomOption(opt.key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      roomOption === opt.key 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-black' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    <p className="text-[9px] uppercase tracking-wider">{opt.label}</p>
                    <p className="text-[8px] mt-0.5 opacity-80">{opt.diff}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Xác nhận & Đặt chỗ
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
