import { Language } from './translations';

export type Currency = {
  code: string;
  symbol: string;
  flag: string;
  /** 1 đơn vị tiền này = bao nhiêu VND (tỉ giá tham khảo tháng 4/2026) */
  vndPerUnit: number;
  names: Record<Language, string>;
};

export const CURRENCIES: Currency[] = [
  {
    code: 'VND', symbol: '₫', flag: '🇻🇳', vndPerUnit: 1,
    names: {
      vi: 'Việt Nam Đồng (₫)',
      en: 'Vietnamese Dong (₫)',
      ko: '베트남 동 (₫)',
      ja: 'ベトナムドン (₫)',
      zh: '越南盾 (₫)',
      th: 'ดองเวียดนาม (₫)',
      es: 'Dong vietnamita (₫)',
    },
  },
  {
    code: 'USD', symbol: '$', flag: '🇺🇸', vndPerUnit: 25400,
    names: {
      vi: 'Đô la Mỹ ($)',
      en: 'US Dollar ($)',
      ko: '미국 달러 ($)',
      ja: '米ドル ($)',
      zh: '美元 ($)',
      th: 'ดอลลาร์สหรัฐ ($)',
      es: 'Dólar estadounidense ($)',
    },
  },
  {
    code: 'KRW', symbol: '₩', flag: '🇰🇷', vndPerUnit: 18.3,
    names: {
      vi: 'Won Hàn Quốc (₩)',
      en: 'Korean Won (₩)',
      ko: '대한민국 원 (₩)',
      ja: '韓国ウォン (₩)',
      zh: '韩元 (₩)',
      th: 'วอนเกาหลีใต้ (₩)',
      es: 'Won surcoreano (₩)',
    },
  },
  {
    code: 'JPY', symbol: '¥', flag: '🇯🇵', vndPerUnit: 169,
    names: {
      vi: 'Yên Nhật (¥)',
      en: 'Japanese Yen (¥)',
      ko: '일본 엔화 (¥)',
      ja: '日本円 (¥)',
      zh: '日元 (¥)',
      th: 'เยนญี่ปุ่น (¥)',
      es: 'Yen japonés (¥)',
    },
  },
  {
    code: 'CNY', symbol: '¥', flag: '🇨🇳', vndPerUnit: 3490,
    names: {
      vi: 'Nhân dân tệ (¥)',
      en: 'Chinese Yuan (¥)',
      ko: '중국 위안화 (¥)',
      ja: '人民元 (¥)',
      zh: '人民币 (¥)',
      th: 'หยวนจีน (¥)',
      es: 'Yuan chino (¥)',
    },
  },
  {
    code: 'THB', symbol: '฿', flag: '🇹🇭', vndPerUnit: 755,
    names: {
      vi: 'Baht Thái (฿)',
      en: 'Thai Baht (฿)',
      ko: '태국 바트 (฿)',
      ja: 'タイバーツ (฿)',
      zh: '泰铢 (฿)',
      th: 'บาทไทย (฿)',
      es: 'Baht tailandés (฿)',
    },
  },
  {
    code: 'EUR', symbol: '€', flag: '🇪🇺', vndPerUnit: 27700,
    names: {
      vi: 'Euro (€)',
      en: 'Euro (€)',
      ko: '유로 (€)',
      ja: 'ユーロ (€)',
      zh: '欧元 (€)',
      th: 'ยูโร (€)',
      es: 'Euro (€)',
    },
  },
  {
    code: 'GBP', symbol: '£', flag: '🇬🇧', vndPerUnit: 32200,
    names: {
      vi: 'Bảng Anh (£)',
      en: 'British Pound (£)',
      ko: '영국 파운드 (£)',
      ja: '英ポンド (£)',
      zh: '英镑 (£)',
      th: 'ปอนด์อังกฤษ (£)',
      es: 'Libra esterlina (£)',
    },
  },
  {
    code: 'SGD', symbol: 'S$', flag: '🇸🇬', vndPerUnit: 18900,
    names: {
      vi: 'Đô la Singapore (S$)',
      en: 'Singapore Dollar (S$)',
      ko: '싱가포르 달러 (S$)',
      ja: 'シンガポールドル (S$)',
      zh: '新加坡元 (S$)',
      th: 'ดอลลาร์สิงคโปร์ (S$)',
      es: 'Dólar de Singapur (S$)',
    },
  },
  {
    code: 'AUD', symbol: 'A$', flag: '🇦🇺', vndPerUnit: 16200,
    names: {
      vi: 'Đô la Úc (A$)',
      en: 'Australian Dollar (A$)',
      ko: '호주 달러 (A$)',
      ja: 'オーストラリアドル (A$)',
      zh: '澳大利亚元 (A$)',
      th: 'ดอลลาร์ออสเตรเลีย (A$)',
      es: 'Dólar australiano (A$)',
    },
  },
  {
    code: 'MXN', symbol: 'MX$', flag: '🇲🇽', vndPerUnit: 1310,
    names: {
      vi: 'Peso Mexico (MX$)',
      en: 'Mexican Peso (MX$)',
      ko: '멕시코 페소 (MX$)',
      ja: 'メキシコペソ (MX$)',
      zh: '墨西哥比索 (MX$)',
      th: 'เปโซเม็กซิโก (MX$)',
      es: 'Peso mexicano (MX$)',
    },
  },
  {
    code: 'HKD', symbol: 'HK$', flag: '🇭🇰', vndPerUnit: 3260,
    names: {
      vi: 'Đô la Hồng Kông (HK$)',
      en: 'Hong Kong Dollar (HK$)',
      ko: '홍콩 달러 (HK$)',
      ja: '香港ドル (HK$)',
      zh: '港元 (HK$)',
      th: 'ดอลลาร์ฮ่องกง (HK$)',
      es: 'Dólar de Hong Kong (HK$)',
    },
  },
];

// Gợi ý tiền tệ mặc định theo ngôn ngữ
export const DEFAULT_CURRENCY_BY_LANG: Record<Language, string> = {
  vi: 'VND',
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
  zh: 'CNY',
  th: 'THB',
  es: 'EUR',
};
