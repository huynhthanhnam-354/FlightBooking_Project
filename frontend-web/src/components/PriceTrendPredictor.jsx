import React, { useMemo } from 'react'

const trendData = [
  { day: 'T2', price: 1890000 },
  { day: 'T3', price: 1830000 },
  { day: 'T4', price: 1800000 },
  { day: 'T5', price: 1815000 },
  { day: 'T6', price: 1860000 },
  { day: 'T7', price: 1910000 },
  { day: 'CN', price: 2050000 },
]

function formatCurrency(value) {
  return value.toLocaleString('vi-VN') + '₫'
}

function buildSvgPath(data) {
  if (!data.length) return ''
  const width = 280
  const height = 120
  const padding = 16
  const max = Math.max(...data.map(item => item.price))
  const min = Math.min(...data.map(item => item.price))
  const range = Math.max(max - min, 1)

  return data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / (data.length - 1)
      const y = padding + ((max - item.price) * (height - padding * 2)) / range
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export default function PriceTrendPredictor({ routeLabel = 'Hà Nội → Hồ Chí Minh' }) {
  const { recommendation, badgeColor, trendLabel, changeText } = useMemo(() => {
    const first = trendData[0].price
    const last = trendData[trendData.length - 1].price
    const diff = last - first
    const changePercent = Math.round((diff / first) * 100)
    const shouldBuy = diff > 0
    if (shouldBuy) {
      return {
        recommendation: `AI khuyên: NÊN MUA NGAY (Giá có xu hướng tăng ${Math.abs(changePercent)}% vào ngày mai)`,
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        trendLabel: 'Giá dự báo tăng',
        changeText: `+${Math.abs(changePercent)}% so với đầu tuần`,
      }
    }
    return {
      recommendation: `AI khuyên: NÊN ĐỢI (Giá có xu hướng giảm nhẹ vào ngày mai)`,
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      trendLabel: 'Giá dự báo giảm',
      changeText: `${Math.abs(changePercent)}% so với đầu tuần`,
    }
  }, [])

  const path = buildSvgPath(trendData)
  const maxPrice = Math.max(...trendData.map(item => item.price))
  const minPrice = Math.min(...trendData.map(item => item.price))

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white shadow-lg p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Price Trend Predictor</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Dự đoán giá vé cho {routeLabel}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">Phân tích hành trình trong 7 ngày tới bằng AI để bạn có thể chọn thời điểm đặt vé tối ưu.</p>
        </div>
        <div className={`rounded-3xl border px-4 py-2 text-sm font-semibold ${badgeColor} border-opacity-90`}>{recommendation}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_0.9fr] items-start">
        <div className="rounded-[28px] border border-slate-200/80 bg-slate-950/95 p-4 text-slate-100 shadow-inner">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
            <span>Xu hướng giá tuần</span>
            <span>{trendLabel}</span>
          </div>
          <div className="mt-4 h-[220px] w-full">
            <svg viewBox="0 0 300 160" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path d={path} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${path} L 284 148 L 16 148 Z`} fill="url(#trendGradient)" opacity="0.8" />
              {trendData.map((item, index) => {
                const x = 16 + (index * 268) / (trendData.length - 1)
                const y = 16 + ((maxPrice - item.price) * 112) / (maxPrice - minPrice || 1)
                return (
                  <g key={item.day}>
                    <circle cx={x} cy={y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={y - 16} textAnchor="middle" className="text-[11px] font-semibold fill-white">{item.price / 1000000}m</text>
                  </g>
                )
              })}
              {trendData.map((item, index) => {
                const x = 16 + (index * 268) / (trendData.length - 1)
                return (
                  <text key={`label-${item.day}`} x={x} y="156" textAnchor="middle" className="text-[11px] fill-slate-400">{item.day}</text>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200/80 bg-slate-50 p-5 shadow-sm">
          <div className="rounded-3xl bg-slate-100 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Giá hiện tại</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(trendData[trendData.length - 1].price)}</div>
            <div className="mt-2 text-sm text-slate-600">Giá thấp nhất tuần: {formatCurrency(minPrice)}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Dự báo ngắn hạn</div>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /> Giá dự kiến: {changeText}
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /> Giá cao nhất tuần: {formatCurrency(maxPrice)}
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-400" /> Dữ liệu giả lập AI cho hành trình này
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
