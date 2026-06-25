import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaPlane, FaHotel, FaCalendarAlt, FaStar, FaSlidersH, FaSearch, FaUser, FaTimes, FaMinus, FaPlus,
  FaChevronLeft, FaChevronRight, FaCheckCircle
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

// Import local image assets
import destDanang from '../assets/dest-danang.jpg';
import destPhuquoc from '../assets/dest-phuquoc.jpg';
import dealNhatrang from '../assets/deal-nhatrang.jpg';
import comboSapa from '../assets/combo-sapa.jpg';
import destHalong from '../assets/dest-halong.jpg';
import dealHagiang from '../assets/deal-hagiang.jpg';
import comboHoian from '../assets/combo-hoian.jpg';
import comboQuynhon from '../assets/combo-quynhon.jpg';
import comboDalat from '../assets/combo-dalat.jpg';
import comboCondao from '../assets/combo-condao.jpg';
import comboVungtau from '../assets/combo-vungtau.jpg';
import comboMuine from '../assets/combo-muine.jpg';
import hotelRoom1 from '../assets/hotel-room-1.jpg';
import hotelRoom2 from '../assets/hotel-room-2.jpg';
import hotelRoom3 from '../assets/hotel-room-3.jpg';
import event1 from '../assets/event-1.jpg';
import event2 from '../assets/event-2.jpg';
import event3 from '../assets/event-3.jpg';
import resort1 from '../assets/resort-1.jpg';
import resort2 from '../assets/resort-2.jpg';
import resort3 from '../assets/resort-3.jpg';


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
    image: destDanang,
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
    image: destPhuquoc,
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
    image: dealNhatrang,
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
    image: comboSapa,
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
    image: destHalong,
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
    image: dealHagiang,
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
    image: comboHoian,
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
    image: comboQuynhon,
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
    image: comboDalat,
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
    image: comboCondao,
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
    image: comboVungtau,
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
    image: comboMuine,
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

  const locationNormalized = (item.location || "").toLowerCase().trim();

  // Mapping specific Unsplash images for all 12 locations to ensure correct images are displayed
  const locationImageMapping = {
    "đà nẵng": [
      destDanang,
      resort1,
      resort2
    ],
    "da nang": [
      destDanang,
      resort1,
      resort2
    ],
    "phú quốc": [
      destPhuquoc,
      resort2,
      resort3
    ],
    "phu quoc": [
      destPhuquoc,
      resort2,
      resort3
    ],
    "nha trang": [
      dealNhatrang,
      resort1,
      resort3
    ],
    "sa pa": [
      comboSapa,
      resort2,
      resort1
    ],
    "sapa": [
      comboSapa,
      resort2,
      resort1
    ],
    "hạ long": [
      destHalong,
      resort3,
      resort1
    ],
    "ha long": [
      destHalong,
      resort3,
      resort1
    ],
    "hà giang": [
      dealHagiang,
      resort2,
      resort3
    ],
    "ha giang": [
      dealHagiang,
      resort2,
      resort3
    ],
    "hội an": [
      comboHoian,
      resort1,
      resort2
    ],
    "hoi an": [
      comboHoian,
      resort1,
      resort2
    ],
    "quy nhơn": [
      comboQuynhon,
      resort3,
      resort2
    ],
    "quy nhon": [
      comboQuynhon,
      resort3,
      resort2
    ],
    "đà lạt": [
      comboDalat,
      resort1,
      resort3
    ],
    "da lat": [
      comboDalat,
      resort1,
      resort3
    ],
    "côn đảo": [
      comboCondao,
      resort2,
      resort1
    ],
    "con dao": [
      comboCondao,
      resort2,
      resort1
    ],
    "vũng tàu": [
      comboVungtau,
      resort3,
      resort1
    ],
    "vung tau": [
      comboVungtau,
      resort3,
      resort1
    ],
    "hồ tràm": [
      comboVungtau,
      resort3,
      resort1
    ],
    "ho tram": [
      comboVungtau,
      resort3,
      resort1
    ],
    "mũi né": [
      comboMuine,
      resort1,
      resort2
    ],
    "mui ne": [
      comboMuine,
      resort1,
      resort2
    ]
  };

  const matchedImages = locationImageMapping[locationNormalized] || [
    item.image,
    resort1,
    resort2
  ];

  const destinationImages = [
    item.image || matchedImages[0],
    matchedImages[1] || resort1,
    matchedImages[2] || resort2
  ];

  // Helper to generate event information matching the destination
  const getCustomEvents = (locName) => {
    const loc = (locName || "").toLowerCase().trim();
    if (loc.includes("đà nẵng")) {
      return [
        {
          title: "Lễ hội pháo hoa quốc tế Đà Nẵng (DIFF)",
          date: "Tháng 6 - Tháng 7 hàng năm",
          description: "Lễ hội trình diễn pháo hoa đỉnh cao quy tụ many đội thi quốc tế, thắp sáng bầu trời đêm sông Hàn rực rỡ sắc màu.",
          image: event1
        },
        {
          title: "Trình diễn phun Lửa & Nước tại Cầu Rồng",
          date: "21:00 tối thứ Bảy, Chủ nhật hàng tuần",
          description: "Chiêm ngưỡng biểu tượng Cầu Rồng độc đáo phun lửa và phun mưa đầy nghệ thuật thu hút hàng ngàn du khách.",
          image: event2
        }
      ];
    } else if (loc.includes("phú quốc")) {
      return [
        {
          title: "Lễ hội Hoàng hôn Phú Quốc",
          date: "Hàng ngày từ 16:30 - 18:30",
          description: "Tận hưởng khoảnh khắc hoàng hôn đỏ rực buông xuống biển Tây tại các bãi biển đẹp nhất hòn đảo, kết hợp nhạc sống acoustic.",
          image: event2
        },
        {
          title: "Trải nghiệm Chợ đêm Phú Quốc & Ẩm thực biển",
          date: "Hàng tối từ 18:00 - 23:00",
          description: "Khám phá thế giới ẩm thực phong phú với các món hải sản tươi sống đặc trưng của đảo Ngọc như nhum nướng, gỏi cá trích.",
          image: event3
        }
      ];
    } else if (loc.includes("nha trang")) {
      return [
        {
          title: "Festival Biển Nha Trang",
          date: "Tháng 6 hai năm một lần",
          description: "Lễ hội du lịch biển lớn nhất Khánh Hòa với chuỗi hoạt động triển lãm di sản văn hóa, biểu diễn nghệ thuật và thể thao bãi biển sôi động.",
          image: event1
        },
        {
          title: "Hành hương Tháp Bà Ponagar lịch sử",
          date: "Tháng 3 âm lịch hàng năm",
          description: "Lễ hội tôn vinh Thiên Y Thánh Mẫu Ana tại ngôi đền Chăm cổ kính độc đáo nghìn năm tuổi uy nghiêm hướng ra cửa biển Nha Trang.",
          image: event2
        }
      ];
    } else if (loc.includes("sapa") || loc.includes("sa pa")) {
      return [
        {
          title: "Lễ hội hoa ban và hoa hồng Fansipan",
          date: "Tháng 4 - Tháng 6 hàng năm",
          description: "Triển lãm thung lũng hoa hồng rộng lớn bậc nhất Tây Bắc kết hợp với các chương trình vũ điệu trên mây vô cùng ảo diệu.",
          image: event1
        },
        {
          title: "Chợ tình Sa Pa văn hoá độc đáo",
          date: "Tối thứ Bảy hàng tuần",
          description: "Điểm hẹn giao duyên văn nghệ truyền thống của nam thanh nữ tú người Mông, Dao đỏ trong tiếng khèn lá mộc mạc réo rắt.",
          image: event3
        }
      ];
    } else if (loc.includes("hạ long") || loc.includes("ha long")) {
      return [
        {
          title: "Carnival Hạ Long rực rỡ sắc màu",
          date: "Tháng 4 - 5 dịp lễ 30/4",
          description: "Lễ hội biểu diễn nghệ thuật quy mô lớn trên đường phố và bãi biển với vũ đoàn chuyên nghiệp trong nước và quốc tế.",
          image: event1
        },
        {
          title: "Khám phá Vịnh Di sản bằng Kayak tự do",
          date: "Hàng ngày",
          description: "Trải nghiệm luồn lách qua các hang luồn, ngắm nhìn cận cảnh các hòn đảo đá vôi kỳ vĩ và những rặng san hô tự nhiên tuyệt đẹp.",
          image: event2
        }
      ];
    } else if (loc.includes("hà giang") || loc.includes("ha giang")) {
      return [
        {
          title: "Lễ hội hoa tam giác mạch Hà Giang",
          date: "Tháng 10 - Tháng 11 hàng năm",
          description: "Tận hưởng không gian thung lũng đá tai mèo nở rộ sắc hoa tam giác mạch hồng phấn dịu dàng, tổ chức các cuộc thi cồng chiêng, khèn Mông.",
          image: event1
        },
        {
          title: "Phiên chợ lùi Đồng Văn cổ kính",
          date: "Cuối tuần so le các ngày",
          description: "Nơi giao lưu văn hóa, trao đổi nông thổ sản của đồng bào các dân tộc thiểu số và thưởng thức bát thắng cố nóng hổi.",
          image: event3
        }
      ];
    } else if (loc.includes("hội an") || loc.includes("hoi an")) {
      return [
        {
          title: "Đêm rằm phố cổ Hội An huyền ảo",
          date: "Ngày 14 âm lịch hàng tháng",
          description: "Tất cả các ngôi nhà cổ tắt điện, treo đèn lồng lung linh và thả đèn hoa đăng lãng mạn bên dòng sông Hoài thơ mộng.",
          image: event2
        },
        {
          title: "Show diễn thực cảnh Ký ức Hội An hoành tráng",
          date: "Tối hàng ngày từ 20:00 - 21:00",
          description: "Show thực cảnh đẹp nhất thế giới tái hiện câu chuyện lịch sử thương cảng Faifo sầm uất với hơn 500 diễn viên trên sân khấu nước hiện đại.",
          image: event1
        }
      ];
    } else if (loc.includes("quy nhơn") || loc.includes("quy nhon")) {
      return [
        {
          title: "Giải đua thuyền buồm quốc tế Quy Nhơn",
          date: "Tháng 8 hàng năm",
          description: "Cuộc thi thuyền buồm thể thao đẳng cấp diễn ra tại bãi biển Quy Nhơn đón luồng gió mát rượi đặc trưng cực kỳ sôi động.",
          image: event1
        },
        {
          title: "Ngắm bình minh độc bản tại Eo Gió",
          date: "Hàng ngày lúc 5:00 - 6:30",
          description: "Đón những tia nắng đầu tiên của ngày mới tại địa điểm ngắm bình minh đẹp nhất Việt Nam với vách núi ôm trọn biển xanh kỳ vĩ.",
          image: event2
        }
      ];
    } else if (loc.includes("đà lạt") || loc.includes("da lat")) {
      return [
        {
          title: "Festival Hoa Đà Lạt rực rỡ sắc màu",
          date: "Tháng 12 hai năm một lần",
          description: "Lễ hội trưng bày nghệ thuật sắp đặt hoa tươi quy mô lớn xung quanh hồ Xuân Hương và các công viên trung tâm thành phố ngàn hoa.",
          image: event1
        },
        {
          title: "Nhạc hội mây lang thang giữa sương mù",
          date: "Thứ Sáu, Thứ Bảy hàng tuần",
          description: "Các buổi hòa nhạc live acoustic trên đỉnh đồi lộng gió, đón chiều hoàng hôn lãng mạn hòa trong làn sương mây mờ ảo.",
          image: event2
        }
      ];
    } else if (loc.includes("côn đảo") || loc.includes("con dao")) {
      return [
        {
          title: "Lễ hội Thả Rùa về biển tự nhiên",
          date: "Tháng 7 - Tháng 9 hàng năm",
          description: "Tham gia cùng các nhân viên kiểm lâm bảo tồn thiên nhiên biển đảo, thả các chú rùa con mới nở chập chững bò ra biển khơi xanh ngắt.",
          image: event2
        },
        {
          title: "Viếng nghĩa trang Hàng Dương linh thiêng",
          date: "23:00 hàng đêm",
          description: "Hoạt động tâm linh trang nghiêm, thắp hương viếng mộ nữ anh hùng Võ Thị Sáu và các chiến sĩ cách mạng dưới bóng những cây dương cổ thụ.",
          image: event2
        }
      ];
    } else if (loc.includes("vũng tàu") || loc.includes("vung tau") || loc.includes("hồ tràm") || loc.includes("ho tram")) {
      return [
        {
          title: "Lễ hội diều nghệ thuật Vũng Tàu",
          date: "Dịp lễ 30/4 hàng năm",
          description: "Trình diễn diều khổng lồ quy tụ các nghệ nhân trong nước và quốc tế tạo nên bức tranh bầu trời biển sặc sỡ, sống động.",
          image: event2
        },
        {
          title: "Thưởng thức ẩm thực ốc đêm hải sản",
          date: "Hàng tối",
          description: "Trải nghiệm thế giới ốc đêm vô cùng phong phú tại các khu chợ ẩm thực Vũng Tàu với các hương vị ốc len xào dừa, hàu nướng mỡ hành.",
          image: event3
        }
      ];
    } else if (loc.includes("mũi né") || loc.includes("mui ne")) {
      return [
        {
          title: "Lễ hội trượt cát đồi cát bay Mũi Né",
          date: "Hàng ngày lúc 15:30 - 18:00",
          description: "Trải nghiệm chinh phục đồi cát bay trứ danh bằng máng trượt nhựa và ghi lại các khoảnh khắc chụp ảnh nghệ thuật tuyệt đẹp.",
          image: event2
        },
        {
          title: "Giải lướt ván diều quốc tế Mũi Né",
          date: "Tháng 2 hàng năm",
          description: "Giải đấu mạo hiểm lướt ván diều thế giới quy tụ các vận động viên tài ba nhờ bãi biển Mũi Né nổi tiếng lộng gió lý tưởng.",
          image: event2
        }
      ];
    }
    
    // Default fallback
    return [
      {
        title: `Lễ hội Văn hóa & Ẩm thực tại ${locName}`,
        date: "Tháng 6 - Tháng 8 hàng năm",
        description: `Sự kiện lễ hội đặc sắc giới thiệu tinh hoa ẩm thực, âm nhạc đường phố và các hoạt động trình diễn văn nghệ truyền thống tại ${locName}.`,
        image: event1
      },
      {
        title: `Khám phá thắng cảnh nổi tiếng ${locName}`,
        date: "Hàng ngày",
        description: `Hành trình dạo quanh các địa danh check-in nổi bật tại ${locName}, tìm hiểu lịch sử địa phương cùng hướng dẫn viên bản địa.`,
        image: event2
      }
    ];
  };

  const events = getCustomEvents(item.location);

  const roomTypes = [
    {
      key: 'std',
      name: 'Standard Room',
      size: '42m²',
      bed: '1 Giường King hoặc 2 Giường đơn',
      maxGuests: '2 Người lớn & 1 Trẻ em',
      priceDiff: 0,
      description: 'Không gian ấm cúng, thiết kế trang nhã với ban công hướng ra khu vườn nhiệt đới xanh ngát.',
      image: hotelRoom1
    },
    {
      key: 'deluxe',
      name: 'Deluxe Ocean View',
      size: '56m²',
      bed: '1 Giường King lớn',
      maxGuests: '2 Người lớn & 2 Trẻ em',
      priceDiff: 750000,
      description: 'Tầm nhìn ngoạn mục hướng ra đại dương lộng gió, trang bị bồn tắm nằm cao cấp thư giãn.',
      image: hotelRoom2
    },
    {
      key: 'suite',
      name: 'Executive Suite VIP',
      size: '88m²',
      bed: '1 Giường King lớn + 1 Giường phụ',
      maxGuests: '3 Người lớn & 2 Trẻ em',
      priceDiff: 2000000,
      description: 'Căn hộ tổng thống thu nhỏ với phòng khách riêng biệt, quầy bar mini và lối đi riêng ra bãi tắm.',
      image: hotelRoom3
    }
  ];

  return {
    ...item,
    ...profile,
    destinationImages,
    events,
    roomTypes
  };
};

