import React, { useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function BookingConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // 1. Get confirmation from state (Legacy/Internal) or URL Params (VNPAY Redirect)
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const vnpResponseCode = queryParams.get('vnp_ResponseCode')
  const vnpTxnRef = queryParams.get('vnp_TxnRef')
  
  const confirmation = location.state?.confirmation

  // Case 1: VNPAY Callback
  if (vnpResponseCode) {
    const isSuccess = vnpResponseCode === '00'
    return (
      <div className="max-w-3xl mx-auto p-8 mt-10 bg-white rounded-3xl shadow-xl text-center">
        {isSuccess ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <FiCheckCircle size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Thanh toán thành công!</h2>
            <p className="text-slate-600 mb-6">Mã giao dịch của bạn là: <strong className="font-mono text-blue-600">{vnpTxnRef}</strong>. Chúng tôi đã gửi thông tin vé qua email của bạn.</p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <FiXCircle size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Thanh toán thất bại</h2>
            <p className="text-slate-600 mb-6">Đã có lỗi xảy ra trong quá trình thanh toán (Mã lỗi: {vnpResponseCode}). Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          </>
        )}
        
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">Về trang chủ</button>
          <Link to="/bookings" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Quản lý đặt vé</Link>
        </div>
      </div>
    )
  }

  // Case 2: No information found
  if (!confirmation) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center mt-20">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin đặt vé</h3>
        <p className="text-slate-500 mb-8">Vui lòng kiểm tra lại lịch sử đặt chỗ trong tài khoản của bạn.</p>
        <Link to="/search" className="inline-block px-8 py-3 bg-sky-600 text-white rounded-xl font-bold shadow-lg">Tìm chuyến ngay</Link>
      </div>
    )
  }

  // Case 3: Legacy confirmation from state
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
