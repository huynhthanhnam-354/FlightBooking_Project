import React, { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import MOCK_BOOKINGS from '../data/mockBookings'
import { FaPlane, FaHistory, FaUser, FaQrcode, FaClock, FaCheckCircle, FaXmarkCircle, FaCreditCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaChevronRight } from 'react-icons/fa'

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
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={size} height={size} className="border-2 border-slate-200 rounded-lg" />
      <p className="text-xs text-slate-500 font-mono">{value}</p>
    </div>
  )
}

// Ticket Card Component with QR Code
function TicketCard({ booking, onShowQR }) {
  const statusMap = {
    upcoming: { label: 'Sắp khởi hành', color: 'bg-sky-100 text-sky-800', icon: FaClock },
    completed: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800', icon: FaXmarkCircle }
  }

  const s = statusMap[booking.status] || statusMap.upcoming
  const StatusIcon = s.icon

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header with PNR and status */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-100">Mã đặt chỗ (PNR)</p>
          <p className="text-lg font-bold text-white font-mono">{booking.pnr}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${s.color} bg-opacity-90`}>
          <StatusIcon className="text-xs" />
          {s.label}
        </div>
      </div>

      {/* Flight details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{booking.from}</p>
            <p className="text-xs text-slate-500">Khởi hành</p>
          </div>
          <div className="flex flex-col items-center flex-1 px-4">
            <p className="text-xs text-slate-400 mb-1">{booking.airline} {booking.flightNumber}</p>
            <div className="w-full flex items-center gap-2">
              <div className="h-px bg-slate-300 flex-1"></div>
              <FaPlane className="text-slate-400 text-sm" />
              <div className="h-px bg-slate-300 flex-1"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{booking.depart} → {booking.arrive}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{booking.to}</p>
            <p className="text-xs text-slate-500">Hạ cánh</p>
          </div>
        </div>

        {/* Payment status */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <FaCreditCard className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className={`text-sm ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
              {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700">
            {booking.price.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onShowQR(booking)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FaQrcode />
            Hiển thị mã QR vé điện tử
          </button>
        </div>
      </div>
    </div>
  )
}

// QR Code Modal
function QRModal({ booking, onClose }) {
  if (!booking) return null

  const qrValue = `FLIGHT:${booking.pnr}|${booking.flightNumber}|${booking.from}-${booking.to}|${booking.depart}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Mã QR Vé Điện Tử</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <FaXmarkCircle className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-slate-50 p-6 rounded-xl mb-4">
            <QRCodeDisplay value={qrValue} size={200} />
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaPlane className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Chuyến bay</p>
                <p className="font-medium text-slate-800">{booking.flightNumber} • {booking.airline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaMapMarkerAlt className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hành trình</p>
                <p className="font-medium text-slate-800">{booking.from} → {booking.to}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaClock className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Thời gian</p>
                <p className="font-medium text-slate-800">{booking.depart}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <FaQrcode className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Mã đặt chỗ</p>
                <p className="font-medium text-slate-800 font-mono">{booking.pnr}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-800">
                ✈️ Vui lòng hiển thị mã QR này tại quầy check-in hoặc cổng an ninh
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Account Info Section
function AccountSection({ user }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Người dùng',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '+84 90 123 4567',
    address: user?.address || 'TP. Hồ Chí Minh, Việt Nam'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save logic here
    setEditing(false)
    alert('Thông tin đã được cập nhật!')
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaUser className="text-blue-500" />
          Thông tin tài khoản
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaEdit /> Chỉnh sửa
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Họ và tên</p>
              <p className="font-medium text-slate-800">{formData.fullName}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaEnvelope className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-800">{formData.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaPhone className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Số điện thoại</p>
              <p className="font-medium text-slate-800">{formData.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Địa chỉ</p>
              <p className="font-medium text-slate-800">{formData.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// History Table Component
function BookingHistory({ bookings }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaHistory className="text-blue-500" />
          Lịch sử đặt vé
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã PNR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hành trình</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày bay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Giá vé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const statusConfig = {
                upcoming: { label: 'Sắp khởi hành', color: 'text-sky-600 bg-sky-50' },
                completed: { label: 'Đã hoàn thành', color: 'text-green-600 bg-green-50' },
                cancelled: { label: 'Đã hủy', color: 'text-rose-600 bg-rose-50' }
              }
              const sc = statusConfig[booking.status]
              return (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-medium text-slate-700">{booking.pnr}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{booking.from}</span>
                      <FaChevronRight className="text-slate-400 text-xs" />
                      <span className="font-medium text-slate-800">{booking.to}</span>
                    </div>
                    <p className="text-xs text-slate-500">{booking.airline} {booking.flightNumber}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {booking.depart}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    {booking.price.toLocaleString('vi-VN')}₫
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {bookings.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          Không có lịch sử đặt vé nào.
        </div>
      )}
    </div>
  )
}

// Main Dashboard Component
export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [qrBooking, setQrBooking] = useState(null)

  const menuItems = [
    { key: 'upcoming', label: 'Chuyến bay sắp tới', icon: FaPlane, count: MOCK_BOOKINGS.filter(b => b.status === 'upcoming').length },
    { key: 'history', label: 'Lịch sử đặt vé', icon: FaHistory, count: MOCK_BOOKINGS.length },
    { key: 'account', label: 'Thông tin tài khoản', icon: FaUser },
  ]

  const upcomingBookings = useMemo(() => MOCK_BOOKINGS.filter(b => b.status === 'upcoming'), [])
  const allBookings = useMemo(() => MOCK_BOOKINGS, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 z-10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaPlane className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">FlightBook</h2>
                <p className="text-xs text-slate-500">Quản lý tài khoản</p>
              </div>
            </div>

            {/* User Info in Sidebar */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(user?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{user?.name || 'Người dùng'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <FaSignOutAlt />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'upcoming' && 'Chuyến bay sắp tới'}
              {activeTab === 'history' && 'Lịch sử đặt vé'}
              {activeTab === 'account' && 'Thông tin tài khoản'}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'upcoming' && 'Xem và quản lý các chuyến bay sắp tới của bạn'}
              {activeTab === 'history' && 'Xem lại tất cả các chuyến bay đã đặt'}
              {activeTab === 'account' && 'Quản lý thông tin cá nhân của bạn'}
            </p>
          </div>

          {/* Content Area */}
          <div className="max-w-5xl">
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <TicketCard key={booking.id} booking={booking} onShowQR={setQrBooking} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPlane className="text-slate-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Không có chuyến bay sắp tới</h3>
                    <p className="text-slate-500">Bạn chưa có chuyến bay nào sắp khởi hành. Đặt vé ngay!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <BookingHistory bookings={allBookings} />
            )}

            {activeTab === 'account' && (
              <AccountSection user={user} />
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