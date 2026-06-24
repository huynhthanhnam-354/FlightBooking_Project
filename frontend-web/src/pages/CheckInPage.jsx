import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaClock, FaIdCard, FaPlane, FaQrcode, FaTicketAlt } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getErrorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Bạn cần đăng nhập để check-in booking của mình.'
  }
  return 'Không thể check-in. Vui lòng kiểm tra lại PNR và họ/tên cuối.'
}

export default function CheckInPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const initialCheckIn = location.state || {}
  const [pnr, setPnr] = useState(initialCheckIn.pnr || '')
  const [passengerLastName, setPassengerLastName] = useState(initialCheckIn.passengerLastName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  const flight = booking?.flight || {}
  const boardingCode = useMemo(() => {
    if (!booking) return ''
    return `${booking.pnr || ''}-${flight.flightNumber || ''}-${booking.seatNumber || 'SEAT'}`
  }, [booking, flight.flightNumber])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBooking(null)

    if (!user) {
      setError('Bạn cần đăng nhập trước khi check-in.')
      return
    }

    const cleanPnr = pnr.trim().toUpperCase()
    const cleanName = passengerLastName.trim()
    if (!cleanPnr || !cleanName) {
      setError('Vui lòng nhập đầy đủ PNR và họ/tên cuối của hành khách.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/bookings/check-in', {
        pnr: cleanPnr,
        passengerLastName: cleanName,
      })
      setBooking(data)
      setPnr(cleanPnr)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-600">Online check-in</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Check-in trực tuyến</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Nhập PNR và họ/tên cuối của hành khách để xác nhận check-in. Booking cần được thanh toán trước khi tạo boarding pass.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Mã đặt chỗ PNR
                </label>
                <div className="relative">
                  <FaTicketAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="VD: ABC123"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-mono text-sm font-black uppercase tracking-wider text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Họ/tên cuối hành khách
                </label>
                <div className="relative">
                  <FaIdCard className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={passengerLastName}
                    onChange={(e) => setPassengerLastName(e.target.value)}
                    placeholder="VD: Nguyen hoặc An"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Nhập từ cuối trong tên hành khách đã dùng khi đặt vé.
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-sky-600 px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? 'Đang check-in...' : 'Xác nhận check-in'}
              </button>

              {!user ? (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50"
                >
                  Đăng nhập để check-in
                </button>
              ) : null}
            </form>

            <div className="mt-6 grid gap-3">
              {[
                ['1', 'Chuẩn bị PNR', 'Mã đặt chỗ nằm trong vé hoặc trang Tài khoản.'],
                ['2', 'Đối chiếu tên', 'Tên cuối phải khớp với hành khách trong booking.'],
                ['3', 'Nhận boarding pass', 'Sau khi thành công, lưu thông tin để dùng tại sân bay.'],
              ].map(([step, title, body]) => (
                <div key={step} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {booking ? (
              <div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <FaCheckCircle />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Check-in thành công</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Boarding pass</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700">
                    {booking.status}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">PNR</p>
                      <p className="mt-1 font-mono text-3xl font-black tracking-tight">{booking.pnr}</p>
                    </div>
                  <div className="rounded-2xl bg-white p-4 text-slate-900">
                    <FaQrcode size={72} />
                    <p className="mt-2 max-w-[80px] break-all text-center text-[9px] font-black uppercase leading-3 text-slate-500">
                      {boardingCode}
                    </p>
                  </div>
                  </div>

                  <div className="my-8 flex items-center gap-5">
                    <div>
                      <p className="text-4xl font-black tracking-tight">{flight.departureAirport}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Khởi hành</p>
                    </div>
                    <div className="flex flex-1 items-center gap-3 text-sky-300">
                      <div className="h-px flex-1 bg-white/20" />
                      <FaPlane className="rotate-45" />
                      <div className="h-px flex-1 bg-white/20" />
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tight">{flight.arrivalAirport}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Hạ cánh</p>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                    <Info label="Hành khách" value={booking.passengerName} />
                    <Info label="Ghế" value={booking.seatNumber || 'Chưa chọn'} />
                    <Info label="Chuyến bay" value={`${flight.airline || ''} ${flight.flightNumber || ''}`} />
                    <Info label="Khởi hành" value={formatDateTime(flight.departureAt)} />
                    <Info label="Kênh check-in" value={booking.checkInChannel || 'ONLINE'} />
                    <Info label="Thời gian check-in" value={formatDateTime(booking.checkedInAt)} />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Có mặt tại sân bay đúng giờ. Nếu có hành lý ký gửi, vui lòng đến quầy gửi hành lý trước giờ đóng quầy.
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[440px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                  <FaClock size={26} />
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-900">Chưa có boarding pass</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Điền PNR và họ/tên cuối để hệ thống xác thực booking của bạn. Sau khi check-in thành công, boarding pass sẽ hiển thị tại đây.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/user-dashboard" className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800">
                    Mở vé của tôi
                  </Link>
                  <Link to="/support" className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-white">
                    Cần hỗ trợ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value || '-'}</p>
    </div>
  )
}
