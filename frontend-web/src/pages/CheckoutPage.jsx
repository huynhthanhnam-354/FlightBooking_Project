import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  FaClock, FaPlane, FaArrowRight, FaHome, FaHistory, FaChevronRight, FaShieldAlt, FaLock
} from 'react-icons/fa'
import { bookingApi } from '../services/api'
import { useBookingStore } from '../store/bookingStore'
import { toast } from 'react-toastify'

const BAGGAGE_OPTIONS = [
  { id: 'none', kg: 0, fee: 0, title: '7kg xách tay', note: 'Miễn phí' },
  { id: '20', kg: 20, fee: 220000, title: '20kg ký gửi', note: '+220.000₫' },
  { id: '40', kg: 40, fee: 480000, title: '40kg ký gửi', note: '+480.000₫' },
]

/**
 * Clean & Professional Checkout
 * Optimized to remove oversized checkmarks and intrusive markers.
 */
export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  const setSearchParams = useBookingStore((state) => state.setSearchParams)

  const bookingState = location.state?.booking || null
  const flight = bookingState?.flight || { id: 1, price: 1200000, originCode: 'HAN', destinationCode: 'SGN', airline: 'Vietnam Airlines' }
  const passengers = bookingState?.passengers || 1

  // --- LOCAL STATE ---
  const [formData, setFormData] = useState({
    name: bookingState?.passenger?.fullName || '',
    phone: bookingState?.contact?.phone || '',
    email: bookingState?.contact?.email || '',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false) 
  const [showQRModal, setShowQRModal] = useState(false)
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [baggage, setBaggage] = useState('none')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900)

  // --- CALCULATIONS ---
  const subtotal = Number(flight.price) * passengers
  const baggageFee = BAGGAGE_OPTIONS.find(b => b.id === baggage)?.fee || 0
  const total = subtotal + baggageFee + 45000 

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentTrigger = async () => {
    if (!formData.name || !formData.email) return toast.warning('Vui lòng điền thông tin liên hệ')
    if (!acceptedTerms) return toast.warning('Vui lòng đồng ý với điều khoản')

    setIsLoading(true)
    try {
      const payload = {
        flightId: flight.id,
        seatNumber: selectedSeats.join(', ') || 'Auto',
        passengerName: formData.name.toUpperCase(),
        passengerEmail: formData.email,
        passengerPhone: formData.phone,
        passengerCount: passengers,
        totalPriceVnd: total,
        paymentMethod: 'VNPAY-QR',
        tripType: 'ONE_WAY'
      }
      const res = await bookingApi.create(payload)
      setActiveBookingId(res.data.id)
      setTimeout(() => { setShowQRModal(true); setIsLoading(false); }, 600)
    } catch (err) {
      toast.error('Lỗi khởi tạo đơn hàng.')
      setIsLoading(false)
    }
  }

  const finalizeSuccess = async () => {
    setShowQRModal(false)
    setIsLoading(true)
    try {
      // Senior Full-Stack Fix: Using the explicit payment-success endpoint for clean demo flow
      await bookingApi.paymentSuccess(activeBookingId)
      toast.success('Thanh toán thành công!')
      
      // Clear global state to avoid stale data on next booking
      setSearchParams({ from: '', to: '', date: '', passengers: 1 })
      
      // Redirect to User Dashboard (History Page)
      navigate('/user-dashboard') 
    } catch (err) {
      console.error("Payment Confirmation Error:", err)
      toast.error('Lỗi xác nhận giao dịch. Vui lòng kiểm tra Lịch sử đặt vé.')
      setIsLoading(false)
    }
  }

  const startNewBooking = () => {
    setSearchParams({ from: '', to: '', date: '', passengers: 1 })
    window.location.href = '/';
  }

  // --- SUCCESS VIEW (NO BIG CHECKMARKS) ---
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
        <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-50 p-12 text-center border-b border-slate-100">
            <h1 className="text-2xl font-black mb-2 tracking-tight">Xác nhận đặt chỗ thành công</h1>
            <p className="font-bold text-sky-600 uppercase tracking-widest text-[10px]">Đơn hàng của bạn đã được ghi nhận</p>
          </div>
          
          <div className="p-10">
             <div className="bg-white rounded-3xl p-8 mb-10 border border-slate-100">
                <div className="flex justify-between items-center mb-8 text-sm">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                      <p className="text-xl font-black text-slate-900">#BK{activeBookingId}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Đã xác nhận</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-100">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hành trình</p>
                      <p className="font-bold">{flight.originCode} → {flight.destinationCode}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hành khách</p>
                      <p className="font-bold truncate">{formData.name}</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('/user-dashboard')} className="py-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Quản lý vé</button>
                <button onClick={startNewBooking} className="py-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2">Tiếp tục đặt vé</button>
             </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      
      {/* PROFESSIONAL VNPAY-QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <div className="flex-1 p-12 bg-slate-50 border-r border-slate-100">
               <div className="flex items-center gap-4 mb-12">
                  <div className="w-14 h-14 bg-[#005baa] rounded-2xl flex items-center justify-center text-white font-black italic text-2xl shadow-lg">VN</div>
                  <div>
                    <h2 className="text-2xl font-black text-[#005baa] tracking-tighter">VNPAY<span className="text-red-600">QR</span></h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Đơn giản - Nhanh chóng - Bảo mật</p>
                  </div>
               </div>
               <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nhà cung cấp</label>
                    <p className="text-xl font-bold text-slate-800">FlightBooking Global Airline</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Số tiền thanh toán</label>
                    <p className="text-4xl font-black text-sky-800 tracking-tight">{total.toLocaleString()}₫</p>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-[420px] p-12 text-center flex flex-col justify-center items-center bg-white">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=FlightBook_BK${activeBookingId}_${total}`} alt="QR" className="w-56 h-56" />
               </div>
               <div className="space-y-3 w-full">
                  <button onClick={finalizeSuccess} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-bold text-lg hover:bg-sky-700 transition shadow-lg active:scale-95">Xác nhận đã quét mã</button>
                  <button onClick={() => setShowQRModal(false)} className="w-full py-4 text-slate-400 font-bold hover:text-red-500 transition-all">Hủy giao dịch</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-sky-900 text-white pt-20 pb-28 px-4 text-center">
        <h1 className="text-4xl font-black tracking-tight mb-4 uppercase tracking-widest">Thanh toán</h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sky-200 font-bold">
            <span>{flight.originCode}</span> <FaArrowRight size={12} className="opacity-30" /> <span>{flight.destinationCode}</span>
            <span className="mx-2 opacity-20">|</span> <span className="text-sky-300 font-medium">{flight.airline}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 grid lg:grid-cols-12 gap-8 relative z-20">
        <div className="lg:col-span-8 space-y-6">
          {/* INFO SECTION */}
          <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Thông tin khách hàng</h2>
               <div className="text-xs font-black text-slate-400 tabular-nums">Hết hạn: {formatTime(timeLeft)}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold focus:ring-1 focus:ring-sky-500" placeholder="NGUYEN VAN A" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email nhận vé</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold focus:ring-1 focus:ring-sky-500" placeholder="customer@email.com" />
              </div>
            </div>
          </section>

          {/* ADD-ONS */}
          <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black mb-8 text-slate-800 tracking-tight">Dịch vụ bổ sung</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {BAGGAGE_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setBaggage(opt.id)} className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-32 ${baggage === opt.id ? 'border-sky-600 bg-sky-50 shadow-md shadow-sky-600/5' : 'border-slate-50 bg-slate-50/30 hover:border-slate-100'}`}>
                  <p className="font-bold text-slate-800 leading-tight">{opt.title}</p>
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{opt.note}</p>
                </button>
              ))}
            </div>
          </section>

          {/* PAYMENT */}
          <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black mb-8 text-slate-800 tracking-tight">Phương thức thanh toán</h2>
            <div className="p-8 rounded-[2rem] border-2 border-sky-600 bg-sky-50/20 flex items-center gap-8">
               <div className="w-24 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black italic text-2xl text-blue-700 border border-slate-100">VN<span className="text-red-500">PAY</span></div>
               <div className="flex-1 text-left">
                  <p className="font-black text-slate-900 text-lg">Cổng thanh toán VNPAY-QR</p>
                  <p className="text-sm font-medium text-slate-500 italic">Thanh toán an toàn qua Mobile Banking</p>
               </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-10 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-8">Chi tiết đơn hàng</h3>
              <div className="space-y-4 mb-10 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">Giá vé</span> <span className="font-bold">{subtotal.toLocaleString()}₫</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Hành lý</span> <span className="font-bold text-sky-300">+{baggageFee.toLocaleString()}₫</span></div>
                <div className="flex justify-between items-center text-sky-200"><span className="font-medium italic">Thuế & Phí</span> <span className="font-bold">45.000₫</span></div>
              </div>
              <div className="flex justify-between items-end pt-8 border-t border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng cộng</span>
                <span className="text-4xl font-black tracking-tighter text-white tabular-nums">{total.toLocaleString()}₫</span>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
              <label className="flex items-start gap-4 mb-10 cursor-pointer select-none">
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                <span className="text-xs font-medium text-slate-500 leading-relaxed">Tôi xác nhận thông tin chính xác và đồng ý với điều khoản sử dụng.</span>
              </label>
              
              <button onClick={handlePaymentTrigger} disabled={isLoading || !acceptedTerms} className={`w-full py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-4 transition-all active:scale-95 ${isLoading || !acceptedTerms ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}>
                {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Thanh toán ngay <FaChevronRight size={14} className="opacity-50" /></>}
              </button>

              <div className="mt-8 flex justify-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
                 SECURE ENCRYPTED TRANSACTION
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
