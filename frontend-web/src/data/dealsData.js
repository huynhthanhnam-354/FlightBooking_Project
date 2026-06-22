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
    id: 'deal-hg-01',
    category: 'flight',
    title: 'HÀ GIANG HÙNG VĨ',
    subTitle: 'Khám phá vẻ đẹp hoang sơ của cao nguyên đá và mùa hoa tam giác mạch.',
    discountPercentage: 35,
    image: 'https://images.unsplash.com/photo-1502101872923-d48509bff386?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#8D6E63', 
    ctaLink: '/booking?to=HaGiang',
    status: 'hot',
    meta: {
      tags: ['SEASONAL', 'CULTURE'],
      validUntil: '2026-06-30'
    }
  },
  {
    id: 'deal-pq-02',
    category: 'combo',
    title: 'ĐẢO NGỌC PHÚ QUỐC',
    subTitle: 'Trải nghiệm kỳ nghỉ thiên đường trọn gói: Chuyến bay & Resort ven biển.',
    discountPercentage: 50,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#00ACC1', 
    ctaLink: '/combos/phuquoc',
    status: 'exclusive',
    meta: {
      tags: ['FULL PACKAGE', 'BEACH'],
      validUntil: '2026-07-15'
    }
  },
  {
    id: 'deal-nt-03',
    category: 'hotel',
    title: 'NHA TRANG BIỂN HẸN',
    subTitle: 'Tận hưởng bãi biển xanh ngắt với dải cát trắng mịn màng tại vịnh biển đẹp nhất Việt Nam.',
    discountPercentage: 25,
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#00A693', 
    ctaLink: '/hotels?city=NhaTrang',
    status: 'popular',
    meta: {
      tags: ['BEACH', 'RELAX'],
      validUntil: '2026-08-01'
    }
  },
  {
    id: 'deal-sd-04',
    category: 'flight',
    title: 'SƠN ĐOÒNG BÍ ẨN',
    subTitle: 'Khám phá hang động Sơn Đoòng - hang động tự nhiên lớn nhất thế giới ngay tại Việt Nam.',
    discountPercentage: 40,
    image: 'https://images.unsplash.com/photo-1541014741259-df529411b96a?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#F2994A', 
    ctaLink: '/booking?to=DongHoi',
    status: 'limited',
    meta: {
      tags: ['DOMESTIC', 'ADVENTURE'],
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
