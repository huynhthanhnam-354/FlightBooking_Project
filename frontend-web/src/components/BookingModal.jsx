import React, { useState } from 'react';
import { FaPlane, FaHotel, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaIdCard, FaTimes, FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function BookingModal({ combo, onClose }) {
  if (!combo) return null;

  const [passengers, setPassengers] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    passport: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fullName' ? value.toUpperCase() : value
    }));
  };

  const handleIncrement = () => {
    if (passengers < 9) setPassengers(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (passengers > 1) setPassengers(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.passport || !formData.email) {
      toast.error('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    
    toast.success(`Đặt thành công Combo ${combo.location} cho ${passengers} hành khách!`);
    onClose();
  };

  const totalPrice = combo.price * passengers;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[160] text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
        >
          <FaTimes size={16} />
        </button>

        {/* Left Column: Summary (Dark Theme) */}
        <div className="w-full md:w-5/12 bg-[#1a2b49] text-white p-10 flex flex-col justify-between">
          <div className="space-y-8">
            <div>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-[9px] font-black uppercase tracking-wider inline-block">
                Tóm tắt combo
              </span>
              <h3 className="text-xl font-black mt-3 leading-tight tracking-tight text-white">{combo.title}</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">{combo.location} • Khách sạn 5★</p>
            </div>

            <div className="space-y-4">
              {/* Hotel */}
              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  <FaHotel size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nơi lưu trú</p>
                  <p className="text-xs font-bold text-white truncate mt-0.5">{combo.hotelName}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{combo.duration}</p>
                </div>
              </div>

              {/* Flight */}
              <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  <FaPlane size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vé máy bay khứ hồi</p>
                  <p className="text-xs font-bold text-white mt-0.5">Hãng bay chất lượng cao</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Bao gồm 7kg xách tay & 20kg ký gửi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Total Price */}
          <div className="pt-8 border-t border-white/10 mt-8 md:mt-0">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tổng chi phí ({passengers} khách)</p>
                <p className="text-3xl font-black text-blue-400 tracking-tight mt-1">{totalPrice.toLocaleString()}₫</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-300 mt-2 italic font-medium">* Đã bao gồm thuế, phí và các dịch vụ đi kèm</p>
          </div>
        </div>

        {/* Right Column: Passenger Input Form (White Theme) */}
        <div className="w-full md:w-7/12 p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thông Tin Đặt Combo</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Vui lòng nhập thông tin chính xác theo CMND/CCCD hoặc Hộ chiếu</p>
            </div>

            {/* Stepper Passenger Count Selector */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Số lượng hành khách</p>
                <p className="text-[10px] text-slate-400 font-medium">Tối đa 9 khách mỗi lượt đặt</p>
              </div>
              <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={passengers <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <FaMinus size={10} />
                </button>
                <span className="text-sm font-black text-slate-800 w-4 text-center">{passengers}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={passengers >= 9}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <FaPlus size={10} />
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FaUser className="text-slate-300" size={10} /> Họ và tên liên hệ
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="NGUYEN VAN A"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaPhone className="text-slate-300" size={10} /> Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-blue-600 focus:bg-white outline-none transition-all"
                    required
                  />
                </div>

                {/* Passport/ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaIdCard className="text-slate-300" size={10} /> Số CCCD / Hộ chiếu
                  </label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleChange}
                    placeholder="012345678901"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-blue-600 focus:bg-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FaEnvelope className="text-slate-300" size={10} /> Email nhận vé
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Xác nhận đặt combo
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
