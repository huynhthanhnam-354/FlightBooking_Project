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
  FaArrowRight
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
  const [payment, setPayment] = useState('vnpay')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
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

  async function handlePay() {
    if (!validate()) {
      toast.warning('Vui lòng kiểm tra lại thông tin hành khách')
      return
    }

    if (!acceptedTerms) {
      toast.warning('Bạn cần đồng ý điều khoản và điều kiện để tiếp tục.')
      return
    }

    setIsProcessing(true)
    try {
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

      const bookingRes = await bookingApi.create(bookingRequest)
      const bookingId = bookingRes.data.id

      if (payment === 'vnpay') {
        const paymentRes = await paymentApi.createVnPayUrl(bookingId)
        const paymentUrl = paymentRes.data?.paymentUrl

        if (!paymentUrl) {
          throw new Error('Không thể tạo URL thanh toán. Vui lòng thử lại.')
        }

        window.location.href = paymentUrl
      } else {
        setTimeout(() => {
          navigate('/booking/confirmation', { state: { bookingId, status: 'success' } })
          setIsProcessing(false)
        }, 1500)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý thanh toán')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-sky-900 text-white py-8 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hoàn tất đặt vé</h1>
            <p className="mt-2 text-sm text-sky-100 flex flex-wrap items-center gap-2">
              <span className="font-semibold">{flight.originCode}</span>
              <FaArrowRight size={14} />
              <span className="font-semibold">{flight.destinationCode}</span>
              • {flight.airline} • {flight.depart}
            </p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-200 font-semibold">Thời gian giữ chỗ</p>
              <p className="text-2xl font-semibold text-white">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid gap-8 lg:grid-cols-12">
        <main className="lg:col-span-8 space-y-6">
          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-sky-50 p-3 text-sky-600">
                  <FaPlane size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Flight Summary</h2>
                  <p className="text-sm text-slate-500">Xem hành trình và thông tin chuyến bay</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                {passengers} khách • {selectedSeats.length ? `${selectedSeats.length} ghế đã chọn` : 'Chưa chọn ghế'}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Khởi hành</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{flight.depart}</p>
                <p className="mt-2 text-sm text-slate-500">{flight.origin} ({flight.originCode})</p>
              </div>
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Thời gian bay</p>
                <p className="mt-3 text-xl font-bold text-slate-900">{flight.duration}</p>
                <p className="mt-2 text-sm text-sky-600">Bay thẳng</p>
              </div>
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Điểm đến</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{flight.arrive}</p>
                <p className="mt-2 text-sm text-slate-500">{flight.destination} ({flight.destinationCode})</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <FaUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Passenger Information</h2>
                <p className="text-sm text-slate-500">Nhập thông tin hành khách để hoàn tất đặt chỗ.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="passenger-name" className="text-sm font-semibold text-slate-700">Họ và tên</label>
                <input
                  id="passenger-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="NGUYEN VAN A"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby="error-name"
                />
                {errors.name && <p id="error-name" className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="passenger-phone" className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  id="passenger-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="+84 90 123 4567"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby="error-phone"
                />
                {errors.phone && <p id="error-phone" className="text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="passenger-email" className="text-sm font-semibold text-slate-700">Email nhận vé</label>
                <input
                  id="passenger-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                  placeholder="example@gmail.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="error-email"
                />
                {errors.email && <p id="error-email" className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="passenger-id" className="text-sm font-semibold text-slate-700">CMND / CCCD</label>
                <input
                  id="passenger-id"
                  type="text"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  placeholder="0123 456 789"
                />
                <p className="text-xs text-slate-400">Thông tin này giúp xác thực nhanh hơn.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <FaBriefcase size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Extra Services</h2>
                <p className="text-sm text-slate-500">Thêm tiện ích để hành trình thoải mái hơn</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FaBriefcase /> Hành lý ký gửi</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Chọn 1</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {BAGGAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBaggage(opt.id)}
                      className={`rounded-3xl border p-4 text-left transition ${baggage === opt.id ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <p className="font-semibold text-slate-900">{opt.title}</p>
                      <p className="mt-2 text-xs font-semibold text-sky-600">{opt.note}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FaUtensils /> Suất ăn</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Tùy chọn</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {MEAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMeal(opt.id)}
                      className={`rounded-3xl border p-4 text-left transition ${meal === opt.id ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <p className="font-semibold text-slate-900">{opt.title}</p>
                      <p className="mt-2 text-xs text-sky-600">{opt.fee === 0 ? 'Miễn phí' : `+${opt.fee.toLocaleString()}₫`}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-[28px] border p-5 transition ${insurance ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <FaShieldAlt className="text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Bảo hiểm chuyến bay</p>
                        <p className="text-sm text-slate-500 mt-1">Thêm quyền lợi trễ chuyến và mất hành lý.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-sky-600">99.000₫</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Mỗi khách</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInsurance(!insurance)}
                      className={`mt-5 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold transition ${insurance ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {insurance ? 'Đã chọn' : 'Thêm bảo hiểm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <FaPercentage size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Promo Code</h2>
                <p className="text-sm text-slate-500">Áp dụng mã giảm giá để tiết kiệm thêm.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="NHẬP MÃ ƯU ĐÃI"
                className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Áp dụng
              </button>
            </div>
            <p className={`mt-3 text-sm ${promoApplied ? 'text-emerald-600' : 'text-rose-500'}`}>{promoMessage || 'Mã mẫu: SKY25'}</p>
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <FaCreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                <p className="text-sm text-slate-500">Chọn cách thanh toán phù hợp với bạn.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPayment('vnpay')}
                className={`flex items-center gap-4 rounded-[28px] border p-5 text-left transition ${payment === 'vnpay' ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-sky-700 font-black italic">VN</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">VNPAY</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">ATM / QR / VISA</p>
                </div>
                {payment === 'vnpay' && <FaCheckCircle className="text-sky-600" size={20} />}
              </button>

              <button
                type="button"
                onClick={() => setPayment('credit')}
                className={`flex items-center gap-4 rounded-[28px] border p-5 text-left transition ${payment === 'credit' ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-600">
                  <FaCreditCard size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Thẻ quốc tế</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Visa / MasterCard</p>
                </div>
                {payment === 'credit' && <FaCheckCircle className="text-sky-600" size={20} />}
              </button>
            </div>
          </section>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-xl relative">
              <div className="absolute inset-y-0 right-0 w-36 opacity-10">
                <FaPlane className="h-full w-full rotate-45" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold">Order Summary</h3>
                <p className="mt-2 text-sm text-slate-300">Kiểm tra lại tổng chi phí trước khi thanh toán.</p>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Giá vé ({passengers} khách)</span>
                    <span className="font-semibold text-white">{subtotal.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Hành lý ký gửi</span>
                    <span className="font-semibold text-white">+{baggageFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Suất ăn</span>
                    <span className="font-semibold text-white">+{mealFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Bảo hiểm chuyến bay</span>
                    <span className="font-semibold text-white">+{insuranceFee.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Thuế & phí dịch vụ</span>
                    <span className="font-semibold text-white">{serviceFee.toLocaleString()}₫</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-emerald-300">
                      <span>Giảm giá mã</span>
                      <span className="font-semibold">-{discount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between text-base font-bold">
                    <span>Tổng thanh toán</span>
                    <span className="text-3xl text-white">{total.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="terms" className="text-sm leading-6 text-slate-600">
                  Tôi đã đọc và đồng ý với <span className="font-semibold text-slate-900">Điều khoản dịch vụ</span>, <span className="font-semibold text-slate-900">Chính sách bảo mật</span> và <span className="font-semibold text-slate-900">Quy định hành lý</span>.
                </label>
              </div>

              <button
                type="button"
                disabled={isProcessing || !acceptedTerms}
                onClick={handlePay}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-3xl px-6 py-4 text-lg font-black transition ${isProcessing || !acceptedTerms ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-200/30'}`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    Thanh toán ngay <FaChevronRight size={18} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                <FaLock size={12} /> Thanh toán an toàn 256-bit SSL
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-700 shadow-sm">
              <div className="flex items-start gap-3">
                <FaInfoCircle size={20} className="mt-1" />
                <div>
                  <p className="font-semibold">Giá có thể thay đổi</p>
                  <p className="mt-1 text-slate-600">Hoàn tất thanh toán trước khi thời gian giữ chỗ kết thúc để giữ giá tốt nhất.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