const enrichedMockData = mockData.map(item => {
  const enrichedItem = enrichMockWithHotelProfile(item);
  return {
    ...enrichedItem,
    aiRecommendation: generateMockAiRecommendation(item.location)
  };
});

const enrichComboItems = (items) => {
  return (items || []).map(item => {
    const enrichedItem = enrichMockWithHotelProfile(item);
    return {
      ...enrichedItem,
      aiRecommendation: item.aiRecommendation || generateMockAiRecommendation(item.location)
    };
  });
};

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
  const [selectedComboDetail, setSelectedComboDetail] = useState(null);
  const [sortOption, setSortOption] = useState('');

  // Search Bar & Filter States
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    guests: 1,
    budget: 0
  });
  const todayStr = new Date().toLocaleDateString('sv');
  
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
        setCombos(enrichComboItems(res.data || []));
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
      setCombos(enrichComboItems(res.data || []));
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
                  min={todayStr}
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
              onClick={() => setSelectedComboDetail(item)}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              {/* Card Image */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = resort1 }}
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

      {/* Combo Detail Modal Component */}
      {selectedComboDetail && (
        <ComboDetailModal 
          combo={selectedComboDetail} 
          onClose={() => setSelectedComboDetail(null)} 
          onBook={(item) => {
            setCustomizingCombo(item);
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

function ComboDetailModal({ combo, onClose, onBook }) {
  const [activeTab, setActiveTab] = useState('info');
  const [imgIndex, setImgIndex] = useState(0);

  const images = combo.destinationImages || [combo.image];

  const handleNextImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-[160] text-slate-700 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors active:scale-95"
        >
          <FaTimes size={16} />
        </button>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Gallery Header */}
          <div className="relative h-64 md:h-80 bg-slate-100 group">
            <img 
              src={images[imgIndex]} 
              alt={combo.title} 
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            
            {/* Gallery Controls */}
            {images.length > 1 && (
              <>
                <button 
                  type="button"
                  onClick={handlePrevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 text-slate-800 p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button 
                  type="button"
                  onClick={handleNextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 text-slate-800 p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <FaChevronRight size={16} />
                </button>
              </>
            )}

            {/* Bottom Header Text */}
            <div className="absolute bottom-6 left-8 right-8 text-white">
              <span className="px-3 py-1 bg-blue-500 border border-blue-400/30 text-white rounded-full text-[9px] font-black uppercase tracking-wider inline-block">
                {combo.location}
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-2 leading-tight tracking-tight">{combo.title}</h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300">
                <span>🏨 {combo.hotelName}</span>
                <span>•</span>
                <span>⏱️ {combo.duration}</span>
                <span>•</span>
                <span className="flex text-amber-400">
                  {Array.from({ length: combo.hotelStars || 5 }).map((_, i) => "★")}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
            <button 
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Điểm đến & Sự kiện
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('hotel')}
              className={`py-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'hotel' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Khách sạn & Phòng nghỉ
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Giới thiệu hành trình</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{combo.description}</p>
                </div>

                {combo.aiRecommendation && (
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">Trợ lý AI gợi ý</span>
                    </div>
                    <p className="text-xs text-sky-950 font-medium leading-relaxed">{combo.aiRecommendation}</p>
                  </div>
                )}

                {/* Events & Activities */}
                {combo.events && combo.events.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-800">Sự kiện & Hoạt động nổi bật</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {combo.events.map((evt, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <img src={evt.image} alt={evt.title} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{evt.title}</h5>
                            <p className="text-[10px] text-blue-600 font-bold mt-0.5">{evt.date}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{evt.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hotel' && (
              <div className="space-y-6">
                {/* Hotel General Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800">Trải nghiệm nghỉ dưỡng đẳng cấp</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{combo.roomQuality}</p>
                    
                    {/* Amenities list */}
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-slate-800 mb-2">Dịch vụ & Tiện ích khách sạn:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {combo.hotelAmenities && combo.hotelAmenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <FaCheckCircle className="text-emerald-500 shrink-0" size={12} />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Layouts */}
                {combo.roomTypes && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">Cấu trúc các hạng phòng</h4>
                    <div className="space-y-3">
                      {combo.roomTypes.map((room) => (
                        <div key={room.key} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                          <img src={room.image} alt={room.name} className="w-full sm:w-28 h-20 object-cover rounded-xl shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-xs font-bold text-slate-900">{room.name}</h5>
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black">
                                {room.priceDiff === 0 ? 'Mặc định' : `+${room.priceDiff.toLocaleString()}₫`}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Diện tích: {room.size} • Giường: {room.bed} • Sức chứa: {room.maxGuests}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{room.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-black">Giá chỉ từ</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{combo.price.toLocaleString()}₫</p>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Đóng
            </button>
            <button 
              type="button"
              onClick={() => {
                onBook(combo);
                onClose();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Tùy chỉnh & Đặt ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
