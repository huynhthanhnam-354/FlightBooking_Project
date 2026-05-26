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
    <div className="w-full rounded-[32px] border border-slate-200/60 bg-white shadow-[0_40px_80px_rgba(15,23,42,0.08)] text-slate-900 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/95 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> AI Insights
          </div>
          <h3 className="mt-4 text-xl sm:text-2xl font-semibold text-slate-900">Gợi ý thông minh cho chuyến đi của bạn</h3>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-6">
            {searchContext?.to
              ? `Dựa trên hành trình ${searchContext.from} → ${destination}, tôi đã tổng hợp cảnh báo thời tiết, xu hướng giá và combo chuyến đi phù hợp.`
              : 'Nhập điểm khởi hành và điểm đến để nhận khuyến nghị cá nhân hóa ngay lập tức.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveInsight('weather')}
          className="self-start rounded-full bg-white p-2 text-slate-700 shadow-md shadow-slate-900/10 hover:bg-slate-50 border border-slate-200"
          aria-label="Refresh insights"
        >
          <FiRefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {insightItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveInsight(item.id)}
              className={`group rounded-3xl border p-4 text-left transition ${activeInsight === item.id ? 'border-sky-400 bg-slate-950/5 shadow-lg shadow-sky-500/10' : 'border-slate-200/80 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 group-hover:bg-sky-500/15">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-5">{item.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-slate-50 p-4 sm:p-5 shadow-inner shadow-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Chi tiết</div>
            <div className="mt-2 text-base font-semibold text-slate-900">{insightItems.find((item) => item.id === activeInsight)?.title}</div>
          </div>
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Số liệu AI</span>
        </div>

        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {details.map((line, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
