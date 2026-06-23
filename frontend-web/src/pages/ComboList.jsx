import React, { useState } from 'react';
import { FaPlane, FaHotel, FaCalendarAlt, FaStar } from 'react-icons/fa';
import BookingModal from '../components/BookingModal';

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

const regions = [
  { id: 'all', label: 'Tất cả điểm đến' },
  { id: 'Miền Bắc', label: 'Miền Bắc' },
  { id: 'Miền Trung', label: 'Miền Trung' },
  { id: 'Miền Nam', label: 'Miền Nam' }
];

export default function ComboList() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCombo, setSelectedCombo] = useState(null);

  const filteredCombos = selectedRegion === 'all'
    ? mockData
    : mockData.filter(item => item.region === selectedRegion);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 opacity-90 z-0"></div>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest inline-block">
            ✨ Đặc quyền du lịch trọn gói
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none uppercase">
            Combo Vé Máy Bay + Khách Sạn
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Đặt trọn gói hành trình khứ hồi chất lượng cao cùng các resort nghỉ dưỡng 5 sao hàng đầu Việt Nam để nhận ưu đãi tiết kiệm tới 20%.
          </p>
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

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {filteredCombos.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Image */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80' }}
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-blue-600 shadow-sm border border-slate-100 tracking-wider">
                   ✈️ Bay + 🏨 Hotel 5★
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.location}</span>
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
                </div>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Giá trọn gói từ</p>
                    <p className="text-base font-black text-slate-900">{item.price.toLocaleString()}₫</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCombo(item)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 active:scale-95"
                  >
                    Đặt ngay
                  </button>
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

      {/* Footer Info */}
      <div className="pb-12 text-center">
        <p className="text-sm text-slate-400 font-medium">Phiên bản v2.0.0 (FlightBook AI Premium)</p>
      </div>
    </div>
  );
}
