import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaShieldAlt,
  FaCreditCard,
  FaClock,
  FaPlane,
  FaUser,
  FaBriefcase,
  FaUtensils,
  FaPercentage,
  FaChevronRight,
  FaInfoCircle,
  FaCheckCircle,
  FaLock,
  FaArrowRight,
  FaQrcode,
  FaUniversity,
  FaGlobe
} from 'react-icons/fa'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import { bookingApi, paymentApi } from '../services/api'
import { useBookingStore } from '../store/bookingStore'
import { toast } from 'react-toastify'

const BAGGAGE_OPTIONS = [
  { id: 'none', kg: 0, fee: 0, title: '7kg xách tay', note: 'Miễn phí' },
  { id: '20', kg: 20, fee: 220000, title: '20kg ký gửi', note: '+220.000₫' },
  { id: '40', kg: 40, fee: 480000, title: '40kg ký gửi', note: '+480.000₫' },
]

const MEAL_OPTIONS = [
  { id: 'none', title: 'Không suất ăn', fee: 0 },
  { id: 'standard', title: 'Tiêu chuẩn', fee: 85000 },
  { id: 'premium', title: 'Cao cấp', fee: 150000 },
]

/**
 * VNPay Payment Integrated Checkout Page
 * Refactored for a premium, Senior Developer standard UI/UX.
 */
