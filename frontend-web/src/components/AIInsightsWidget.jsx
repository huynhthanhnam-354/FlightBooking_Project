import React, { useMemo, useState } from 'react'
import { AiOutlineCloud, AiOutlineBarChart, AiOutlineGift } from 'react-icons/ai'
import { FiRefreshCcw } from 'react-icons/fi'

const insightItems = [
  {
    id: 'weather',
    title: 'Weather Alert',
    icon: AiOutlineCloud,
    description: 'Kiểm tra điều kiện thời tiết cho điểm đến của bạn trước khi đặt vé.',
  },
  {
    id: 'price',
    title: 'Price Trend',
    icon: AiOutlineBarChart,
    description: 'Dự đoán xu hướng giá và giúp bạn quyết định: đợi hay đặt ngay.',
  },
  {
    id: 'combo',
    title: 'Vacation Combo',
    icon: AiOutlineGift,
    description: 'Gợi ý combo chuyến bay + khách sạn / trải nghiệm phù hợp với lộ trình của bạn.',
  },
]

export default function AIInsightsWidget({ searchContext }) {
  const [activeInsight, setActiveInsight] = useState('weather')

  const destination = useMemo(() => {
    if (!searchContext?.to) return 'điểm đến của bạn'
    return searchContext.to.split(' (')[0]
  }, [searchContext])

  const dateCopy = useMemo(() => {
    if (!searchContext?.departDate) return 'một ngày phù hợp'
    return new Date(searchContext.departDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
  }, [searchContext])

  const details = useMemo(() => {
    switch (activeInsight) {
      case 'weather':
        return searchContext?.to
          ? [`Thời tiết ở ${destination} có thể thay đổi nhanh.`, 'Mang theo áo khoác nhẹ nếu có mưa hoặc gió.', `Nhiệt độ dự báo trong khoảng 24-28°C vào ${dateCopy}.`]
          : ['Chọn điểm đến để xem cảnh báo thời tiết cụ thể.', 'Bạn sẽ nhận được dự báo nhiệt độ, mưa và gió.']
      case 'price':
        return searchContext?.to
          ? [`Giá tới ${destination} đang có xu hướng ${searchContext?.tripType === 'oneway' ? 'ổn định' : 'giảm nhẹ'} trong 2-3 ngày tới.`, 'Nếu bạn cần linh hoạt, hãy kiểm tra lại vào cuối tuần.', 'Giá tốt nhất thường xuất hiện vào buổi sáng thứ Ba.']
          : ['Nhập điểm đến và ngày để nhận dự đoán giá chính xác.', 'Tôi sẽ dự báo ngay khi có đủ thông tin hành trình.']
      case 'combo':
        return searchContext?.to
          ? [`Thử combo chuyến bay + khách sạn tại ${destination} để tiết kiệm chi phí.`, 'Xem đề xuất trải nghiệm địa phương và tour ngắn ngày.', `Ưu tiên chặng bay sáng để có thêm thời gian khám phá.`]
          : ['Chọn điểm đến để mở các combo du lịch cá nhân hoá.', 'Combo có thể bao gồm khách sạn, xe đưa đón và tour tham quan.']
      default:
        return []
    }
  }, [activeInsight, destination, dateCopy, searchContext])

  return (
    <div className="w-full h-auto pb-6 rounded-[32px] border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-premium text-slate-900 overflow-hidden transition-all duration-500">
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-3xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" /> AI Insights
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveInsight('weather')}
            className="self-start rounded-full bg-white p-2 text-slate-700 shadow-md hover:bg-slate-50 border border-slate-200 transition-all active:rotate-180"
            aria-label="Refresh insights"
          >
            <FiRefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-bold text-brand-primary tracking-tight">Gợi ý hành trình</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {searchContext?.to
            ? `Phân tích cho chặng ${searchContext.from} → ${destination}.`
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
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/60">Chi tiết AI</span>
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
