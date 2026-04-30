import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingSummary from '../components/BookingSummary'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import { FaCreditCard, FaUniversity, FaWallet, FaLock } from 'react-icons/fa'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const bookingState = location.state?.booking || null
  const flight = bookingState?.flight || MOCK_FLIGHTS[0]
  const passengers = bookingState?.passengers || 1

  const [name, setName] = useState(bookingState?.passenger?.name || '')
  const [phone, setPhone] = useState(bookingState?.contact?.phone || '')
  const [email, setEmail] = useState(bookingState?.contact?.email || '')
  const [baggage, setBaggage] = useState(bookingState?.passenger?.baggage || 'none')
  const [payment, setPayment] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, '')) || 0
  const subtotal = priceNumber * passengers
  const tax = Math.round(subtotal * 0.1)
  const serviceFee = 50000 * passengers
  const total = subtotal + tax + serviceFee

  function handlePay(e) {
    e.preventDefault()
    setError('')
    if (!name || !phone || !email) {
      setError('Vui lòng điền Họ tên, Số điện thoại và Email.')
      return
    }

    setIsProcessing(true)
    const ref = 'BK' + Math.random().toString(36).slice(2, 9).toUpperCase()
    const confirmation = {
      flight,
      passengers,
      passenger: { name, phone, email, baggage },
      contact: { email, phone },
      paymentMethod: payment,
      priceBreakdown: { pricePer: priceNumber, subtotal, tax, serviceFee, total },
      ref,
      createdAt: new Date().toISOString()
    }

    try {
      const prev = JSON.parse(localStorage.getItem('fb_bookings') || '[]')
      prev.unshift(confirmation)
      localStorage.setItem('fb_bookings', JSON.stringify(prev))
    } catch (err) {
      console.error('Failed to persist booking', err)
    }

    setTimeout(() => {
      setIsProcessing(false)
      navigate('/booking/confirmation', { state: { confirmation } })
    }, 900)
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <main className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">Thông tin hành khách</h2>

            <form onSubmit={handlePay} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Họ và tên</span>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+84 912 345 678" className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </label>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Hành lý</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 border rounded cursor-pointer flex items-center gap-3 ${baggage==='none' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="baggage" checked={baggage==='none'} onChange={() => setBaggage('none')} />
                    <div>
                      <div className="text-sm font-medium">Không hành lý</div>
                      <div className="text-xs text-slate-500">Miễn phí</div>
                    </div>
                  </label>
                  <label className={`p-3 border rounded cursor-pointer flex items-center gap-3 ${baggage==='20' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="baggage" checked={baggage==='20'} onChange={() => setBaggage('20')} />
                    <div>
                      <div className="text-sm font-medium">1 x 20kg</div>
                      <div className="text-xs text-slate-500">Phí áp dụng</div>
                    </div>
                  </label>
                  <label className={`p-3 border rounded cursor-pointer flex items-center gap-3 ${baggage==='40' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="baggage" checked={baggage==='40'} onChange={() => setBaggage('40')} />
                    <div>
                      <div className="text-sm font-medium">2 x 20kg</div>
                      <div className="text-xs text-slate-500">Phí áp dụng</div>
                    </div>
                  </label>
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 border rounded flex items-center gap-3 cursor-pointer ${payment==='card' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="payment" checked={payment==='card'} onChange={() => setPayment('card')} />
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span className="text-sm">Thẻ tín dụng</span>
                    </div>
                  </label>

                  <label className={`p-3 border rounded flex items-center gap-3 cursor-pointer ${payment==='bank' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="payment" checked={payment==='bank'} onChange={() => setPayment('bank')} />
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"/></svg>
                      <span className="text-sm">Chuyển khoản</span>
                    </div>
                  </label>

                  <label className={`p-3 border rounded flex items-center gap-3 cursor-pointer ${payment==='wallet' ? 'ring-2 ring-sky-500' : ''}`}>
                    <input type="radio" name="payment" checked={payment==='wallet'} onChange={() => setPayment('wallet')} />
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3"/></svg>
                      <span className="text-sm">Ví điện tử</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button type="submit" className="w-full px-5 py-3 bg-sky-800 text-white rounded text-lg font-semibold">{isProcessing ? 'Đang xử lý…' : 'Thanh toán ngay'}</button>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <FaLock className="text-sky-600" />
                  <div>Bảo mật thanh toán — Mã hoá SSL</div>
                </div>
              </div>
            </form>
          </div>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Tóm tắt đơn hàng</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FaLock className="text-sky-600" />
                  <span>Bảo mật</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-slate-600">Chuyến</div>
                <div className="font-medium">{flight.airline} · {flight.flightNumber}</div>
                <div className="text-sm text-slate-500">{flight.depart} → {flight.arrive} · {flight.duration}</div>
              </div>

              <BookingSummary flight={flight} passengers={passengers} />

              <div className="mt-4 text-sm text-slate-600 flex items-center gap-2">
                <FaLock className="text-sky-600" />
                <div>Thanh toán an toàn — Mã hoá SSL</div>
              </div>

              <div className="text-xs text-slate-500 mt-3">Bản tóm tắt này bao gồm giá cơ bản, thuế và phí dịch vụ.</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
