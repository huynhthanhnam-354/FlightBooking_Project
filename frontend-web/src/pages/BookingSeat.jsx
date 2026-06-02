import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/bookingStore'
import BookingSummary from '../components/BookingSummary'
import FlightCard from '../components/FlightCard'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import SeatMap from '../components/SeatMap'

export default function BookingSeat() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedFlight = useBookingStore((state) => state.selectedFlight)
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  const passengerCount = useBookingStore((state) => state.searchParams.passengers)
  const selectFlight = useBookingStore((state) => state.selectFlight)
  
  const query = new URLSearchParams(location.search)
  const idFromQuery = query.get('id')
  
  // Use global flight if exists, otherwise fallback to local/query
  const flight = selectedFlight || (idFromQuery ? MOCK_FLIGHTS.find(f => f.id === idFromQuery) : null)
  const passengers = passengerCount || 1

  useEffect(() => {
    if (flight && !selectedFlight) {
      selectFlight(flight)
    }
  }, [flight, selectedFlight, selectFlight])

  const handleNextStep = () => {
    // Navigating to Step 3: Passenger Information
    navigate('/booking/passenger', { state: { flight, passengers } })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-8 animate-in fade-in duration-700">
      {flight ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Chọn chỗ ngồi</h2>
              <p className="text-slate-500">Vui lòng chọn vị trí ngồi ưa thích trên chuyến bay của bạn.</p>
            </div>

            <FlightCard flight={flight} onOpenDetails={() => {}} />

            <div className="mt-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <SeatMap />
            </div>

            <div className="mt-10 flex justify-end">
              <button 
                onClick={handleNextStep}
                disabled={selectedSeats.length === 0}
                className="px-10 py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận chỗ ngồi & Tiếp tục
              </button>
            </div>
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-24">
              <BookingSummary 
                flight={flight} 
                passengers={passengers} 
                selectedSeats={selectedSeats}
              />
            </div>
          </aside>
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-[2rem] shadow-xl max-w-md mx-auto mt-20 border border-slate-50">
          <div className="text-4xl mb-4">✈️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa chọn chuyến bay</h3>
          <p className="text-slate-500 mb-8">Vui lòng tìm và chọn chuyến bay trước khi chọn chỗ ngồi.</p>
          <button 
            onClick={() => navigate('/search')} 
            className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all"
          >
            Tìm chuyến ngay
          </button>
        </div>
      )}
    </div>
  )
}
