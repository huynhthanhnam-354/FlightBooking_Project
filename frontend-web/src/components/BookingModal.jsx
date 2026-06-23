import React, { useState } from 'react';
import { FaPlane, FaHotel, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaIdCard, FaTimes, FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ combo, onClose }) {
  const { user } = useAuth();

  const [passengers, setPassengers] = useState(combo?.passengerCount || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    passport: '',
    email: user?.email || '',
  });

  if (!combo) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.passport || !formData.email) {
      toast.error('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        comboId: combo.id,
        selectedFlightId: combo.selectedFlightId || combo.flight?.id || 1,
        selectedRoomTypeId: combo.selectedRoomTypeId || 'std',
        passengerName: formData.fullName,
        passengerEmail: user?.email || formData.email,
        passengerPhone: formData.phone,
        passengerIdCard: formData.passport,
        passengerCount: passengers,
        baggageKg: 20,
        baggageFeeVnd: 0
      };

      const res = await api.post('/v1/combos/checkout', payload);
      const { bookingId, pnr } = res.data || {};

      if (bookingId) {
        setPaymentStep({ bookingId, pnr });
        toast.info('Đã tạo booking combo. Vui lòng xác nhận thanh toán.');
      } else {
        toast.success(`Đặt thành công Combo ${combo.location} cho ${passengers} hành khách!`);
        onClose();
      }
    } catch (err) {
      console.error("Combo checkout error:", err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt combo.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmComboPayment = async () => {
    if (!paymentStep?.bookingId) return;
    setIsLoading(true);
    try {
      await bookingApi.paymentSuccess(paymentStep.bookingId);
      toast.success('Thanh toán combo thành công. Vé đã được thêm vào lịch sử.');
      onClose();
      window.location.href = '/user-dashboard';
    } catch (err) {
      console.error('Combo payment confirmation error:', err);
      toast.error(err.response?.data?.message || 'Không thể xác nhận thanh toán combo.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = combo.price * passengers;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      {paymentStep && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
              QR
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thanh toán combo</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Xác nhận thanh toán</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Booking combo {paymentStep.pnr ? `#${paymentStep.pnr}` : ''} đã được tạo. Bấm xác nhận để chuyển sang trạng thái đã thanh toán.
            </p>
            <div className="my-7 rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=FlightBooking_Combo_Payment"
                alt="QR"
                className="mx-auto h-52 w-52 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={confirmComboPayment}
                disabled={isLoading}
                className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {isLoading ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
              </button>
              <button
                type="button"
                onClick={() => setPaymentStep(null)}
                className="w-full rounded-2xl bg-slate-100 py-4 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
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
                  disabled
                  placeholder="email@example.com"
                  className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-sm text-slate-500 cursor-not-allowed outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 font-medium">Email nhận vé được lấy theo tài khoản đang đăng nhập.</p>
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
                  disabled={isLoading}
                  className={`w-2/3 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isLoading 
                      ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận đặt combo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
