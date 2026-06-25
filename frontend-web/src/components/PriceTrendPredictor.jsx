import React, { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import api from '../services/api'

const formatCurrency = value => value.toLocaleString('vi-VN') + '₫'
const formatYAxis = value => `${(value / 1000000).toFixed(1)}M`

const renderPriceDot = ({ cx, cy }) => (
  <g key={`dot-${cx}-${cy}`}>
    <circle cx={cx} cy={cy} r={4} fill="#2563eb" stroke="#ffffff" strokeWidth={2} />
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
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="rounded-[2.5rem] bg-sky-50/50 p-8 border border-blue-100/50 animate-pulse space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-200 rounded-full w-24" />
          <div className="h-8 bg-slate-200 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-full w-1/2" />
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl w-36" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 h-[350px] bg-slate-100 rounded-[2rem] border border-slate-200/50" />
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="h-28 bg-slate-100 rounded-[2rem]" />
          <div className="h-16 bg-slate-100 rounded-[2rem]" />
          <div className="h-48 bg-slate-100 rounded-[2rem]" />
        </div>
      </div>
    </div>
  )
}

const CACHE_KEY_PREFIX = 'ai_analysis_';
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const getCachedAnalysis = (departure, arrival, date) => {
  const key = `${CACHE_KEY_PREFIX}${departure}_${arrival}_${date}`;
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      return data;
    }
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Error reading cache:", e);
  }
  return null;
};

const setCachedAnalysis = (departure, arrival, date, data) => {
  const key = `${CACHE_KEY_PREFIX}${departure}_${arrival}_${date}`;
  const cacheValue = {
    data,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem(key, JSON.stringify(cacheValue));
  } catch (e) {
    console.warn("Error writing cache:", e);
  }
};

export default function PriceTrendPredictor({ departure, arrival, date }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!departure || !arrival) return

    const targetDate = date || new Date().toISOString().split('T')[0]

    // Check Cache first
    const cachedData = getCachedAnalysis(departure, arrival, targetDate);
    if (cachedData) {
      setAnalysis(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get('/ai/analyze', {
          params: { 
            departure, 
            arrival, 
            date: targetDate
          }
        })
        setAnalysis(response.data)
        setCachedAnalysis(departure, arrival, targetDate, response.data);
      } catch (err) {
        console.error("AI Analysis Fetch Error:", err)
        setError("Không thể kết nối dịch vụ phân tích hành trình AI. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [departure, arrival, date])

  const { currentPrice, minWeek, maxWeek } = useMemo(() => {
    const data = analysis?.sevenDayForecast
    if (!data || data.length === 0) {
      return { currentPrice: 1500000, minWeek: 1500000, maxWeek: 1500000 }
    }
    const prices = data.map(point => point.price)
    const currentPrice = data[0].price
    const minWeek = Math.min(...prices)
    const maxWeek = Math.max(...prices)
    return { currentPrice, minWeek, maxWeek }
  }, [analysis])

  if (!departure || !arrival) return null

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-[2.5rem] bg-rose-50 p-8 border border-rose-100 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-rose-600">{error}</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <section className="rounded-[2.5rem] bg-sky-50 p-8 shadow-sm border border-blue-100/50">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
            ✨ AI Price Intelligence
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter sm:text-4xl">
            Xu hướng giá cho <span className="text-blue-600">{departure} → {arrival}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium text-slate-500 leading-relaxed">
            Hệ thống AI phân tích chặng bay thời gian thực kết hợp điều kiện thời tiết tại điểm đến để đưa ra khuyến nghị đặt vé tối ưu.
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          {analysis?.aiAdvice === 'BUY_NOW' ? (
            <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-emerald-700 shadow-sm">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">
                AI KHUYÊN: ĐẶT NGAY
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3 text-amber-700 shadow-sm">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">
                AI KHUYÊN: THEO DÕI
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Biểu đồ */}
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
              <AreaChart data={analysis?.sevenDayForecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Khung thông tin gợi ý AI */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá hiện tại</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {analysis?.recommendation || "Theo dõi thêm biến động giá vé trước khi đặt"}
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
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Phân tích chi tiết AI</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 tracking-tight">Xu hướng thị trường</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">
                    {analysis?.priceTrend || "Giá vé duy trì trạng thái ổn định."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 tracking-tight">Khuyến nghị thời tiết</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">
                    {analysis?.weatherAdvice || "Không có thông tin thời tiết."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 tracking-tight">Lời khuyên chuyến đi</p>
                  <ul className="mt-2 space-y-2">
                    {analysis?.travelTips && analysis.travelTips.length > 0 ? (
                      analysis.travelTips.map((tip, idx) => (
                        <li key={idx} className="text-xs font-medium text-slate-500 flex items-start gap-1.5 leading-normal">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs font-medium text-slate-500">Nên đến sân bay sớm 2 tiếng.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
