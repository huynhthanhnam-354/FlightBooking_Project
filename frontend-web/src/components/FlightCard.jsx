import React, { useState } from "react";
import { Link } from "react-router-dom";
import AirlineLogo from './AirlineLogo'
import FlightDetailsModal from './FlightDetailsModal'

export default function FlightCard({ flight, onOpenDetails }) {
  const [showDetails, setShowDetails] = useState(false)

  function handleOpenDetails() {
    setShowDetails(true)
    if (onOpenDetails) onOpenDetails(flight)
  }
  const { id, airline, flightNumber, depart, arrive, duration, price, stops = 0 } = flight;
  const priceLabel = typeof price === "number" ? price.toLocaleString() : price;

  const departTime = String(depart).split(' ')[0]
  const arriveTime = String(arrive).split(' ')[0]

  const initials = airline.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase()

  return (
    <>
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <AirlineLogo name={airline} size={56} />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{airline} <span className="text-sm text-slate-500">({flightNumber})</span></div>
              <div className="text-slate-600 mt-1 text-sm">{stops === 0 ? 'Bay thẳng' : `${stops} điểm dừng`}</div>
            </div>
            <div className="hidden md:block text-sm text-slate-500">Economy</div>
          </div>

          <div className="mt-3 flex items-center gap-6">
            <div>
              <div className="text-xl font-semibold">{departTime}</div>
              <div className="text-sm text-slate-500">Khởi hành</div>
            </div>
            <div className="text-sm text-slate-500">→</div>
            <div>
              <div className="text-xl font-semibold">{arriveTime}</div>
              <div className="text-sm text-slate-500">Hạ cánh</div>
            </div>
            <div className="ml-4 text-sm text-slate-500">Thời gian: {duration}</div>
          </div>

          <div className="mt-2 flex gap-2 items-center">
            {flight.amenities?.includes('wifi') && (
              <div className="inline-flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded">
                <span>📶</span>
                <span>Wifi</span>
              </div>
            )}
            {flight.amenities?.includes('meal') && (
              <div className="inline-flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded">
                <span>🍽️</span>
                <span>Suất ăn</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{priceLabel}₫</div>
          <div className="text-sm text-slate-500">Giá mỗi khách</div>
        </div>
        <div className="flex gap-2">
              <button onClick={handleOpenDetails} className="px-3 py-2 border rounded text-slate-700 hover:bg-slate-50">Chi tiết</button>
          <Link to={`/booking?id=${id}`} state={{ flight }} className="px-4 py-2 bg-orange-500 text-white rounded">Chọn chuyến</Link>
        </div>
      </div>
    </div>
      {showDetails && <FlightDetailsModal open={showDetails} flight={flight} onClose={() => setShowDetails(false)} />}
    </>
  );
}
