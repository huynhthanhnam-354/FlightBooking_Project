import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const trendData = [
  { label: '10/06', price: 1800000, insight: 'Early price drop' },
  { label: '11/06', price: 1845000, insight: 'Steady demand' },
  { label: '12/06', price: 1790000, insight: 'Lowest point' },
  { label: '13/06', price: 1825000, insight: 'AI signals buy' },
  { label: '14/06', price: 1880000, insight: 'Demand rising' },
  { label: '15/06', price: 1925000, insight: 'Late-week surge' },
  { label: '16/06', price: 1980000, insight: 'Peak booking price' },
]

const buildSummary = data => {
  const prices = data.map(point => point.price)
  const currentPrice = data[data.length - 1].price
  const minWeek = Math.min(...prices)
  const maxWeek = Math.max(...prices)
  const forecastChange = (((currentPrice - minWeek) / minWeek) * 100).toFixed(1)

  return {
    currentPrice,
    minWeek,
    maxWeek,
    forecastChange,
  }
}

const summary = buildSummary(trendData)

const formatCurrency = value => value.toLocaleString('vi-VN') + '₫'
const formatYAxis = value => `${(value / 1000000).toFixed(1)}M`

const renderPriceDot = ({ cx, cy, stroke, payload }) => (
  <g>
    <circle cx={cx} cy={cy} r={7} fill="#1E90FF" stroke="#0F172A" strokeWidth={3} />
    <circle cx={cx} cy={cy} r={3} fill="#ffffff" />
  </g>
)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-3 text-sm text-slate-100 shadow-xl shadow-slate-950/20">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Ngày</div>
      <div className="mt-2 text-lg font-semibold text-white">{point.label}</div>
      <div className="mt-1 text-slate-400">Giá dự kiến: {formatCurrency(point.price)}</div>
      <div className="mt-3 text-slate-300">{point.insight}</div>
    </div>
  )
}

export default function PriceTrendPredictor({ routeLabel = 'Hà Nội → Hồ Chí Minh' }) {
  const { currentPrice, minWeek, maxWeek, forecastChange } = useMemo(
    () => buildSummary(trendData),
    []
  )

  return (
    <section className="rounded-[32px] bg-[#1A2B3D] p-6 shadow-[0_36px_64px_-40px_rgba(10,25,47,0.8)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Price Trend Predictor</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Giá vé AI dự báo cho {routeLabel}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Tính toán dựa trên hành vi đặt chỗ, xu hướng giá và sự thay đổi cung cầu để xác định thời điểm đặt vé đáng tin cậy nhất.
          </p>
        </div>

        <div className="relative inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.9)] md:ml-4">
          <span className="animate-pulse rounded-full bg-cyan-400 px-2 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950 shadow-sm">
            AI Advises: BUY NOW
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-[28px] bg-slate-950/95 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Xu hướng giá</p>
              <p className="mt-2 text-sm text-slate-400">Biểu đồ giá vùng dự báo cho 7 ngày tiếp theo</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              Trusted AI signal
            </div>
          </div>

          <div className="mt-6 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E90FF" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#1E90FF" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  tickMargin={12}
                />
                <YAxis
                  width={64}
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#60a5fa', strokeWidth: 2, opacity: 0.18 }} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#1E90FF"
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  activeDot={renderPriceDot}
                  dot={renderPriceDot}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-700/80 bg-slate-900/95 p-6 text-slate-100 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.9)]">
          <div className="space-y-5">
            <div className="rounded-[24px] bg-slate-950/90 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Current Price</div>
              <div className="mt-3 text-3xl font-semibold text-white">{formatCurrency(currentPrice)}</div>
              <div className="mt-2 text-sm text-slate-400">So với mức thấp nhất trong tuần</div>
            </div>

            <div className="grid gap-4 rounded-[24px] bg-slate-950/90 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Minimum of the Week</p>
                  <p className="mt-1 text-sm text-slate-400">{formatCurrency(minWeek)}</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  Optimal point
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Peak range</p>
                  <p className="mt-1 text-sm text-slate-400">{formatCurrency(maxWeek)}</p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Demand surge
                </span>
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-950/90 p-5 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Short-term Forecast</div>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Momentum is positive</p>
                    <p className="text-slate-400">AI sees a rising trend after the weekly low.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
                  <div>
                    <p className="font-semibold text-white">Best booking window</p>
                    <p className="text-slate-400">Prices are strongest around 16/06 with higher demand.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div>
                    <p className="font-semibold text-white">Confidence</p>
                    <p className="text-slate-400">Short-term forecast is high-confidence based on AI scoring.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
