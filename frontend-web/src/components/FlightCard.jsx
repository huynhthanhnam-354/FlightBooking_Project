import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AirlineLogo from './AirlineLogo'
import FlightDetailsModal from './FlightDetailsModal'

const formatCurrency = value => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(value)
  }
  return value
}

/**
 * Parses and formats date strings into separate time and date components.
 */
const formatDateTime = (isoString) => {
  if (!isoString) return { time: '--:--', date: '--/--/----' };
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      const parts = String(isoString).split(' ');
      return { time: parts[0] || '--:--', date: parts[1] || '' };
    }
    const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return { time, date };
  } catch (e) {
    return { time: '--:--', date: '--/--/----' };
  }
};

export default function FlightCard({ flight, onOpenDetails }) {
  const [showDetails, setShowDetails] = useState(false)
  const {
    id,
    airline,
    flightNumber,
    depart,
    arrive,
    origin,
    destination,
    duration,
    price,
    stops = 0,
    amenities = [],
  } = flight

  const priceLabel = formatCurrency(price)
  const departInfo = formatDateTime(depart)
  const arriveInfo = formatDateTime(arrive)

  const handleOpenDetails = () => {
    setShowDetails(true)
    if (onOpenDetails) onOpenDetails(flight)
  }

  return (
    <>
      <article className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_-30px_rgba(242,153,74,0.24)]">
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="flex items-center justify-center rounded-3xl bg-slate-100 p-3 shadow-sm">
            <AirlineLogo name={airline} size={52} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{airline}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{flightNumber}</h2>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                {stops === 0 ? 'Bay thẳng' : `${stops} điểm dừng`}
              </span>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                   <span>{departInfo.date}</span>
                   <span>{arriveInfo.date}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start sm:gap-6 text-slate-700">
                  <span className="text-3xl font-semibold tabular-nums">{departInfo.time}</span>
                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <span className="text-lg text-orange-500 opacity-30">──</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 whitespace-nowrap">{duration}</span>
                    <span className="text-lg text-orange-500">──&gt;</span>
                  </div>
                  <span className="text-3xl font-semibold tabular-nums">{arriveInfo.time}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-500">
                <div>
                  <p className="font-semibold text-slate-900">{origin}</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.22em] text-slate-400 mt-0.5">Khởi hành</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-semibold text-slate-900">{destination}</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.22em] text-slate-400 mt-0.5">Hạ cánh</p>
                </div>
              </div>
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.includes('wifi') && (
                  <span className="inline-flex items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    Wifi
                  </span>
                )}
                {amenities.includes('meal') && (
                  <span className="inline-flex items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    Suất ăn
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end justify-between gap-4 text-right">
            <div>
              <p className="text-3xl font-semibold text-[#F2994A]">{priceLabel}₫</p>
              <p className="mt-1 text-sm text-slate-500">Giá mỗi khách</p>
            </div>

            <div className="grid w-full gap-3 sm:w-auto">
              <Link
                to={`/booking/seat?id=${id}`}
                state={{ flight }}
                className="inline-flex items-center justify-center rounded-3xl bg-[#F2994A] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-24px_rgba(242,153,74,0.8)] transition hover:bg-orange-600"
              >
                Chọn chuyến
              </Link>
              <button
                type="button"
                onClick={handleOpenDetails}
                className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </article>

      {showDetails && (
        <FlightDetailsModal open={showDetails} flight={flight} onClose={() => setShowDetails(false)} />
      )}
    </>
  )
}
