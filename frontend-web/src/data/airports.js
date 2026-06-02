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
  { code: 'VII', city: 'Vinh', airport: 'Sân bay Quốc tế Vinh' }, // Fixing inconsistent key if any, but request uses 'airport'
  { code: 'UIH', city: 'Quy Nhơn', name: 'Sân bay Phù Cát' },
  { code: 'THD', city: 'Thanh Hóa', name: 'Sân bay Thọ Xuân' },
  { code: 'VCA', city: 'Cần Thơ', name: 'Sân bay Quốc tế Cần Thơ' }
];

// Note: Consistent key 'name' or 'airport'? The user provided 'airport' in the object list.
// Let's use 'name' to keep it consistent with the existing codebase structure but with the user's values.

export const VIETNAM_AIRPORTS = [
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
  { code: 'VCA', city: 'Cần Thơ', name: 'Sân bay Quốc tế Cần Thơ' }
];

export default AIRPORTS;
