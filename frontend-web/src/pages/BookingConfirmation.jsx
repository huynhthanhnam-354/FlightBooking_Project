import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function BookingConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const confirmation = location.state?.confirmation

  if (!confirmation) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center mt-20">
        <div className="text-4xl mb-4">?</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Khong tim thay thong tin dat ve</h3>
        <p className="text-slate-500 mb-8">Vui long kiem tra lai lich su dat cho trong tai khoan cua ban.</p>
        <Link to="/search" className="inline-block px-8 py-3 bg-sky-600 text-white rounded-xl font-bold shadow-lg">Tim chuyen ngay</Link>
      </div>
    )
  }

  const { ref, passenger, flight, passengers, contact, priceBreakdown } = confirmation

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Dat ve thanh cong</h2>
      <p className="mb-4">Ma dat ve: <strong>{ref}</strong></p>

      <div className="grid gap-3">
        <div><strong>Hanh khach:</strong> {passenger?.name || '-'}</div>
        <div><strong>So hanh khach:</strong> {passengers}</div>
        <div><strong>Chuyen:</strong> {flight?.airline} ({flight?.flightNumber})</div>
        <div><strong>Hanh trinh:</strong> {flight?.depart} - {flight?.arrive}</div>
        {contact && (
          <>
            <div><strong>Email:</strong> {contact.email}</div>
            <div><strong>Dien thoai:</strong> {contact.phone}</div>
          </>
        )}

        {priceBreakdown && (
          <div className="mt-3 p-3 bg-slate-50 rounded">
            <div className="flex justify-between text-sm"><span>Gia moi khach</span><span>{priceBreakdown.pricePer.toLocaleString()} VND</span></div>
            <div className="flex justify-between text-sm"><span>Thanh tien</span><span>{priceBreakdown.subtotal.toLocaleString()} VND</span></div>
            <div className="flex justify-between text-sm"><span>Thue</span><span>{priceBreakdown.tax.toLocaleString()} VND</span></div>
            <div className="flex justify-between text-sm"><span>Phi dich vu</span><span>{priceBreakdown.serviceFee.toLocaleString()} VND</span></div>
            <div className="flex justify-between text-base font-bold mt-2"><span>Tong</span><span>{priceBreakdown.total.toLocaleString()} VND</span></div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 rounded">Ve trang chu</button>
        <Link to="/search" className="px-4 py-2 bg-sky-600 text-white rounded">Tim chuyen khac</Link>
      </div>
    </div>
  )
}
