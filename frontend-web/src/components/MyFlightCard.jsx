import React from 'react'
import { FaTicketAlt, FaRobot, FaExchangeAlt } from 'react-icons/fa'

export default function MyFlightCard({ booking, onGetTicket, onAIAssist, onChange }) {
  const { pnr, airline, flightNumber, from, to, depart, arrive, paymentStatus, status } = booking

  const statusMap = {
    upcoming: { label: 'Sắp khởi hành', color: 'bg-sky-100 text-sky-800' },
    completed: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800' }
  }

  const s = statusMap[status] || statusMap.upcoming

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Mã đặt chỗ</div>
            <div className="font-semibold text-lg">{pnr}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>{s.label}</div>
        </div>

        <div className="mt-3">
          <div className="text-sm text-slate-500">Hành trình</div>
          <div className="font-medium text-md">{from} → {to} • {airline} ({flightNumber})</div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
          <div>
            <div className="text-slate-500">Khởi hành</div>
            <div className="font-medium">{depart}</div>
          </div>
          <div>
            <div className="text-slate-500">Hạ cánh</div>
            <div className="font-medium">{arrive}</div>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="inline-flex items-center gap-2">
            <div className={`px-2 py-1 rounded ${paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onGetTicket && onGetTicket(booking)} className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-md text-sm">
          <FaTicketAlt /> Lấy vé điện tử
        </button>

        <button onClick={() => onAIAssist && onAIAssist(booking)} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-md text-sm">
          <FaRobot /> Yêu cầu hỗ trợ từ AI
        </button>

        <button onClick={() => onChange && onChange(booking)} className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-md text-sm">
          <FaExchangeAlt /> Đổi hành trình
        </button>
      </div>
    </div>
  )
}
