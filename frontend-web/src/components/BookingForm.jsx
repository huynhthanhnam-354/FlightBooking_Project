import React, { useState, useEffect } from "react";
import { useBookingStore } from "../store/bookingStore";
import { FaUser, FaGlobe, FaVenusMars, FaIdCard, FaEnvelope, FaPhone, FaStickyNote, FaExclamationTriangle, FaChevronRight } from 'react-icons/fa';

export default function BookingForm({ flight, passengers = 1, onSubmit }) {
  const updatePassengerInfo = useBookingStore((state) => state.updatePassengerInfo);
  
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male",
    nationality: "Vietnam",
    dob: "",
    passport: "",
    email: "",
    phone: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    if (touched.fullName && !formData.fullName) {
      newErrors.fullName = "Họ tên không được để trống";
    } else if (touched.fullName && formData.fullName.length < 3) {
      newErrors.fullName = "Họ tên quá ngắn";
    }

    if (touched.email && !formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (touched.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (touched.phone && !formData.phone) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (touched.phone && !/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    setErrors(newErrors);
  }, [formData, touched]);

  if (!flight) return null;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    
    // Mark all as touched for final validation check
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (Object.keys(errors).length > 0 || !formData.fullName || !formData.email || !formData.phone) {
      return;
    }

    setIsLoading(true);
    updatePassengerInfo(formData);

    const booking = {
      flight,
      passengers,
      passenger: formData,
      contact: { email: formData.email, phone: formData.phone },
      notes: formData.notes
    };

    setTimeout(() => {
      onSubmit && onSubmit(booking);
      setIsLoading(false);
    }, 600);
  }

  const inputClass = (field) => `w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
    errors[field] 
      ? 'border-red-300 bg-red-50 focus:ring-red-200' 
      : 'border-slate-200 bg-white focus:border-sky-500 focus:ring-sky-100'
  }`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Warning Header */}
      <div className="bg-sky-50 border border-sky-100 rounded-3xl p-5 flex gap-4 items-center">
        <div className="bg-sky-500 p-3 rounded-2xl text-white shadow-lg shadow-sky-200">
          <FaIdCard size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sky-900 text-sm">Lưu ý quan trọng</h4>
          <p className="text-sky-700 text-xs mt-0.5">Tên hành khách phải khớp hoàn toàn với thông tin trên CMND/CCCD hoặc Hộ chiếu.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10 space-y-10">
          
          {/* Section: Personal Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Thông tin hành khách</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaUser size={10} /> Họ và tên
                </label>
                <input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="NGUYEN VAN A"
                  className={inputClass('fullName')}
                />
                {errors.fullName && <p className="text-[11px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FaVenusMars size={10} /> Giới tính
                  </label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FaGlobe size={10} /> Quốc tịch
                  </label>
                  <select 
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="Vietnam">Việt Nam</option>
                    <option value="USA">Hoa Kỳ</option>
                    <option value="Japan">Nhật Bản</option>
                    <option value="Korea">Hàn Quốc</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ngày sinh</label>
                <input 
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hộ chiếu / CMND</label>
                <input 
                  name="passport"
                  value={formData.passport}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section: Contact Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Thông tin liên hệ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaEnvelope size={10} /> Email nhận vé
                </label>
                <input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="example@gmail.com"
                  className={inputClass('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500 font-bold ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaPhone size={10} /> Số điện thoại
                </label>
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="0901234567"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-[11px] text-red-500 font-bold ml-1">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Section: Notes */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Yêu cầu bổ sung</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FaStickyNote size={10} /> Ghi chú cho hãng bay
              </label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Ví dụ: Suất ăn chay, hỗ trợ xe lăn..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none resize-none"
              />
            </div>
          </section>

          {/* Warning Message */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 flex gap-4">
             <div className="bg-white p-2.5 rounded-2xl shadow-sm text-amber-500 self-start">
                <FaExclamationTriangle size={18} />
             </div>
             <p className="text-xs text-amber-800 leading-relaxed">
                Bằng cách nhấn nút tiếp tục, bạn xác nhận rằng tất cả thông tin cung cấp là chính xác. Việc sai lệch thông tin có thể dẫn đến việc từ chối vận chuyển hoặc phát sinh phí đổi tên cao.
             </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500 max-w-sm text-center md:text-left">
            Thông tin của bạn sẽ được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn quốc tế.
          </p>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full md:w-auto px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Tiếp tục thanh toán
                <FaChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
