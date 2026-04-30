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
          return (
            <button key={key} onClick={() => onSelect && onSelect(key)} className={`min-w-[110px] p-3 rounded-lg ${isSel ? 'bg-sky-600 text-white' : 'bg-white'} shadow-sm`}> 
              <div className="text-sm">{it.date.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
              <div className="font-semibold">{fmtDate(it.date)}</div>
              <div className="text-orange-600 font-bold mt-1">{it.price.toLocaleString()}₫</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
