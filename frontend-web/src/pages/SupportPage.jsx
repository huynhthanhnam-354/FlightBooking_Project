import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaCommentAlt,
  FaEnvelope,
  FaExclamationCircle,
  FaPaperPlane,
  FaPlane,
  FaQuestionCircle,
  FaSearch,
  FaSuitcase,
  FaSyncAlt,
  FaUser,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import api, { bookingApi } from '../services/api'

const supportCategories = [
  { id: 'change', label: 'Đổi lịch bay', icon: FaPlane, hint: 'Đổi ngày bay, giờ bay hoặc hành trình.' },
  { id: 'refund', label: 'Hoàn hoặc hủy vé', icon: FaSyncAlt, hint: 'Gửi yêu cầu hủy vé, hoàn tiền và theo dõi xử lý.' },
  { id: 'payment', label: 'Thanh toán', icon: FaQuestionCircle, hint: 'Lỗi thanh toán, hóa đơn và xác nhận giao dịch.' },
  { id: 'baggage', label: 'Hành lý', icon: FaSuitcase, hint: 'Mua thêm hành lý, quy định hành lý và thất lạc.' },
  { id: 'general', label: 'Hỗ trợ chung', icon: FaCommentAlt, hint: 'Các câu hỏi khác cần nhân viên hỗ trợ.' },
]

const popularTopics = [
  'Làm thế nào để đổi lịch chuyến bay?',
  'Điều kiện hủy vé và hoàn tiền như thế nào?',
  'Tôi chưa nhận được xác nhận thanh toán?',
  'Quy định hành lý ký gửi và xách tay?',
  'Cần cập nhật thông tin hành khách thì làm sao?',
]

