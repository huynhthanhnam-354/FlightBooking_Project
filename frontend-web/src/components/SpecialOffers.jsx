import React from 'react'
import { Link } from 'react-router-dom'

export default function SpecialOffers({ flights = [] }) {
  const offers = flights
    .slice()
    .sort((a, b) => (a.price || 0) - (b.price || 0))
    .slice(0, 3)

  if (!offers || offers.length === 0) return null

  return (
    <div className="offers-banner">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Ưu đãi đặc biệt</div>
            <div className="text-sm small-note">Chọn nhanh vé ưu đãi — số lượng có hạn</div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-white">
        {offers.map(o => (
          <div key={o.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{o.airline} · {o.flightNumber}</div>
              <div className="text-sm small-note">{o.depart} → {o.arrive} · {o.duration}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-sky-600">{(o.price || 0).toLocaleString()}₫</div>
              <Link to={`/booking?id=${o.id}`} state={{ flight: o }} className="inline-block mt-2 px-3 py-1 rounded bg-sky-600 text-white text-sm">Đặt ngay</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
