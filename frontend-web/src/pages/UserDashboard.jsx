import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { bookingApi } from '../services/api'
import { FaPlane, FaHistory, FaUser, FaQrcode, FaClock, FaCheckCircle, FaTimesCircle, FaCreditCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaChevronRight, FaShieldAlt, FaLock, FaCircle, FaArrowRight, FaHome } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

// QR Code component using canvas (no external dependency needed)
function QRCodeDisplay({ value, size = 150 }) {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const moduleCount = 25 // 25x25 modules for QR code
    const cellSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Simple QR-like pattern (for demo purposes - in production use a proper QR library)
    ctx.fillStyle = '#000000'

    // Position detection patterns (corners)
    const drawFinderPattern = (x, y) => {
      // Outer black square
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize)
      // Inner white square
      ctx.fillStyle = '#ffffff'
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize)
      // Center black square
      ctx.fillStyle = '#000000'
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinderPattern(0, 0)
    drawFinderPattern(moduleCount - 7, 0)
    drawFinderPattern(0, moduleCount - 7)

    // Generate pseudo-random pattern based on value
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 8)) {
          continue
        }
        // Generate pattern based on hash
        if (((row * col + hash) % 3) === 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [value, size])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <canvas ref={canvasRef} width={size} height={size} className="border-2 border-slate-100 rounded-2xl shadow-inner bg-white p-2" />
      <p className="text-[10px] text-slate-400 font-black font-mono tracking-widest uppercase">{value}</p>
    </div>
  )
}

// Ticket Card Component with QR Code
function TicketCard({ booking, onShowQR }) {
  const statusMap = {
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-emerald-50 text-emerald-700', icon: FaCheckCircle },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-amber-50 text-amber-700', icon: FaClock },
    CHECKED_IN: { label: 'Đã Check-in', color: 'bg-sky-50 text-sky-700', icon: FaCheckCircle },
    COMPLETED: { label: 'Đã hoàn thành', color: 'bg-slate-100 text-slate-700', icon: FaCheckCircle },
    CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700', icon: FaTimesCircle }
  }

  const f = booking?.flight || booking?.flightResponse || {};
  const s = statusMap[booking?.status || ''] || { label: booking?.status || '', color: 'bg-slate-50 text-slate-700', icon: FaCircle }
  const StatusIcon = s.icon || FaCircle

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header with PNR and status */}
      <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-b border-slate-100">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã đặt chỗ</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-sky-900 font-mono tracking-tighter uppercase">{booking?.pnr || ''}</p>
            {(booking?.comboId || booking?.sourceChannel === 'COMBO') && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm shadow-blue-500/10">
                Combo
              </span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.color || ''}`}>
          <StatusIcon size={10} />
          {s.label || ''}
        </div>
      </div>

      {/* Flight details */}
      <div className="p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="text-left">
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{f?.departureAirport || ''}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Khởi hành</p>
          </div>
          
          <div className="flex flex-col items-center flex-1 px-8 opacity-40">
            <div className="w-full flex items-center gap-4 mb-2">
              <div className="h-px bg-slate-400 flex-1"></div>
              <FaPlane className="text-slate-900 rotate-45" size={14} />
              <div className="h-px bg-slate-400 flex-1"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">{f?.airline || ''} • {f?.flightNumber || ''}</p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{f?.arrivalAirport || ''}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hạ cánh</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian khởi hành</p>
                <p className="text-sm font-bold text-slate-700">{f?.departureAt ? new Date(f?.departureAt).toLocaleString('vi-VN') : ''}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tên hành khách</p>
                <p className="text-sm font-bold text-slate-700">{booking?.passengerName || ''}</p>
            </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
           <div className="flex items-end gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng:</span>
              <span className="text-2xl font-black text-sky-900">{booking?.totalPriceVnd?.toLocaleString('vi-VN') || 0}₫</span>
           </div>
          <button
            onClick={() => onShowQR?.(booking)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center gap-3 shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <FaQrcode size={16} /> Vé điện tử
          </button>
        </div>
      </div>
    </div>
  )
}

// History Table Component
function BookingHistory({ bookings, onCancelBooking }) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <FaHistory className="text-sky-500" size={20} />
          Toàn bộ lịch sử đặt chỗ
        </h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">{bookings?.length || 0} Giao dịch</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-left">
              <th className="px-10 py-6">Mã PNR</th>
              <th className="px-6 py-6">Hành trình</th>
              <th className="px-6 py-6">Ngày đặt</th>
              <th className="px-6 py-6 text-center">Trạng thái</th>
              <th className="px-10 py-6 text-right">Tổng tiền</th>
              <th className="px-10 py-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings?.map((booking) => {
              const f = booking?.flight || booking?.flightResponse || {};
              const statusConfig = {
                CONFIRMED: { label: 'Đã xác nhận', color: 'text-emerald-600 bg-emerald-50' },
                PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-amber-600 bg-amber-50' },
                CANCELLED: { label: 'Đã hủy', color: 'text-rose-600 bg-rose-50' },
                COMPLETED: { label: 'Hoàn thành', color: 'text-slate-600 bg-slate-50' },
                REFUND_PENDING: { label: 'Chờ hoàn tiền', color: 'text-amber-600 bg-amber-50' }
              }
              const sc = statusConfig[booking?.status || ''] || { label: booking?.status || '', color: 'text-slate-600 bg-slate-50' }
              
              const departureTime = f?.departureAt ? new Date(f.departureAt) : null;
              const now = new Date();
              const hoursUntilDeparture = departureTime ? (departureTime - now) / (1000 * 60 * 60) : 0;
              const isConfirmed = booking?.status === 'CONFIRMED';
              const canCancel = isConfirmed && hoursUntilDeparture >= 24;
              const showCannotCancelOnline = isConfirmed && hoursUntilDeparture < 24;

              return (
                <tr key={booking?.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="font-mono font-black text-sky-900 group-hover:text-sky-600 transition-colors uppercase tracking-tight">#{booking?.pnr || ''}</span>
                      {(booking?.comboId || booking?.sourceChannel === 'COMBO') && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm shadow-blue-500/10">
                          Combo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{f?.departureAirport || ''}</span>
                      <FaArrowRight className="text-slate-300" size={10} />
                      <span className="font-bold text-slate-800">{f?.arrivalAirport || ''}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{f?.airline || ''}</p>
                  </td>
                  <td className="px-6 py-8 text-sm font-medium text-slate-600">
                    {booking?.createdAt ? new Date(booking?.createdAt).toLocaleDateString('vi-VN') : ''}
                  </td>
                  <td className="px-6 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${sc.color || ''}`}>
                      {sc.label || ''}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-slate-900 text-lg tracking-tighter">
                    {booking?.totalPriceVnd?.toLocaleString('vi-VN') || 0}₫
                  </td>
                  <td className="px-10 py-8 text-center">
                    {canCancel ? (
                      <button
                        onClick={() => onCancelBooking?.(booking?.id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition active:scale-95 border border-rose-200"
                      >
                        Hủy chuyến
                      </button>
                    ) : showCannotCancelOnline ? (
                      <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Không thể hủy trực tuyến
                      </span>
                    ) : booking?.status === 'CANCELLED' ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold border border-slate-200 cursor-not-allowed"
                      >
                        Đã hủy
                      </button>
                    ) : booking?.status === 'REFUND_PENDING' ? (
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-200">
                        Đang chờ hoàn tiền
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(!bookings || bookings?.length === 0) && (
        <div className="p-32 text-center text-slate-400">
          <FaHistory size={64} className="mx-auto mb-6 opacity-5" />
          <p className="font-black uppercase tracking-[0.3em] text-[10px]">Chưa có dữ liệu giao dịch</p>
        </div>
      )}
    </div>
  )
}

