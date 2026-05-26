import React, { useMemo } from 'react'

function fmtDate(d) {
  return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

export default function DatePriceSlider({ days = 7, flights = [], selectedDate, onSelect }) {
  const basePrice = useMemo(() => {
    if (!flights || flights.length === 0) return 1200000
    return Math.min(...flights.map(f => Number(f.price) || 0))
  }, [flights])

  const today = new Date()
  const half = Math.floor(days / 2)
  const items = []
  for (let i = -half; i <= half; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    // deterministic pseudo price around base
    const price = Math.max(300000, Math.round(basePrice + (i * 40000)))
    items.push({ date: d, price })
  }

  return (
    <div className="overflow-x-auto py-3">
      <div className="flex gap-3 items-center w-max">
        {items.map(it => {
          const key = it.date.toISOString().slice(0,10)
          const isSel = selectedDate === key
          const displayPrice = flights && flights.length ? `${it.price.toLocaleString()}₫` : 'N/A'
          return (
            <button
              key={key}
              onClick={() => onSelect && onSelect(key)}
              className={`min-w-[120px] rounded-3xl border px-4 py-4 text-left shadow-sm transition ${isSel ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">{it.date.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
              <div className="font-semibold text-base mb-2">{fmtDate(it.date)}</div>
              <div className={`text-sm font-semibold ${flights && flights.length ? 'text-orange-600' : 'text-slate-400'}`}>
                {displayPrice}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
