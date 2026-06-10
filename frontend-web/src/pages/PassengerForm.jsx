import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/bookingStore'
import BookingForm from '../components/BookingForm'
import BookingSummary from '../components/BookingSummary'
import { FiCheck } from 'react-icons/fi'

export default function PassengerForm() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const selectedFlight = useBookingStore((state) => state.selectedFlight)
  const passengerCount = useBookingStore((state) => state.searchParams.passengers)
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  
  const flight = selectedFlight || location.state?.flight || null
  const passengers = passengerCount || location.state?.passengers || 1

  function handleFormSubmit(booking) {
    navigate('/booking/checkout', { state: { booking } })
  }

  const steps = [
    { id: 1, name: 'Chọn chuyến', status: 'complete' },
    { id: 2, name: 'Chọn chỗ ngồi', status: 'complete' },
    { id: 3, name: 'Thông tin', status: 'active' },
    { id: 4, name: 'Thanh toán', status: 'upcoming' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Steps Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-3 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    step.status === 'active' 
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xl shadow-sky-100 scale-110 rotate-3' 
                      : step.status === 'complete'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'complete' ? <FiCheck className="stroke-[4]" size={20} /> : <span className="font-black text-sm">{step.id}</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    step.status === 'active' ? 'text-sky-600' : step.status === 'complete' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 min-w-[20px] sm:min-w-[60px] -mt-8 rounded-full transition-all duration-700 ${
                    step.status === 'complete' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {flight ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <BookingForm 
                flight={flight} 
                passengers={passengers} 
                onSubmit={handleFormSubmit}
              />
            </div>
            <aside className="lg:col-span-4">
              <BookingSummary 
                flight={flight} 
                passengers={passengers} 
                selectedSeats={selectedSeats}
              />
            </aside>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Thông tin không hợp lệ</h3>
            <p className="text-slate-500 mb-8">Chúng tôi không tìm thấy thông tin chuyến bay bạn đang đặt.</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all"
            >
              Quay lại trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