export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSeats = useBookingStore((state) => state.selectedSeats)

  const bookingState = location.state?.booking || null
  const flight = bookingState?.flight || MOCK_FLIGHTS[0]
  const passengers = bookingState?.passengers || 1

  const [formData, setFormData] = useState({
    name: bookingState?.passenger?.fullName || bookingState?.passenger?.name || '',
    phone: bookingState?.contact?.phone || '',
    email: bookingState?.contact?.email || '',
    idCard: '',
  })

  const [errors, setErrors] = useState({})
  const [baggage, setBaggage] = useState('none')
  const [meal, setMeal] = useState('none')
  const [insurance, setInsurance] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900)

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('Thời gian giữ chỗ đã hết hạn. Vui lòng đặt lại.')
      navigate('/booking')
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, navigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, '')) || 0
  const subtotal = priceNumber * passengers
  const baggageFee = BAGGAGE_OPTIONS.find((b) => b.id === baggage)?.fee || 0
  const mealFee = MEAL_OPTIONS.find((m) => m.id === meal)?.fee || 0
  const insuranceFee = insurance ? 99000 : 0
  const serviceFee = 45000 * passengers
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + baggageFee + mealFee + insuranceFee + serviceFee - discount

  const validate = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Họ tên không được để trống'
    if (!formData.phone) newErrors.phone = 'Số điện thoại không được để trống'
    if (!formData.email) newErrors.email = 'Email không hợp lệ'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoApplied(false)
      setPromoMessage('Vui lòng nhập mã ưu đãi.')
      return
    }
    if (promoCode.toUpperCase() === 'SKY25') {
      setPromoApplied(true)
      setPromoMessage('Mã ưu đãi đã được áp dụng. Giảm 10%.')
      toast.success('Mã ưu đãi đã được áp dụng.')
      return
    }
    setPromoApplied(false)
    setPromoMessage('Mã ưu đãi không hợp lệ hoặc đã hết hạn.')
    toast.error('Mã ưu đãi không hợp lệ.')
  }

  /**
   * Main Payment Handler - VNPay Integrated
   */
  async function handleVNPayPayment() {
    if (!validate()) {
      toast.warning('Vui lòng kiểm tra lại thông tin hành khách')
      return
    }

    if (!acceptedTerms) {
      toast.warning('Bạn cần đồng ý điều khoản và điều kiện để tiếp tục.')
      return
    }

    setIsLoading(true)
    try {
      console.log("Starting payment process for:", formData.name);
      
      // 1. Create Booking Record First
      const bookingRequest = {
        flightId: flight.id,
        seatNumber: selectedSeats.join(', ') || 'Auto',
        passengerName: formData.name,
        passengerEmail: formData.email,
        passengerPhone: formData.phone,
        baggageKg: BAGGAGE_OPTIONS.find((b) => b.id === baggage)?.kg || 0,
        baggageFeeVnd: baggageFee,
        totalPriceVnd: total,
      }

      console.log("Creating booking...");
      const bookingRes = await bookingApi.create(bookingRequest)
      const bookingId = bookingRes.data.id
      console.log("Booking created successfully. ID:", bookingId);

      // 2. Trigger VNPay URL Generation
      if (paymentMethod === 'vnpay') {
        console.log("Requesting VNPay payment URL...");
        const paymentRes = await paymentApi.createVnPayUrl(bookingId)
        const paymentUrl = paymentRes.data?.paymentUrl

        if (!paymentUrl) {
          throw new Error('Backend không trả về URL thanh toán VNPay.');
        }

        console.log("Redirecting to VNPay:", paymentUrl);
        // 3. Redirect to VNPay Secure Gateway
        window.location.href = paymentUrl
      } else {
        // Fallback for other methods (Mocking)
        setTimeout(() => {
          navigate('/booking/confirmation', { state: { bookingId, status: 'success' } })
          setIsLoading(false)
        }, 1500)
      }
    } catch (err) {
      console.error("Payment Flow Error:", err)
      const errMsg = err.response?.data?.message || err.message || 'Lỗi xử lý thanh toán'
      toast.error(`Lỗi: ${errMsg}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Info Bar */}
      <div className="bg-sky-900 text-white py-10 px-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-widest border border-sky-400/30">Checkout Process</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Thanh toán vé máy bay</h1>
            <p className="mt-3 text-sky-200/80 flex flex-wrap items-center gap-2 font-medium">
              <span className="text-white font-bold">{flight.originCode}</span>
              <FaArrowRight size={12} className="opacity-50" />
              <span className="text-white font-bold">{flight.destinationCode}</span>
              <span className="mx-2 opacity-30">|</span>
              {flight.airline} • {flight.depart}
            </p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300">
               <FaClock size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-300 font-black">Thời gian giữ chỗ</p>
              <p className="text-3xl font-black text-white tabular-nums leading-none mt-1">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid gap-10 lg:grid-cols-12">
        <main className="lg:col-span-8 space-y-8">
          {/* Flight Summary Card */}
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-2xl bg-sky-50 p-4 text-sky-600 shadow-inner">
                <FaPlane size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Hành trình bay</h2>
                <p className="text-sm font-medium text-slate-500">Thông tin chi tiết chuyến bay đã chọn</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 group hover:bg-white hover:border-sky-200 transition-all">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-3">Khởi hành</p>
                <p className="text-3xl font-black text-slate-900">{flight.depart}</p>
                <p className="mt-2 text-sm font-bold text-slate-600">{flight.origin} ({flight.originCode})</p>
              </div>
              <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 text-center flex flex-col justify-center">
                <div className="h-px bg-slate-200 w-full relative">
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-3">
                      <FaPlane className="text-slate-300" size={14} />
                   </div>
                </div>
                <p className="mt-4 text-sm font-black text-sky-600 uppercase tracking-widest">{flight.duration}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Bay thẳng</p>
              </div>
              <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 group hover:bg-white hover:border-sky-200 transition-all">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-3">Điểm đến</p>
                <p className="text-3xl font-black text-slate-900">{flight.arrive}</p>
                <p className="mt-2 text-sm font-bold text-slate-600">{flight.destination} ({flight.destinationCode})</p>
              </div>
            </div>
          </section>

          {/* Passenger Info Card */}
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 shadow-inner">
                <FaUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Thông tin liên hệ</h2>
                <p className="text-sm font-medium text-slate-500">Dùng để nhận vé điện tử và cập nhật chuyến bay</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className={`w-full rounded-2xl border px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="NGUYEN VAN A"
                />
                {errors.name && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.name}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full rounded-2xl border px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="0901234567"
                />
                {errors.phone && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.phone}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email nhận vé</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-2xl border px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.email}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">CMND / CCCD (Tùy chọn)</label>
                <input
                  type="text"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="0123456789"
                />
              </div>
            </div>
          </section>

          {/* Payment Method Integration */}
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-600 shadow-inner">
                <FaCreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Phương thức thanh toán</h2>
                <p className="text-sm font-medium text-slate-500">Lựa chọn cổng thanh toán an toàn và nhanh chóng</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* VNPay Option - Main Specification */}
              <label 
                className={`flex flex-col sm:flex-row items-center gap-6 rounded-[2rem] border-2 p-6 cursor-pointer transition-all duration-300 ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/5 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'}`}
              >
                <input 
                  type="radio" 
                  className="hidden" 
                  name="payment" 
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                />
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                  <div className="text-blue-700 font-black italic text-xl">VN<span className="text-red-500">PAY</span></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <p className="font-black text-slate-900 text-lg">Cổng thanh toán VNPay</p>
                     {paymentMethod === 'vnpay' && <FaCheckCircle className="text-blue-600" />}
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Hỗ trợ quét mã QR, Thẻ ATM/Internet Banking, Thẻ quốc tế (Visa, Master, JCB). An toàn & Bảo mật.
                  </p>
                </div>
                <div className="flex gap-2 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                  <FaQrcode size={18} />
                  <FaUniversity size={18} />
                  <FaGlobe size={18} />
                </div>
              </label>

              {/* International Card Option */}
              <label 
                className={`flex flex-col sm:flex-row items-center gap-6 rounded-[2rem] border-2 p-6 cursor-pointer transition-all duration-300 ${paymentMethod === 'credit' ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/5 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'}`}
              >
                <input 
                  type="radio" 
                  className="hidden" 
                  name="payment" 
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={() => setPaymentMethod('credit')}
                />
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400">
                  <FaCreditCard size={28} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     <p className="font-black text-slate-900 text-lg">Thẻ tín dụng / Ghi nợ</p>
                     {paymentMethod === 'credit' && <FaCheckCircle className="text-blue-600" />}
                  </div>
                  <p className="text-sm font-medium text-slate-500">Thanh toán trực tiếp qua thẻ quốc tế của bạn.</p>
                </div>
              </label>
            </div>
          </section>
        </main>

        {/* Sidebar Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <div className="overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative">
              <div className="absolute inset-y-0 right-0 w-48 opacity-5">
                <FaPlane className="h-full w-full rotate-45 translate-x-10" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-2 uppercase tracking-widest text-sky-400">Tóm tắt đơn hàng</h3>
                <p className="text-sm font-medium text-slate-400 mb-8 italic">Vui lòng kiểm tra kỹ trước khi thanh toán</p>

                <div className="space-y-5 border-b border-white/10 pb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Giá vé ({passengers} khách)</span>
                    <span className="font-bold text-white tracking-tight">{subtotal.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Hành lý ký gửi</span>
                    <span className="font-bold text-white">+{baggageFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Suất ăn đặc biệt</span>
                    <span className="font-bold text-white">+{mealFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Bảo hiểm du lịch</span>
                    <span className="font-bold text-white">+{insuranceFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Thuế & phí hệ thống</span>
                    <span className="font-bold text-white">{serviceFee.toLocaleString()}₫</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between items-center text-sm text-emerald-400">
                      <span className="font-medium italic">Ưu đãi giảm giá (10%)</span>
                      <span className="font-black">-{discount.toLocaleString()}₫</span>
                    </div>
                  )}
                </div>

                <div className="pt-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tổng cộng</span>
                    <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{total.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl relative overflow-hidden group">
              <div className="flex items-start gap-4 mb-8">
                <div className="mt-1.5 relative">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-6 w-6 rounded-lg border-2 border-slate-200 text-sky-600 focus:ring-sky-500 transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="text-sm font-medium leading-relaxed text-slate-500 cursor-pointer select-none">
                  Tôi đã xác nhận chính xác thông tin hành khách và đồng ý với 
                  <span className="text-slate-900 font-bold hover:text-sky-600 transition ml-1 underline decoration-slate-200 underline-offset-4">Điều khoản & Quy định hành lý</span>.
                </label>
              </div>

              <button
                type="button"
                disabled={isLoading || !acceptedTerms}
                onClick={handleVNPayPayment}
                className={`relative overflow-hidden w-full group py-5 rounded-[1.75rem] text-xl font-black transition-all duration-500 ${isLoading || !acceptedTerms ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 active:scale-95'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Đang kết nối VNPay...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Thanh toán ngay</span>
                    <FaChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                {/* Visual Glow Effect */}
                {!isLoading && acceptedTerms && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <FaLock size={12} className="text-emerald-500" /> Thanh toán bảo mật SSL (AES-256)
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
