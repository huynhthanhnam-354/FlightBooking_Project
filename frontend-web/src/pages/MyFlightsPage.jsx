import React, { useMemo, useState } from 'react'
import MOCK_BOOKINGS from '../data/mockBookings'
import MyFlightCard from '../components/MyFlightCard'

export default function MyFlightsPage() {
  const [tab, setTab] = useState('upcoming')

  const tabs = [
    { key: 'upcoming', label: 'Sắp khởi hành' },
    { key: 'completed', label: 'Đã hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ]

  const counts = useMemo(() => {
    return MOCK_BOOKINGS.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {})
  }, [])

  const bookings = MOCK_BOOKINGS.filter(b => b.status === tab)

  function handleGetTicket(b) {
    // stub: download or open e-ticket
    alert(`Yêu cầu lấy vé: ${b.pnr}`)
  }

  function handleAIAssist(b) {
    // stub: integrate with chat widget / AI assistant
    alert(`Yêu cầu hỗ trợ AI cho: ${b.pnr}`)
  }

  function handleChangeItinerary(b) {
    alert(`Bắt đầu quy trình đổi hành trình cho: ${b.pnr}`)
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chuyến bay của tôi</h1>
            <p className="text-sm text-slate-500">Xem và quản lý các đặt chỗ của bạn</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex bg-slate-50 p-1 rounded-lg">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab===t.key ? 'bg-white shadow' : 'text-slate-600'}`}>
                {t.label} <span className="ml-2 text-xs text-slate-400">{counts[t.key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(b => (
            <MyFlightCard key={b.id} booking={b} onGetTicket={handleGetTicket} onAIAssist={handleAIAssist} onChange={handleChangeItinerary} />
          ))}

          {bookings.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-12">
              Không có vé trong mục này.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
