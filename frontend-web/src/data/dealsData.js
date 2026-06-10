/**
 * Promotional Deals Data for FlightBook AI
 * 
 * This module exports a scalable array of promotional offers designed for
 * high-impact UI components. Each deal object follows a strict schema to
 * ensure consistency across the application.
 * 
 * @author Senior Frontend Engineer
 */

export const DEALS_DATA = [
  {
    id: 'deal-jp-01',
    category: 'flight',
    title: 'Hương Sắc Nhật Bản',
    subTitle: 'Khám phá vẻ đẹp cổ kính của Kyoto và nhịp sống Tokyo sôi động.',
    discountPercentage: 35,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#FFB7C5', // Sakura Pink - Emotional connection to Spring
    ctaLink: '/booking?to=Tokyo',
    status: 'hot',
    meta: {
      tags: ['Seasonal', 'Culture', 'Direct Flight'],
      validUntil: '2026-06-30'
    }
  },
  {
    id: 'deal-kr-02',
    category: 'combo',
    title: 'Seoul Heartbeat',
    subTitle: 'Trải nghiệm K-Culture trọn gói: Chuyến bay & Khách sạn trung tâm.',
    discountPercentage: 50,
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#4A90E2', // Deep Sky Blue - Modern and energetic
    ctaLink: '/combos/seoul',
    status: 'exclusive',
    meta: {
      tags: ['Full Package', 'K-Food', 'Trending'],
      validUntil: '2026-07-15'
    }
  },
  {
    id: 'deal-my-03',
    category: 'hotel',
    title: 'Biển Xanh Langkawi',
    subTitle: 'Nghỉ dưỡng nhiệt đới tại Malaysia với các resort đẳng cấp quốc tế.',
    discountPercentage: 25,
    image: 'https://images.unsplash.com/photo-1552423314-cfdd9f6626bc?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#00A693', // Persian Green - Calm and tropical
    ctaLink: '/hotels?city=Langkawi',
    status: 'popular',
    meta: {
      tags: ['Beach', 'Relax', 'Best Price'],
      validUntil: '2026-08-01'
    }
  },
  {
    id: 'deal-vn-04',
    category: 'flight',
    title: 'Đà Nẵng Gọi Tên',
    subTitle: 'Bay thẳng đến thành phố của những cây cầu với ưu đãi sốc.',
    discountPercentage: 40,
    image: 'https://images.unsplash.com/photo-1559592442-7e182c8c6f5d?auto=format&fit=crop&w=1200&q=80',
    primaryColor: '#F2994A', // Brand Secondary Orange - Warm and inviting
    ctaLink: '/booking?to=Danang',
    status: 'limited',
    meta: {
      tags: ['Domestic', 'Weekend', 'Quick Trip'],
      validUntil: '2026-06-25'
    }
  }
];

/**
 * Utility to get color with opacity for UI overlays
 */
export const getThemeRGBA = (hex, opacity = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default DEALS_DATA;
