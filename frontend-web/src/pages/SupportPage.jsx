import React, { useState } from 'react';
import { 
  FaSearch, 
  FaChevronRight, 
  FaQuestionCircle, 
  FaUser, 
  FaPlane, 
  FaHotel, 
  FaSuitcase, 
  FaCar, 
  FaShieldAlt, 
  FaThLarge, 
  FaCommentAlt,
  FaArrowRight
} from 'react-icons/fa';

/**
 * SupportPage Component
 * A premium Help Center UI modeled after Traveloka's experience.
 * Re-implemented using react-icons to ensure compatibility with project dependencies.
 */
const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Popular FAQ topics for the left column
  const popularTopics = [
    { id: 1, title: 'Làm thế nào để đổi lịch chuyến bay (Reschedule)?' },
    { id: 2, title: 'Tôi muốn thay đổi thông tin hành khách hoặc tên?' },
    { id: 3, title: 'Quy trình và điều kiện hủy vé, hoàn tiền (Refund)?' },
    { id: 4, title: 'Kiểm tra trạng thái hoàn tiền của tôi?' },
    { id: 5, title: 'Làm thế nào để mua thêm hành lý ký gửi?' },
    { id: 6, title: 'Vấn đề về thanh toán và hóa đơn điện tử?' },
  ];

  // Product categories for the right column grid
  const productCategories = [
    { id: 'general', label: 'Thông tin chung', icon: FaQuestionCircle, color: 'bg-slate-100 text-slate-600' },
    { id: 'account', label: 'Tài khoản & Bảo mật', icon: FaUser, color: 'bg-blue-50 text-blue-600' },
    { id: 'flight', label: 'Chuyến bay', icon: FaPlane, color: 'bg-sky-50 text-sky-600' },
    { id: 'hotel', label: 'Khách sạn', icon: FaHotel, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'combo', label: 'Combo tiết kiệm', icon: FaSuitcase, color: 'bg-purple-50 text-purple-600' },
    { id: 'airport-car', label: 'Xe đưa đón sân bay', icon: FaCar, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'insurance', label: 'Bảo hiểm', icon: FaShieldAlt, color: 'bg-rose-50 text-rose-600' },
    { id: 'all', label: 'Tất cả sản phẩm', icon: FaThLarge, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HERO & SEARCH HEADER */}
      <section className="relative w-full bg-gradient-to-r from-blue-600 to-sky-500 pt-20 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center text-white mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Trung tâm hỗ trợ Flight Booking
          </h1>
          <p className="text-blue-50 opacity-90 text-lg font-medium">
            Tìm kiếm câu trả lời cho các vấn đề của bạn tại đây
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <FaSearch size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập vấn đề bạn cần giúp đỡ (vd: hoàn tiền, đổi lịch...)"
              className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl shadow-2xl border-none outline-none text-slate-700 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-6 mt-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Chủ đề phổ biến */}
          <div className="md:col-span-5 lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Chủ đề phổ biến</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-blue-50 transition-all group"
                  >
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors pr-4">
                      {topic.title}
                    </span>
                    <FaChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Support CTA */}
            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FaCommentAlt className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Liên hệ chúng tôi</h3>
                  <p className="text-blue-100 text-sm mt-1 font-medium leading-relaxed">
                    Bạn vẫn chưa tìm thấy câu trả lời? Đội ngũ hỗ trợ 24/7 luôn sẵn sàng giúp đỡ.
                  </p>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                Gửi yêu cầu hỗ trợ <FaArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Tìm kiếm theo danh mục sản phẩm */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Tìm kiếm theo danh mục sản phẩm</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Chọn loại dịch vụ bạn đang gặp vấn đề để được hỗ trợ nhanh nhất.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {productCategories.map((cat) => (
                <button
                  key={cat.id}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={22} />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Additional info section */}
            <div className="mt-12 bg-slate-100/50 rounded-[2.5rem] p-10 border border-slate-200/50 border-dashed">
               <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center shrink-0">
                     <FaShieldAlt className="text-emerald-500" size={36} />
                  </div>
                  <div>
                     <h4 className="text-lg font-black text-slate-900">Cam kết bảo mật & An toàn</h4>
                     <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Flight Booking sử dụng các công nghệ bảo mật hàng đầu để bảo vệ thông tin cá nhân và giao dịch của bạn. Tất cả các yêu cầu hỗ trợ đều được mã hóa và xử lý theo quy trình nghiêm ngặt.
                     </p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SupportPage;
