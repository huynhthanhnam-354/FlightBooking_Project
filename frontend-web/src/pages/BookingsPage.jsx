import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fb_bookings') || '[]')
      setBookings(stored)
    } catch (e) {
      console.error(e)
      setBookings([])
    }
  }, [])

  if (!bookings || bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-semibold mb-4">Lịch sử đặt vé</h2>
        <p>Hiện chưa có đơn đặt vé nào.</p>
        <div className="mt-4">
          <button onClick={() => navigate('/search')} className="px-4 py-2 bg-sky-600 text-white rounded">Tìm chuyến</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Lịch sử đặt vé</h2>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.ref} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{new Date(b.createdAt).toLocaleString()}</div>
              <div className="text-lg font-semibold">{b.flight?.airline} · {b.flight?.flightNumber}</div>
              <div className="text-sm">Hành khách: {b.passenger?.name || '—'} · Số: {b.passengers}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-2">Tổng: {b.priceBreakdown?.total?.toLocaleString() || '-'}₫</div>
              <Link to="/booking/confirmation" state={{ confirmation: b }} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">Xem chi tiết</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