// QR Code Modal
function QRModal({ booking, onClose }) {
  if (!booking) return null
  const f = booking?.flight || booking?.flightResponse || {};
  const qrValue = `FLIGHT:${booking?.pnr || ''}|${f?.flightNumber || ''}|${f?.departureAirport || ''}-${f?.arrivalAirport || ''}`

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-10 text-center border-b border-slate-50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Vé Điện Tử</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vui lòng quét tại quầy thủ tục</p>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div className="mb-10">
            <QRCodeDisplay value={qrValue} size={220} />
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-600 border border-slate-100">
                <FaPlane size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Chuyến bay</p>
                <p className="font-bold text-slate-800 truncate">{f?.airline || ''} • {f?.flightNumber || ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100">
                <FaMapMarkerAlt size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hành trình</p>
                <p className="font-bold text-slate-800">{f?.departureAirport || ''} → {f?.arrivalAirport || ''}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95"
          >
             Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

// Security Section Component
function SecuritySection() {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-slate-100">
      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
        <FaShieldAlt className="text-sky-500" size={20} />
        Bảo mật tài khoản
      </h3>

      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-amber-500">
            <FaLock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mật khẩu truy cập</p>
            <p className="font-bold text-slate-700 tracking-widest">••••••••••••</p>
          </div>
        </div>
        <button 
          className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          Thay đổi
        </button>
      </div>
    </div>
  )
}

// Account Info Section
function AccountSection({ user }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setEditing(false)
    toast.info('Tính năng cập nhật hồ sơ đang được hoàn thiện.')
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-slate-100">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <FaUser className="text-sky-500" size={20} />
          Thông tin cá nhân
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50 rounded-xl transition-all border border-sky-100"
          >
            <FaEdit /> Chỉnh sửa
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input
                    type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-sky-500 focus:bg-white outline-none transition-all"
                />
            </div>
            <div className="space-y-2 opacity-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Không thể đổi)</label>
                <input
                    type="email" value={formData.email} disabled
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none cursor-not-allowed"
                />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-sky-600 transition-all active:scale-95">Lưu thay đổi</button>
            <button type="button" onClick={() => setEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Hủy</button>
          </div>
        </form>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-sky-600">
              <FaUser size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Họ và tên</p>
              <p className="font-bold text-slate-800">{formData.fullName || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-emerald-600">
              <FaEnvelope size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ Email</p>
              <p className="font-bold text-slate-800">{formData.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Dashboard Component
export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [qrBooking, setQrBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getMine()
        setBookings(res?.data || [])
      } catch (err) {
        console.error("Fetch history error:", err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("Unauthorized/Forbidden access to bookings, logging and clearing list.")
        }
        toast.error("Không thể tải lịch sử đặt vé.")
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchBookings()
    else navigate('/login')
  }, [user, navigate])

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt("Vui lòng nhập lý do hủy chuyến bay (bắt buộc):");
    if (reason === null) {
      return; // User clicked Cancel
    }
    if (!reason.trim()) {
      toast.error("Lý do hủy chuyến bay không được để trống.");
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/cancel`, { reason });
      setBookings(prev => (prev || []).map(b => b?.id === bookingId ? { ...b, status: 'REFUND_PENDING', seatNumber: null } : b))
      toast.success("Yêu cầu hủy chuyến và hoàn tiền đã được gửi thành công.");
    } catch (err) {
      console.error("Cancel booking error:", err)
      const msg = err.response?.data?.message || "Không thể hủy chuyến bay."
      toast.error(msg)
    }
  }

  const upcomingBookings = useMemo(() => 
    (bookings || []).filter(b => b?.status === 'CONFIRMED' || b?.status === 'PENDING_PAYMENT' || b?.status === 'CHECKED_IN'), 
    [bookings]
  )

  const menuItems = [
    { key: 'upcoming', label: 'Chuyến bay sắp tới', icon: FaPlane, count: upcomingBookings?.length || 0 },
    { key: 'history', label: 'Lịch sử hành trình', icon: FaHistory, count: bookings?.length || 0 },
    { key: 'account', label: 'Hồ sơ cá nhân', icon: FaUser },
  ]

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-2xl shadow-slate-200/50 min-h-screen fixed left-0 top-0 z-50 border-r border-slate-100">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                <FaPlane className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-900 tracking-tighter">FlightBook</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Panel</p>
              </div>
            </div>

            {/* User Info in Sidebar */}
            <div className="mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-sky-600/30 border-4 border-white">
                  {(user?.fullName || 'H')[0].toUpperCase()}
                </div>
                <div className="w-full">
                  <p className="font-black text-slate-900 truncate mb-1 leading-tight">{user?.fullName || 'Hành khách'}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate tracking-wider uppercase">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-3">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={isActive ? 'text-sky-400' : 'text-slate-300'} size={18} />
                      <span className="font-black text-sm tracking-tight">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
              
              <div className="pt-10 mt-10 border-t border-slate-100">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-rose-500 font-black text-sm hover:bg-rose-50 transition-all active:scale-95"
                >
                   <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-72 flex-1 p-16">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase tracking-widest">
              {activeTab === 'upcoming' && 'Chuyến bay sắp tới'}
              {activeTab === 'history' && 'Lịch sử hành trình'}
              {activeTab === 'account' && 'Hồ sơ cá nhân'}
            </h1>
            <div className="flex items-center gap-4 mt-4">
                <div className="h-1.5 w-12 bg-sky-500 rounded-full"></div>
                <p className="text-slate-500 font-medium italic">
                {activeTab === 'upcoming' && 'Theo dõi và quản lý các chuyến bay đang chờ khởi hành'}
                {activeTab === 'history' && 'Xem lại tất cả dấu ấn hành trình của bạn'}
                {activeTab === 'account' && 'Quản lý thông tin định danh và bảo mật tài khoản'}
                </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-5xl">
            {activeTab === 'upcoming' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(upcomingBookings?.length || 0) > 0 ? (
                  upcomingBookings?.map(booking => (
                    <TicketCard key={booking?.id} booking={booking} onShowQR={setQrBooking} />
                  ))
                ) : (
                  <div className="bg-white rounded-[3rem] shadow-sm p-24 text-center border border-slate-100">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                      <FaPlane size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Bầu trời đang chờ đón bạn</h3>
                    <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto">Bạn chưa có chuyến bay nào sắp tới. Hãy bắt đầu hành trình mới ngay!</p>
                    <button onClick={() => navigate('/')} className="px-12 py-4 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-600/30 hover:bg-sky-700 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <FaHome /> Tìm chuyến bay
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BookingHistory bookings={bookings} onCancelBooking={handleCancelBooking} />
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AccountSection user={user} />
                <SecuritySection />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {qrBooking && (
        <QRModal booking={qrBooking} onClose={() => setQrBooking(null)} />
      )}
    </div>
  )
}