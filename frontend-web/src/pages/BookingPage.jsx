import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingForm from '../components/BookingForm'
import BookingSummary from '../components/BookingSummary'
import FlightCard from '../components/FlightCard'
import { MOCK_FLIGHTS } from '../data/mockFlights'
import SeatMap from '../components/SeatMap'

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const idFromQuery = query.get('id')
  const flightFromQuery = idFromQuery ? MOCK_FLIGHTS.find(f => f.id === idFromQuery) : null
  const flight = location.state?.flight || flightFromQuery || null
  const [passengers, setPassengers] = useState(location.state?.passengers || 1)

  function handleSubmit(booking) {
    const ref = 'BK' + Math.random().toString(36).slice(2, 9).toUpperCase()
    const confirmation = { ...booking, ref, createdAt: new Date().toISOString() }

    // persist booking history to localStorage (most recent first)
    try {
      const prev = JSON.parse(localStorage.getItem('fb_bookings') || '[]')
      prev.unshift(confirmation)
      localStorage.setItem('fb_bookings', JSON.stringify(prev))
    } catch (err) {
      console.error('Failed to persist booking', err)
    }

    navigate('/booking/confirmation', { state: { confirmation } })
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {flight ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Đặt vé</h2>

            <FlightCard flight={flight} onOpenDetails={() => {}} />

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Chọn chỗ ngồi</h3>
              <SeatMap />
            </div>

            <div className="mt-6">
              <BookingForm
                flight={flight}
                passengers={passengers}
                onPassengersChange={setPassengers}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-20">
              <BookingSummary flight={flight} passengers={passengers} />
            </div>
          </aside>
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded shadow">
          <p>Không có chuyến được chọn. Vui lòng tìm chuyến và chọn "Đặt vé".</p>
          <button onClick={() => navigate('/search')} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded">Tìm chuyến</button>
        </div>
      )}
    </div>
  )
}
