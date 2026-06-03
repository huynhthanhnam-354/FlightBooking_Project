import type { Language } from '../i18n/translations';

type Names = Record<Language, string>;

export type AirportDef = { code: string; name: Names; aliases?: string[] };

function n(vi: string, en: string): Names {
  return { vi, en, ko: en, ja: en, zh: en, th: en, es: en };
}

export const AIRPORT_LIST: AirportDef[] = [
  {
    code: 'HAN',
    name: {
      vi: 'Hà Nội',
      en: 'Hanoi',
      ko: '하노이',
      ja: 'ハノイ',
      zh: '河内',
      th: 'ฮานอย',
      es: 'Hanói',
    },
  },
  {
    code: 'SGN',
    name: {
      vi: 'TP. Hồ Chí Minh',
      en: 'Ho Chi Minh City',
      ko: '호치민',
      ja: 'ホーチミン',
      zh: '胡志明市',
      th: 'โฮจิมินห์',
      es: 'Ciudad Ho Chi Minh',
    },
  },
  {
    code: 'DAD',
    name: {
      vi: 'Đà Nẵng',
      en: 'Da Nang',
      ko: '다낭',
      ja: 'ダナン',
      zh: '岘港',
      th: 'ดานัง',
      es: 'Da Nang',
    },
  },
  { code: 'HPH', name: n('Hải Phòng', 'Hai Phong (Cat Bi)') },
  { code: 'CXR', name: n('Nha Trang (Cam Ranh)', 'Nha Trang (Cam Ranh)') },
  { code: 'PQC', name: n('Phú Quốc', 'Phu Quoc') },
  { code: 'VCA', name: n('Cần Thơ', 'Can Tho') },
  { code: 'VII', name: n('Vinh', 'Vinh') },
  { code: 'THD', name: n('Thanh Hóa (Thọ Xuân)', 'Thanh Hoa (Tho Xuan)') },
  { code: 'DIN', name: n('Điện Biên', 'Dien Bien Phu') },
  { code: 'VCL', name: n('Chu Lai', 'Chu Lai') },
  { code: 'UIH', name: n('Quy Nhơn (Phù Cát)', 'Quy Nhon (Phu Cat)') },
  { code: 'BMV', name: n('Buôn Ma Thuột', 'Buon Ma Thuot') },
  { code: 'PXU', name: n('Pleiku', 'Pleiku') },
  { code: 'TBB', name: n('Tuy Hòa', 'Tuy Hoa') },
  { code: 'VDH', name: n('Đồng Hới', 'Dong Hoi') },
  { code: 'VDO', name: n('Vân Đồn', 'Van Don') },
  { code: 'SQH', name: n('Sơn La', 'Son La') },
  { code: 'CAH', name: n('Cà Mau', 'Ca Mau') },
  { code: 'VCS', name: n('Côn Đảo', 'Con Dao') },
  { code: 'DLI', name: n('Đà Lạt (Liên Khương)', 'Da Lat (Lien Khuong)') },
  { code: 'VKG', name: n('Rạch Giá', 'Rach Gia') },

  { code: 'SIN', name: n('Singapore', 'Singapore') },
  { code: 'BKK', name: n('Bangkok (Suvarnabhumi)', 'Bangkok (Suvarnabhumi)') },
  { code: 'DMK', name: n('Bangkok (Don Mueang)', 'Bangkok (Don Mueang)') },
  { code: 'USM', name: n('Koh Samui', 'Koh Samui') },
  { code: 'HKT', name: n('Phuket', 'Phuket') },
  { code: 'CNX', name: n('Chiang Mai', 'Chiang Mai') },
  { code: 'KUL', name: n('Kuala Lumpur', 'Kuala Lumpur') },
  { code: 'PEN', name: n('Penang', 'Penang') },
  { code: 'LGK', name: n('Langkawi', 'Langkawi') },
  { code: 'MNL', name: n('Manila', 'Manila') },
  { code: 'CEB', name: n('Cebu', 'Cebu') },
  { code: 'CGK', name: n('Jakarta', 'Jakarta') },
  { code: 'DPS', name: n('Bali (Denpasar)', 'Bali (Denpasar)') },
  { code: 'SUB', name: n('Surabaya', 'Surabaya') },
  { code: 'REP', name: n('Siem Reap', 'Siem Reap') },
  { code: 'PNH', name: n('Phnom Penh', 'Phnom Penh') },
  { code: 'VTE', name: n('Viêng Chăn', 'Vientiane') },
  { code: 'RGN', name: n('Yangon', 'Yangon') },
  { code: 'ICN', name: n('Seoul (Incheon)', 'Seoul (Incheon)') },
  { code: 'PUS', name: n('Busan', 'Busan') },
  { code: 'NRT', name: n('Tokyo (Narita)', 'Tokyo (Narita)') },
  { code: 'HND', name: n('Tokyo (Haneda)', 'Tokyo (Haneda)') },
  { code: 'KIX', name: n('Osaka (Kansai)', 'Osaka (Kansai)') },
  { code: 'FUK', name: n('Fukuoka', 'Fukuoka') },
  { code: 'TPE', name: n('Đài Bắc (Taoyuan)', 'Taipei (Taoyuan)') },
  { code: 'KHH', name: n('Cao Hùng', 'Kaohsiung') },
  { code: 'HKG', name: n('Hồng Kông', 'Hong Kong') },
  { code: 'MFM', name: n('Ma Cao', 'Macau') },
  { code: 'PVG', name: n('Thượng Hải (Pudong)', 'Shanghai (Pudong)') },
  { code: 'SHA', name: n('Thượng Hải (Hongqiao)', 'Shanghai (Hongqiao)') },
  { code: 'PEK', name: n('Bắc Kinh (Capital)', 'Beijing (Capital)') },
  { code: 'PKX', name: n('Bắc Kinh (Daxing)', 'Beijing (Daxing)') },
  { code: 'CAN', name: n('Quảng Châu', 'Guangzhou') },
  { code: 'SZX', name: n('Thâm Quyến', 'Shenzhen') },
  { code: 'CTU', name: n('Thành Đô', 'Chengdu') },
  { code: 'XIY', name: n('Tây An', "Xi'an") },
  { code: 'KMG', name: n('Côn Minh', 'Kunming') },
  { code: 'DEL', name: n('New Delhi', 'New Delhi') },
  { code: 'BOM', name: n('Mumbai', 'Mumbai') },
  { code: 'BLR', name: n('Bengaluru', 'Bengaluru') },
  { code: 'SYD', name: n('Sydney', 'Sydney') },
  { code: 'MEL', name: n('Melbourne', 'Melbourne') },
  { code: 'BNE', name: n('Brisbane', 'Brisbane') },
  { code: 'PER', name: n('Perth', 'Perth') },
  { code: 'AKL', name: n('Auckland', 'Auckland') },
  { code: 'DXB', name: n('Dubai', 'Dubai') },
  { code: 'AUH', name: n('Abu Dhabi', 'Abu Dhabi') },
  { code: 'DOH', name: n('Doha', 'Doha') },
  { code: 'RUH', name: n('Riyadh', 'Riyadh') },
  { code: 'LHR', name: n('Luân Đôn (Heathrow)', 'London (Heathrow)') },
  { code: 'CDG', name: n('Paris (Charles de Gaulle)', 'Paris (Charles de Gaulle)') },
  { code: 'AMS', name: n('Amsterdam', 'Amsterdam') },
  { code: 'FRA', name: n('Frankfurt', 'Frankfurt') },
  { code: 'MUC', name: n('Munich', 'Munich') },
  { code: 'MAD', name: n('Madrid', 'Madrid') },
  { code: 'BCN', name: n('Barcelona', 'Barcelona') },
  { code: 'FCO', name: n('Rome (Fiumicino)', 'Rome (Fiumicino)') },
  { code: 'IST', name: n('Istanbul', 'Istanbul') },
  { code: 'ZRH', name: n('Zurich', 'Zurich') },
  { code: 'LAX', name: n('Los Angeles', 'Los Angeles') },
  { code: 'SFO', name: n('San Francisco', 'San Francisco') },
  { code: 'JFK', name: n('New York (JFK)', 'New York (JFK)') },
  { code: 'EWR', name: n('New York (Newark)', 'New York (Newark)') },
  { code: 'ORD', name: n('Chicago (O\'Hare)', "Chicago (O'Hare)") },
  { code: 'SEA', name: n('Seattle', 'Seattle') },
  { code: 'YVR', name: n('Vancouver', 'Vancouver') },
  { code: 'YYZ', name: n('Toronto', 'Toronto') },
];

