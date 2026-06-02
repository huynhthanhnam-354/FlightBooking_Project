import React from 'react';

const mockData = [
  {
    id: 1,
    title: 'Kỳ nghỉ trọn gói Đà Nẵng 3N2Đ',
    location: 'Đà Nẵng',
    hotelName: 'InterContinental Danang Sun Peninsula',
    price: 6890000,
    image: 'https://images.unsplash.com/photo-1559592481-74418d7cd362?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Khám phá Đảo Ngọc Phú Quốc 4N3Đ',
    location: 'Phú Quốc',
    hotelName: 'JW Marriott Phu Quoc Emerald Bay',
    price: 9450000,
    image: 'https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Nha Trang Biển Gọi 3N2Đ',
    location: 'Nha Trang',
    hotelName: 'Amiana Resort Nha Trang',
    price: 5900000,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  }
];

export default function ComboList() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Banner */}
      <section className="bg-slate-800 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Combo Vé Máy Bay + Khách Sạn
          </h1>
          <p className="text-lg text-slate-300">
            Đặt cùng nhau, tiết kiệm đến 20% chi phí chuyến đi
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockData.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 flex flex-col transition-transform hover:-translate-y-1">
              <div className="relative h-56">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80' }}
                />
                <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-sky-600 shadow-sm border border-slate-100">
                   ✈️ Vé máy bay + 🏨 Khách sạn 5 sao
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-amber-500">⭐⭐⭐⭐⭐</span>
                   <span className="text-xs font-bold text-slate-400 uppercase">({item.location})</span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <span>📍</span> {item.hotelName}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <span>📅</span> 3 ngày 2 đêm
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Giá từ</p>
                    <p className="text-xl font-black text-slate-900">{item.price.toLocaleString()}₫</p>
                  </div>
                  <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/20">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer info */}
      <div className="pb-12 text-center">
        <p className="text-sm text-slate-400 font-medium">Phiên bản v1.0.0 (FlightBook AI)</p>
      </div>
    </div>
  );
}
