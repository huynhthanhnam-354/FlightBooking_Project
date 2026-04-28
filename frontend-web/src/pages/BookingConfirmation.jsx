import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function BookingConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const confirmation = location.state?.confirmation

  if (!confirmation) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p>Không tìm thấy thông tin đặt vé.</p>
        <Link to="/search" className="mt-4 inline-block px-4 py-2 bg-sky-600 text-white rounded">Tìm chuyến</Link>
      </div>
    )
  }

  const { ref, passenger, flight, passengers, contact, priceBreakdown } = confirmation

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Đặt vé thành công</h2>
      <p className="mb-4">Mã đặt vé: <strong>{ref}</strong></p>

      <div className="grid gap-3">
        <div><strong>Hành khách:</strong> {passenger?.name || '—'}</div>
        <div><strong>Số hành khách:</strong> {passengers}</div>
        <div><strong>Chuyến:</strong> {flight?.airline} ({flight?.flightNumber})</div>
        <div><strong>Hành trình:</strong> {flight?.depart} → {flight?.arrive}</div>
        {contact && (
          <>
            <div><strong>Email:</strong> {contact.email}</div>
            <div><strong>Điện thoại:</strong> {contact.phone}</div>
          </>
        )}

        {priceBreakdown && (
          <div className="mt-3 p-3 bg-slate-50 rounded">
            <div className="flex justify-between text-sm"><span>Giá mỗi khách</span><span>{priceBreakdown.pricePer.toLocaleString()}₫</span></div>
            <div className="flex justify-between text-sm"><span>Thành tiền</span><span>{priceBreakdown.subtotal.toLocaleString()}₫</span></div>
            <div className="flex justify-between text-sm"><span>Thuế</span><span>{priceBreakdown.tax.toLocaleString()}₫</span></div>
            <div className="flex justify-between text-sm"><span>Phí dịch vụ</span><span>{priceBreakdown.serviceFee.toLocaleString()}₫</span></div>
            <div className="flex justify-between text-base font-bold mt-2"><span>Tổng</span><span>{priceBreakdown.total.toLocaleString()}₫</span></div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 rounded">Về trang chủ</button>
        <Link to="/search" className="px-4 py-2 bg-sky-600 text-white rounded">Tìm chuyến khác</Link>
      </div>
    </div>
  )
}
