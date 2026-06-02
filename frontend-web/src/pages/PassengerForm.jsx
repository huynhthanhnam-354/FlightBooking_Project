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
  
  const flight = selectedFlight || location.state?.flight || null
  const passengers = passengerCount || location.state?.passengers || 1

  function handleFormSubmit(booking) {
    navigate('/checkout', { state: { booking } })
  }

  const steps = [
    { id: 1, name: 'Chọn chuyến', status: 'complete' },
    { id: 2, name: 'Chọn chỗ ngồi', status: 'complete' },
    { id: 3, name: 'Điền thông tin', status: 'active' },
    { id: 4, name: 'Thanh toán', status: 'upcoming' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Steps Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.status === 'active' 
                      ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-200 scale-110' 
                      : step.status === 'complete'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'complete' ? <FiCheck className="stroke-[3]" size={18} /> : <span className="font-bold text-sm">{step.id}</span>}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${
                    step.status === 'active' ? 'text-sky-600' : step.status === 'complete' ? 'text-emerald-600' : 'text-slate-400 opacity-60'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 min-w-[20px] sm:min-w-[40px] -mt-6 transition-colors duration-500 ${
                    step.status === 'complete' ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {flight ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <BookingForm 
                flight={flight} 
                passengers={passengers} 
                onSubmit={handleFormSubmit}
              />
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <BookingSummary flight={flight} passengers={passengers} />
              </div>
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