const EXTRA_ALIASES: Record<string, string[]> = {
  HAN: ['ha noi', 'hà nội', 'hanoi', 'noi bai', 'nội bài'],
  SGN: ['sai gon', 'sài gòn', 'saigon', 'ho chi minh', 'hcmc', 'tp hcm', 'tphcm', 'tan son nhat', 'tân sơn nhất'],
  DAD: ['da nang', 'đà nẵng', 'danang'],
  HPH: ['hai phong', 'hải phòng', 'cat bi', 'cát bi'],
  CXR: ['nha trang', 'cam ranh'],
  PQC: ['phu quoc', 'phú quốc'],
  VCA: ['can tho', 'cần thơ'],
  THD: ['thanh hoa', 'thanh hóa', 'tho xuan', 'thọ xuân'],
  DIN: ['dien bien', 'điện biên', 'dien bien phu', 'điện biên phủ'],
  UIH: ['quy nhon', 'quy nhơn', 'phu cat', 'phù cát'],
  BMV: ['buon ma thuot', 'buôn ma thuột'],
  DLI: ['da lat', 'đà lạt', 'lien khuong', 'liên khương'],
  VTE: ['vieng chan', 'viêng chăn', 'vientiane'],
  TPE: ['dai bac', 'đài bắc', 'taipei', 'taibei', '台北', '臺北'],
  KHH: ['cao hung', 'cao hùng', 'kaohsiung', '高雄'],
  HKG: ['hong kong', 'hồng kông', 'xianggang', '香港'],
  MFM: ['ma cao', 'macau', 'macao', '澳门', '澳門'],
  PVG: ['thuong hai', 'thượng hải', 'shanghai', 'shang hai', '上海', 'pudong', '浦东', '浦東'],
  SHA: ['thuong hai', 'thượng hải', 'shanghai', 'shang hai', '上海', 'hongqiao', '虹桥', '虹橋'],
  PEK: ['bac kinh', 'bắc kinh', 'beijing', 'peking', '北京'],
  PKX: ['bac kinh', 'bắc kinh', 'beijing', 'peking', '北京', 'daxing', '大兴', '大興'],
  CAN: ['quang chau', 'quảng châu', 'guangzhou', 'canton', '广州', '廣州'],
  SZX: ['tham quyen', 'thâm quyến', 'shenzhen', '深圳'],
  CTU: ['thanh do', 'thành đô', 'chengdu', '成都'],
  XIY: ['tay an', 'tây an', 'xian', "xi'an", '西安'],
  KMG: ['con minh', 'côn minh', 'kunming', '昆明'],
  ICN: ['seoul', 'incheon', '서울', '仁川', '인천'],
  PUS: ['busan', 'pusan', '부산'],
  NRT: ['tokyo', 'tokio', 'to kyo', '東京', 'とうきょう', 'narita', '成田'],
  HND: ['tokyo', 'tokio', 'to kyo', '東京', 'とうきょう', 'haneda', '羽田'],
  KIX: ['osaka', '大阪', 'kansai', '関西', '關西'],
  FUK: ['fukuoka', '福岡'],
  BKK: ['bangkok', 'băng cốc', 'bang coc', 'กรุงเทพ', 'krung thep', 'suvarnabhumi'],
  DMK: ['bangkok', 'băng cốc', 'bang coc', 'กรุงเทพ', 'krung thep', 'don mueang', 'don muang'],
  HKT: ['phuket', 'ภูเก็ต'],
  CNX: ['chiang mai', 'เชียงใหม่'],
  KUL: ['kuala lumpur', 'kl', '吉隆坡'],
  PEN: ['penang', '槟城', '檳城'],
  MNL: ['manila', 'maynila', '马尼拉', '馬尼拉'],
  CGK: ['jakarta', 'djakarta', '雅加达', '雅加達'],
  DPS: ['bali', 'denpasar', '峇里', '巴厘'],
  LHR: ['london', 'luan don', 'luân đôn', 'heathrow', '伦敦', '倫敦'],
  CDG: ['paris', 'pa ri', 'ba le', '巴黎', 'charles de gaulle'],
  FRA: ['frankfurt', 'frank furt', '法兰克福', '法蘭克福'],
  MUC: ['munich', 'munchen', 'muenchen', 'münchen', '慕尼黑'],
  FCO: ['rome', 'roma', 'la ma', 'la mã', '罗马', '羅馬'],
  IST: ['istanbul', 'istanbul', '伊斯坦布尔', '伊斯坦堡'],
  ZRH: ['zurich', 'zuerich', 'zürich', '苏黎世', '蘇黎世'],
  LAX: ['los angeles', 'la', '洛杉矶', '洛杉磯'],
  SFO: ['san francisco', 'sf', '旧金山', '舊金山'],
  JFK: ['new york', 'nyc', '纽约', '紐約'],
  EWR: ['new york', 'newark', 'nyc', '纽约', '紐約'],
  ORD: ['chicago', '芝加哥'],
  YVR: ['vancouver', '温哥华', '溫哥華'],
  YYZ: ['toronto', '多伦多', '多倫多'],
};

export function normalizeAirportSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f]+/g, ' ')
    .trim();
}

export function airportSearchBlob(airport: AirportDef): string {
  const names = Object.values(airport.name);
  const aliases = [...(airport.aliases ?? []), ...(EXTRA_ALIASES[airport.code] ?? [])];
  return [airport.code, ...names, ...aliases]
    .map(normalizeAirportSearchText)
    .join(' ');
}

export function airportName(code: string, lang: Language): string {
  const a = AIRPORT_LIST.find((x) => x.code === code);
  return a?.name[lang] ?? a?.name.en ?? code;
}
