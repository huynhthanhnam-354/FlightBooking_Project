import React, { useEffect } from 'react'
import { FaPlane, FaRegClock, FaSuitcase, FaSuitcaseRolling, FaExchangeAlt, FaTimes } from 'react-icons/fa'

export default function FlightDetailsModal({ open, flight = {}, onClose = () => {} }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const {
    airline = 'Unknown',
    flightNumber = '-',
    aircraft = 'Airbus A320',
    depart = '-',
    arrive = '-',
    duration = '-',
    stops = 0,
  } = flight

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">{String(airline).split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
            <div>
              <div className="font-semibold">{airline} · {flightNumber}</div>
              <div className="text-sm text-slate-500">{depart} → {arrive} · {duration}</div>
            </div>
          </div>

          <button onClick={onClose} aria-label="Đóng" className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <nav className="flex flex-col w-40 hidden md:block">
              <button className="text-left py-2 px-3 rounded-md hover:bg-slate-50">Thông tin chuyến bay</button>
              <button className="text-left py-2 px-3 rounded-md hover:bg-slate-50">Hành lý</button>
              <button className="text-left py-2 px-3 rounded-md hover:bg-slate-50">Chính sách</button>
            </nav>

            <div className="flex-1">
              <section className="pb-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <FaPlane className="text-sky-600" />
                  <div className="font-semibold">Thông tin chuyến bay</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="space-y-2">
                    <div><span className="font-medium">Số hiệu:</span> {flightNumber}</div>
                    <div><span className="font-medium">Loại máy bay:</span> {aircraft}</div>
                    <div><span className="font-medium">Số điểm dừng:</span> {stops}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><FaRegClock className="text-slate-500" /> <span className="font-medium">Thời gian chờ:</span> {stops > 0 ? 'Khoảng 1h - 2h tuỳ chặng' : 'Không dừng'}</div>
                    <div className="text-sm text-slate-500">Ghi chú: Thời gian chờ có thể thay đổi theo hãng và điều kiện vận hành.</div>
                  </div>
                </div>
              </section>

              <section className="pt-4 pb-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <FaSuitcaseRolling className="text-sky-600" />
                  <div className="font-semibold">Hành lý</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"><FaSuitcase /></div>
                      <div>
                        <div className="font-medium">Hành lý xách tay</div>
                        <div className="text-sm text-slate-500">1 x 7kg, kích thước tối đa 55x40x20cm</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"><FaSuitcaseRolling /></div>
                      <div>
                        <div className="font-medium">Hành lý ký gửi</div>
                        <div className="text-sm text-slate-500">Theo loại vé: 0kg / 20kg / 40kg. Phí ký gửi áp dụng nếu vượt hạn mức.</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-slate-500">Các quy định cụ thể có thể khác nhau giữa các hãng. Vui lòng kiểm tra chi tiết vé trước khi làm thủ tục.</div>
                    <div className="text-sm text-slate-500">Vật cấm: pin lithium rời, chất lỏng trên 100ml trong hành lý xách tay.</div>
                  </div>
                </div>
              </section>

              <section className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <FaExchangeAlt className="text-sky-600" />
                  <div className="font-semibold">Chính sách hoàn/đổi vé</div>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <div><span className="font-medium">Hoàn vé:</span> Tuỳ hạng vé. Vé rẻ thường không được hoàn, vui lòng xem điều khoản trên vé.</div>
                  <div><span className="font-medium">Đổi vé:</span> Cho phép đổi vé có phí thay đổi và chênh lệch giá nếu có.</div>
                  <div className="text-slate-500">Liên hệ bộ phận chăm sóc khách hàng để biết chi tiết và hỗ trợ.</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
