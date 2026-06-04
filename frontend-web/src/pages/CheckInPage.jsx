import React from 'react'
import { Link } from 'react-router-dom'

export default function CheckInPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">Online check-in</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Check-in trực tuyến</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nhập PNR và họ/tên cuối của hành khách để kiểm tra booking. Booking cần được thanh toán trước khi check-in.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Chuẩn bị PNR', 'Mã đặt chỗ nằm trong vé hoặc trang Vé của tôi.'],
            ['2', 'Kiểm tra thông tin', 'Đối chiếu hành khách, chuyến bay, ghế và hành lý ký gửi.'],
            ['3', 'Nhận boarding pass', 'Sau khi xác nhận, lưu boarding pass để dùng tại sân bay.'],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                {step}
              </div>
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/user-dashboard" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
            Mở vé của tôi
          </Link>
          <Link to="/support" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cần hỗ trợ check-in
          </Link>
        </div>
      </div>
    </section>
  )
}
