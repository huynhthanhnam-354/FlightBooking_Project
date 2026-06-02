import type { AppIconName } from '../theme/icons';

export type AIDestinationFilter = 'season' | 'scenic' | 'cheap';

export type AIDestination = {
  id: string;
  code: string;
  city: string;
  badge: string;
  basePriceVND: number;
  weather: string;
  season: string;
  description: string;
  categories: AIDestinationFilter[];
  iconName: AppIconName;
  accentColor: string;
};

export const AI_DESTINATION_FILTERS: {
  key: AIDestinationFilter;
  label: string;
  iconName: AppIconName;
}[] = [
  { key: 'season', label: 'Đang vào mùa', iconName: 'sun' },
  { key: 'scenic', label: 'Cảnh đẹp', iconName: 'mapPin' },
  { key: 'cheap', label: 'Giá tốt', iconName: 'bolt' },
];

export const AI_DESTINATIONS: AIDestination[] = [
  {
    id: 'dad',
    code: 'DAD',
    city: 'Đà Nẵng',
    badge: 'Biển và nghỉ dưỡng',
    basePriceVND: 1690000,
    weather: 'Nắng nhẹ',
    season: 'Hợp cho lịch biển, Bà Nà và Hội An',
    description: 'Bãi biển Mỹ Khê, ẩm thực hải sản và nhiều lịch trình ngắn ngày.',
    categories: ['season', 'scenic', 'cheap'],
    iconName: 'sun',
    accentColor: '#0EA5E9',
  },
  {
    id: 'cxr',
    code: 'CXR',
    city: 'Nha Trang',
    badge: 'Biển xanh',
    basePriceVND: 1850000,
    weather: 'Nắng ấm',
    season: 'Hợp cho đảo, lặn biển và nghỉ dưỡng',
    description: 'Vịnh biển đẹp, đảo Hòn Mun và nhiều resort sát biển.',
    categories: ['season', 'scenic'],
    iconName: 'sun',
    accentColor: '#06B6D4',
  },
  {
    id: 'pqc',
    code: 'PQC',
    city: 'Phú Quốc',
    badge: 'Biển đảo',
    basePriceVND: 2450000,
    weather: 'Nắng ấm',
    season: 'Hợp cho kỳ nghỉ dài và hoàng hôn biển',
    description: 'Bãi cát trắng, tour đảo và lịch trình nghỉ dưỡng thoải mái.',
    categories: ['season', 'scenic'],
    iconName: 'leaf',
    accentColor: '#10B981',
  },
  {
    id: 'vdo',
    code: 'VDO',
    city: 'Hạ Long',
    badge: 'Thiên nhiên',
    basePriceVND: 1520000,
    weather: 'Mát mẻ',
    season: 'Hợp cho vịnh, du thuyền và nghỉ cuối tuần',
    description: 'Vịnh Hạ Long, đảo Quan Lạn và các tuyến nghỉ dưỡng ven biển.',
    categories: ['scenic', 'cheap'],
    iconName: 'mapPin',
    accentColor: '#2563EB',
  },
  {
    id: 'dli',
    code: 'DLI',
    city: 'Đà Lạt',
    badge: 'Khí hậu mát',
    basePriceVND: 1380000,
    weather: 'Se lạnh',
    season: 'Hợp cho săn mây, cà phê và nghỉ dưỡng',
    description: 'Không khí mát, hồ Tuyền Lâm và nhiều điểm check-in gần trung tâm.',
    categories: ['scenic', 'cheap'],
    iconName: 'leaf',
    accentColor: '#16A34A',
  },
  {
    id: 'bkk',
    code: 'BKK',
    city: 'Bangkok',
    badge: 'Ẩm thực và mua sắm',
    basePriceVND: 2150000,
    weather: 'Nắng nóng',
    season: 'Hợp cho city break và cuối tuần ngắn',
    description: 'Chợ đêm, đền chùa, trung tâm thương mại và nhiều đường bay trong ngày.',
    categories: ['cheap', 'season'],
    iconName: 'bolt',
    accentColor: '#F59E0B',
  },
];
