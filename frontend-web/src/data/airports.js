/** Danh sách sân bay phổ biến tại Việt Nam */
export const AIRPORTS = [
  { code: 'HAN', city: 'Hà Nội', name: 'Sân bay Quốc tế Nội Bài' },
  { code: 'SGN', city: 'TP. Hồ Chí Minh', name: 'Sân bay Quốc tế Tân Sơn Nhất' },
  { code: 'DAD', city: 'Đà Nẵng', name: 'Sân bay Quốc tế Đà Nẵng' },
  { code: 'PQC', city: 'Phú Quốc', name: 'Sân bay Quốc tế Phú Quốc' },
  { code: 'CXR', city: 'Nha Trang', name: 'Sân bay Quốc tế Cam Ranh' },
  { code: 'HPH', city: 'Hải Phòng', name: 'Sân bay Cát Bi' },
  { code: 'HUI', city: 'Huế', name: 'Sân bay Quốc tế Phú Bài' },
  { code: 'DLI', city: 'Đà Lạt', name: 'Sân bay Liên Khương' },
  { code: 'VII', city: 'Vinh', name: 'Sân bay Quốc tế Vinh' },
  { code: 'UIH', city: 'Quy Nhơn', name: 'Sân bay Phù Cát' },
  { code: 'THD', city: 'Thanh Hóa', name: 'Sân bay Thọ Xuân' },
  { code: 'VCA', city: 'Cần Thơ', name: 'Sân bay Quốc tế Cần Thơ' },
]

export const VIETNAM_AIRPORTS = AIRPORTS

export const AIRPORT_ALIASES = {
  HAN: ['ha noi', 'hanoi', 'noi bai'],
  SGN: ['sai gon', 'saigon', 'ho chi minh', 'hcmc', 'tp hcm', 'tphcm', 'tan son nhat'],
  DAD: ['da nang', 'danang'],
  HPH: ['hai phong', 'cat bi'],
  CXR: ['nha trang', 'cam ranh'],
  PQC: ['phu quoc'],
  TPE: ['dai bac', 'taipei', 'taibei', 'tai wan', 'taiwan'],
  HKG: ['hong kong', 'huong cang', 'xianggang'],
  PVG: ['thuong hai', 'shanghai', 'shang hai', 'pudong'],
  SHA: ['thuong hai', 'shanghai', 'shang hai', 'hongqiao'],
  PEK: ['bac kinh', 'beijing', 'peking'],
  CAN: ['quang chau', 'guangzhou', 'canton'],
  SZX: ['tham quyen', 'shenzhen'],
  CTU: ['thanh do', 'chengdu'],
  XIY: ['tay an', 'xian', "xi'an"],
  KMG: ['con minh', 'kunming'],
  ICN: ['seoul', 'incheon'],
  NRT: ['tokyo', 'tokio', 'narita'],
  HND: ['tokyo', 'tokio', 'haneda'],
  KIX: ['osaka', 'kansai'],
  BKK: ['bangkok', 'bang coc', 'krung thep', 'suvarnabhumi'],
  DMK: ['bangkok', 'bang coc', 'krung thep', 'don mueang', 'don muang'],
  HKT: ['phuket'],
  KUL: ['kuala lumpur', 'kl'],
  MNL: ['manila', 'maynila'],
  CGK: ['jakarta', 'djakarta'],
  DPS: ['bali', 'denpasar'],
  LHR: ['london', 'luan don', 'heathrow'],
  CDG: ['paris', 'pa ri', 'ba le', 'charles de gaulle'],
  FRA: ['frankfurt'],
  FCO: ['rome', 'roma', 'la ma'],
  IST: ['istanbul'],
  LAX: ['los angeles', 'la'],
  SFO: ['san francisco', 'sf'],
  JFK: ['new york', 'nyc'],
  YYZ: ['toronto'],
}

export function normalizeAirportSearchText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f]+/g, ' ')
    .trim()
}

export function airportSearchBlob(airport) {
  return [airport.code, airport.city, airport.name || airport.airport || '', ...(AIRPORT_ALIASES[airport.code] || [])]
    .map(normalizeAirportSearchText)
    .join(' ')
}

export default AIRPORTS
