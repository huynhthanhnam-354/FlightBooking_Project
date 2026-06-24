import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/bookingStore'
import { bookingApi } from '../services/api'
import BookingSummary from '../components/BookingSummary'
import FlightCard from '../components/FlightCard'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import SeatMap from '../components/SeatMap'
import { FaClock, FaChevronLeft, FaChevronRight, FaInfoCircle, FaChair } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'

export default function BookingSeat() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedFlight = useBookingStore((state) => state.selectedFlight)
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  const passengerCount = useBookingStore((state) => state.searchParams.passengers)
  const setSelectedFlight = useBookingStore((state) => state.setSelectedFlight)
  const setSelectedSeats = useBookingStore((state) => state.setSelectedSeats)
  
  const query = new URLSearchParams(location.search)
  const idFromQuery = query.get('id')
  const locationFlight = location.state?.flight
  
  const flight = selectedFlight || locationFlight || (idFromQuery ? MOCK_FLIGHTS.find(f => f.id === idFromQuery) : null)
  const passengers = passengerCount || 1

  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const selectedSeatsRef = useRef([])
  const flightIdRef = useRef(null)
  const continuingRef = useRef(false)

  useEffect(() => {
    if (flight && !selectedFlight) {
      setSelectedFlight(flight)
    }
  }, [flight, selectedFlight, setSelectedFlight])

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats || []
  }, [selectedSeats])

  useEffect(() => {
    flightIdRef.current = flight?.id || null
  }, [flight?.id])

  useEffect(() => {
    return () => {
      if (continuingRef.current) return
      const flightId = flightIdRef.current
      const seats = selectedSeatsRef.current || []
      if (!flightId || seats.length === 0) return

      seats.forEach((seatNumber) => {
        void bookingApi.releaseSeatHold(flightId, seatNumber).catch(() => {})
      })
      setSelectedSeats([])
    }
  }, [setSelectedSeats])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const getCabinLabel = () => {
    if (!selectedSeats?.length) return 'Chưa chọn ghế'

    const hasBusiness = selectedSeats.some((seat) => {
      const row = parseInt(String(seat).match(/\d+/)?.[0] || '', 10)
      return row > 0 && row <= 2
    })
    const hasEconomy = selectedSeats.some((seat) => {
      const row = parseInt(String(seat).match(/\d+/)?.[0] || '', 10)
      return row > 2
    })

    if (hasBusiness && hasEconomy) return 'Thương gia / Phổ thông'
    if (hasBusiness) return 'Thương gia / Linh hoạt'
    return 'Phổ thông / Linh hoạt'
  }

  const handleNextStep = () => {
    continuingRef.current = true
    navigate('/booking/passenger', { state: { flight, passengers } })
  }

  const steps = [
    { id: 1, name: 'Chọn chuyến', status: 'complete' },
    { id: 2, name: 'Chọn chỗ ngồi', status: 'active' },
    { id: 3, name: 'Thông tin', status: 'upcoming' },
    { id: 4, name: 'Thanh toán', status: 'upcoming' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    step.status === 'active' 
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xl shadow-sky-100 scale-110 rotate-3' 
                      : step.status === 'complete'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'complete' ? <FiCheck size={20} className="stroke-[4]" /> : <span className="font-black text-sm">{step.id}</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    step.status === 'active' ? 'text-sky-600' : step.status === 'complete' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 min-w-[20px] rounded-full -mt-8 ${step.status === 'complete' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {flight ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Main Content: Seat Map */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chọn chỗ ngồi</h2>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                    <FaChair className="text-sky-500" /> Vui lòng chọn {passengers} vị trí cho hành khách
                  </p>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 flex items-center gap-3">
                  <FaClock className="text-amber-600 animate-pulse" />
                  <span className="text-sm font-black text-amber-700">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 to-indigo-500 opacity-20" />
                <SeatMap flight={flight} />
              </div>

              {/* Selection Info Panel */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="bg-white/10 p-4 rounded-3xl">
                    <FaChair size={24} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ghế đã chọn</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map(s => (
                          <span key={s} className="bg-sky-500 px-4 py-1.5 rounded-xl font-black text-sm">{s}</span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">Chưa chọn chỗ nào</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                   <button 
                    onClick={() => navigate(-1)}
                    className="flex-1 md:flex-none px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FaChevronLeft size={14} /> Quay lại
                  </button>
                  <button 
                    disabled={selectedSeats.length < passengers}
                    onClick={handleNextStep}
                    className="flex-1 md:flex-none px-10 py-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    Tiếp tục <FaChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                <FaInfoCircle className="text-blue-500 shrink-0 mt-1" size={20} />
                <div className="text-sm text-blue-800 leading-relaxed">
                  <p className="font-bold">Chính sách chỗ ngồi:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1 opacity-80">
                    <li>Hạng thương gia bao gồm ưu tiên lên máy bay và suất ăn cao cấp.</li>
                    <li>Ghế cửa thoát hiểm có không gian để chân rộng hơn nhưng yêu cầu hành khách có đủ sức khỏe để hỗ trợ trong trường hợp khẩn cấp.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2 space-y-6">
              <BookingSummary 
                flight={flight} 
                passengers={passengers} 
                selectedSeats={selectedSeats}
              />
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <div className="w-2 h-2 bg-sky-500 rounded-full" />
                   Thông tin chuyến bay
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Mã chuyến bay</span>
                    <span className="font-black text-slate-900">{flight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Hạng vé</span>
                    <span className="font-black text-slate-900">{getCabinLabel()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Máy bay</span>
                    <span className="font-black text-slate-900">Airbus A321 Neo</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center p-16 bg-white rounded-[3rem] shadow-xl max-w-xl mx-auto mt-20 border border-slate-100 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-5xl">✈️</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Chưa chọn chuyến bay</h3>
            <p className="text-slate-500 mb-10 leading-relaxed">Bạn cần chọn một chuyến bay phù hợp trước khi tiến hành chọn vị trí ngồi ưa thích.</p>
            <button 
              onClick={() => navigate('/booking')} 
              className="px-12 py-4 bg-sky-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
            >
              Tìm chuyến bay ngay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
