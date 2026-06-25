import React, { useState, useEffect, useMemo } from 'react'
import { AiOutlineCloud, AiOutlineBarChart, AiOutlineGift } from 'react-icons/ai'
import { FiRefreshCcw } from 'react-icons/fi'
import api from '../services/api'

const insightItems = [
  {
    id: 'weather',
    title: 'Dự báo thời tiết',
    icon: AiOutlineCloud,
  },
  {
    id: 'price',
    title: 'Xu hướng giá vé',
    icon: AiOutlineBarChart,
  },
  {
    id: 'tips',
    title: 'Lời khuyên du lịch',
    icon: AiOutlineGift,
  },
]

export default function AIInsightsWidget({ searchContext }) {
  const [activeInsight, setActiveInsight] = useState('weather')
  const [loading, setLoading] = useState(false)
  const [aiData, setAiData] = useState(null)
  const [error, setError] = useState(null)

  const destination = useMemo(() => {
    if (!searchContext?.to) return 'điểm đến của bạn'
    return searchContext.to.split(' (')[0]
  }, [searchContext])

  const fetchAiSuggestions = async () => {
    if (!searchContext?.from || !searchContext?.to || !searchContext?.departDate) {
      setAiData(null)
      return
    }

    const origin = searchContext.from.split(' (')[0]
    const destinationCity = searchContext.to.split(' (')[0]
    const departureDate = searchContext.departDate
    const passengerCount = (searchContext.passengers?.adults || 1) + (searchContext.passengers?.children || 0)

    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/travel-suggestions', {
        origin,
        destination: destinationCity,
        departureDate,
        passengers: passengerCount
      })
      setAiData(res.data)
    } catch (err) {
      console.error("Error fetching AI suggestions:", err)
      setError("Không thể kết nối với dịch vụ AI lúc này. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAiSuggestions()
  }, [searchContext])

  const details = useMemo(() => {
    if (loading) {
      return ['Đang phân tích hành trình bằng AI...']
    }
    if (error) {
      return [error]
    }
    if (!aiData) {
      switch (activeInsight) {
        case 'weather':
          return ['Vui lòng chọn điểm đi, điểm đến và ngày khởi hành để nhận dự báo thời tiết từ AI.']
        case 'price':
          return ['Nhập thông tin chặng bay để phân tích xu hướng giá vé.']
        case 'tips':
          return ['Các lời khuyên du lịch hữu ích sẽ hiển thị tại đây sau khi chọn chặng bay.']
        default:
          return []
      }
    }
    switch (activeInsight) {
      case 'weather':
        return [aiData.weather || 'Không có thông tin thời tiết.']
      case 'price':
        return [aiData.priceTrend || 'Không có phân tích xu hướng giá.']
      case 'tips':
        return aiData.travelTips && aiData.travelTips.length > 0 
          ? aiData.travelTips 
          : ['Không có lời khuyên du lịch nào cho hành trình này.']
      default:
        return []
    }
  }, [activeInsight, aiData, loading, error])

  return (
    <div className="w-full h-auto pb-6 rounded-[32px] border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-premium text-slate-900 overflow-hidden transition-all duration-500">
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-3xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" /> Gợi ý hành trình từ AI
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAiSuggestions}
            disabled={loading}
            className="self-start rounded-full bg-white p-2 text-slate-700 shadow-md hover:bg-slate-50 border border-slate-200 transition-all active:rotate-180 disabled:opacity-50"
            aria-label="Refresh insights"
          >
            <FiRefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-bold text-brand-primary tracking-tight">Trợ lý ảo AI</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {searchContext?.to
            ? `Phân tích cho chặng ${searchContext.from.split(' (')[0]} → ${destination}.`
            : 'Nhập điểm đến để nhận khuyến nghị cá nhân hóa.'}
        </p>

        <div className="mt-6 grid gap-2">
          {insightItems.map((item) => {
            const Icon = item.icon
            const isSel = activeInsight === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveInsight(item.id)}
                className={`group rounded-2xl border p-3 text-left transition-all duration-300 ${isSel ? 'border-brand-secondary bg-orange-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${isSel ? 'bg-brand-secondary text-white' : 'bg-white text-slate-400 group-hover:text-brand-primary'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isSel ? 'text-brand-secondary' : 'text-slate-700'}`}>{item.title}</h4>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-brand-primary/5 p-4 border border-brand-primary/10 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/60">PHÂN TÍCH CHI TIẾT TỪ AI</span>
             <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
          </div>
          <ul className="space-y-3">
            {details.map((line, index) => (
              <li key={index} className="flex gap-2 items-start text-xs font-medium text-slate-700 leading-normal">
                <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-secondary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