const statusMeta = {
  OPEN: { label: 'Mới', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: FaClock },
  IN_PROGRESS: { label: 'Đang xử lý', className: 'border-sky-200 bg-sky-50 text-sky-700', icon: FaSyncAlt },
  RESOLVED: { label: 'Đã xử lý', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: FaCheckCircle },
  CLOSED: { label: 'Đã đóng', className: 'border-slate-200 bg-slate-50 text-slate-600', icon: FaCheckCircle },
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || { label: status || 'Đang xử lý', className: 'border-slate-200 bg-slate-50 text-slate-600', icon: FaClock }
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${meta.className}`}>
      <Icon size={10} />
      {meta.label}
    </span>
  )
}

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getFlight(booking) {
  return booking?.flight || booking?.flightResponse || {}
}

export default function SupportPage() {
  const { user } = useAuth()
  const formRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('refund')
  const [selectedPnr, setSelectedPnr] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedCategoryInfo = useMemo(
    () => supportCategories.find((category) => category.id === selectedCategory) || supportCategories[0],
    [selectedCategory],
  )

  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return popularTopics
    return popularTopics.filter((topic) => topic.toLowerCase().includes(query))
  }, [searchQuery])

  const loadSupportData = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [bookingRes, ticketRes] = await Promise.all([
        bookingApi.getMine(),
        api.get('/support-tickets/me'),
      ])
      const nextBookings = Array.isArray(bookingRes.data) ? bookingRes.data : []
      setBookings(nextBookings)
      setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : [])
      setSelectedPnr((current) => current || nextBookings[0]?.pnr || '')
    } catch (err) {
      console.error('Load support data error:', err)
      setError(err.response?.data?.message || 'Không thể tải dữ liệu hỗ trợ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSupportData()
  }, [user])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleTopicClick = (topic) => {
    setMessage(topic)
    scrollToForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) {
      setError('Bạn cần đăng nhập để gửi yêu cầu hỗ trợ.')
      return
    }
    if (!message.trim()) {
      setError('Vui lòng nhập nội dung cần hỗ trợ.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        category: selectedCategory,
        pnr: selectedPnr || null,
        message: message.trim(),
      }
      const { data } = await api.post('/support-tickets', payload)
      setTickets((current) => [data, ...current])
      setMessage('')
      setSuccess(`Đã gửi yêu cầu ${data?.code ? `#${data.code}` : ''}. Bộ phận hỗ trợ sẽ phản hồi trong mục này.`)
    } catch (err) {
      console.error('Create support ticket error:', err)
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section className="relative w-full bg-gradient-to-r from-blue-600 to-sky-500 px-6 pb-28 pt-20">
        <div className="mx-auto mb-10 max-w-4xl text-center text-white">
          <h1 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">
            Trung tâm hỗ trợ Flight Booking
          </h1>
          <p className="text-lg font-medium text-blue-50 opacity-90">
            Tra cứu câu hỏi thường gặp hoặc gửi ticket trực tiếp đến bộ phận chăm sóc khách hàng.
          </p>
        </div>

        <div className="absolute -bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-6">
          <div className="group relative">
            <FaSearch
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nhập vấn đề cần giúp đỡ: hoàn tiền, đổi lịch, hành lý..."
              className="w-full rounded-2xl border-none bg-white py-5 pl-14 pr-6 font-medium text-slate-700 shadow-2xl outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto mb-20 mt-20 max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="space-y-8 md:col-span-5 lg:col-span-4">
            <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-50 px-8 py-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">Chủ đề phổ biến</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    className="group flex w-full items-center justify-between px-8 py-5 text-left transition-all hover:bg-blue-50"
                  >
                    <span className="pr-4 text-sm font-bold text-slate-700 transition-colors group-hover:text-blue-600">
                      {topic}
                    </span>
                    <FaChevronRight size={14} className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-blue-600 p-8 text-white shadow-xl shadow-blue-600/20">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <FaCommentAlt className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Cần nhân viên hỗ trợ?</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-blue-100">
                    Gửi ticket kèm mã PNR để admin xử lý đúng booking của bạn.
                  </p>
                </div>
              </div>
              <button
                onClick={scrollToForm}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-50 active:scale-95"
              >
                Gửi yêu cầu hỗ trợ <FaArrowRight size={12} />
              </button>
            </section>
          </div>

          <div className="space-y-8 md:col-span-7 lg:col-span-8">
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900">Chọn loại vấn đề</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Web dùng cùng API support với mobile-app: tạo ticket, gắn PNR và chờ admin phản hồi.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {supportCategories.map((category) => {
                  const Icon = category.icon
                  const active = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        scrollToForm()
                      }}
                      className={`min-h-36 rounded-[2rem] border p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                        active ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-sky-600'}`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">{category.label}</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{category.hint}</p>
                    </button>
                  )
                })}
              </div>
            </section>

            <section ref={formRef} className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">Support ticket</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Gửi yêu cầu hỗ trợ</h2>
                </div>
                {user ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
                    <FaUser className="text-sky-500" /> {user?.fullName || user?.email || 'Tài khoản của bạn'}
                  </span>
                ) : (
                  <Link to="/login" className="rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
                    Đăng nhập để gửi ticket
                  </Link>
                )}
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                  <FaExclamationCircle className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                  <FaCheckCircle className="mt-0.5 shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Loại yêu cầu</span>
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white"
                    >
                      {supportCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đặt chỗ PNR</span>
                    <select
                      value={selectedPnr}
                      onChange={(event) => setSelectedPnr(event.target.value)}
                      disabled={!user || loading}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Không gắn booking</option>
                      {bookings.map((booking) => {
                        const flight = getFlight(booking)
                        return (
                          <option key={booking.id || booking.pnr} value={booking.pnr || ''}>
                            {booking.pnr} - {flight.departureAirport || '?'} đến {flight.arrivalAirport || '?'}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-medium text-sky-800">
                  <b>{selectedCategoryInfo.label}:</b> {selectedCategoryInfo.hint}
                </div>

                <label className="space-y-2">
                  <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung cần hỗ trợ</span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    maxLength={1200}
                    placeholder="Mô tả vấn đề của bạn. Ví dụ: tôi muốn hủy vé PNR ABC123 vì thay đổi lịch trình..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold text-slate-400">
                    {message.length}/1200 ký tự
                  </p>
                  <button
                    type="submit"
                    disabled={!user || submitting}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'} <FaPaperPlane size={13} />
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Lich su ho tro</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Yêu cầu đã gửi</h2>
                </div>
                <button
                  onClick={loadSupportData}
                  disabled={!user || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Tải lại
                </button>
              </div>

              {!user ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <FaEnvelope size={34} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-bold text-slate-600">Đăng nhập để xem và gửi yêu cầu hỗ trợ của bạn.</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <FaCommentAlt size={34} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-bold text-slate-600">Bạn chưa có ticket hỗ trợ nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <article key={ticket.id || ticket.code} className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-black text-sky-700">#{ticket.code || ticket.id}</span>
                          <StatusBadge status={ticket.status} />
                          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {(supportCategories.find((category) => category.id === ticket.category)?.label) || 'Hỗ trợ chung'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{formatDateTime(ticket.updatedAt || ticket.createdAt)}</span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng gửi</p>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{ticket.message}</p>
                          {ticket.pnr && (
                            <p className="mt-3 text-xs font-black uppercase tracking-wider text-sky-700">PNR: {ticket.pnr}</p>
                          )}
                        </div>
                        <div className="rounded-2xl border border-white bg-white p-5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phản hồi admin</p>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                            {ticket.adminReply || ticket.workflow?.suggestedReply || 'Đang chờ nhân viên hỗ trợ phản hồi.'}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
