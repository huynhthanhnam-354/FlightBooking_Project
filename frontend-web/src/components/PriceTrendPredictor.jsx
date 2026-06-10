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

const formatCurrency = value => value.toLocaleString('vi-VN') + '₫'
const formatYAxis = value => `${(value / 1000000).toFixed(1)}M`

const renderPriceDot = ({ cx, cy }) => (
  <g>
    <circle cx={cx} cy={cy} r={6} fill="#2563eb" stroke="#ffffff" strokeWidth={2} />
  </g>
)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dự báo ngày</div>
      <div className="mt-1 text-base font-bold text-slate-900">{point.label}</div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-600" />
        <span className="text-sm font-bold text-blue-600">{formatCurrency(point.price)}</span>
      </div>
      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        {point.insight}
      </div>
    </div>
  )
}

export default function PriceTrendPredictor({ routeLabel = 'Hà Nội → Hồ Chí Minh' }) {
  const { currentPrice, minWeek, maxWeek } = useMemo(
    () => buildSummary(trendData),
    []
  )

  return (
    <section className="rounded-[2.5rem] bg-sky-50 p-8 shadow-sm border border-blue-100/50">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
            ✨ AI Price Intelligence
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter sm:text-4xl">
            Xu hướng giá vé cho <span className="text-blue-600">{routeLabel}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium text-slate-500 leading-relaxed">
            Hệ thống AI phân tích hàng triệu dữ liệu chuyến bay để dự báo biến động giá, giúp bạn chọn thời điểm đặt vé tối ưu nhất.
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-emerald-700 shadow-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">
              AI ADVISES: BUY NOW
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 rounded-[2rem] bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Biểu đồ dự báo 7 ngày</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Dựa trên dữ liệu thị trường thực tế</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-600" />
                 <span className="text-[10px] font-black text-slate-500 uppercase">Giá dự kiến</span>
               </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  tickMargin={15}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                  activeDot={renderPriceDot}
                  dot={renderPriceDot}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Panels */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá hiện tại</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Mức giá tốt nhất để đặt ngay hôm nay
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[2rem] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thấp nhất</p>
              <p className="text-lg font-black text-emerald-600 tracking-tight">{formatCurrency(minWeek)}</p>
            </div>
            <div className="rounded-[2rem] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cao nhất</p>
              <p className="text-lg font-black text-blue-900 tracking-tight">{formatCurrency(maxWeek)}</p>
            </div>
          </div>

          <div className="flex-1 rounded-[2rem] bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Phân tích từ AI</h4>
            <div className="space-y-6">
              {[
                { title: 'Đang trong chu kỳ tăng', color: 'bg-emerald-400', desc: 'AI nhận thấy giá đang bắt đầu xu hướng tăng sau mức đáy.' },
                { title: 'Thời điểm vàng', color: 'bg-blue-400', desc: 'Các chuyến bay vào giữa tuần đang có mức giá ổn định nhất.' },
                { title: 'Độ tin cậy cao', color: 'bg-amber-400', desc: 'Dự báo dựa trên 95% độ chính xác của dữ liệu lịch sử.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.color} shadow-sm`} />
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{item.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
