import React, { useState } from 'react'
import { useBookingStore } from '../store/bookingStore'
import './SeatMap.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const BUSINESS_ROWS = 2
const TOTAL_ROWS = 15

export default function SeatMap() {
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  const toggleSeat = useBookingStore((state) => state.toggleSeat)
  const [bookedSeats] = useState(['1A', '5C', '10F', '3B']) // Mock booked seats

  const getSeatType = (row, letter) => {
    if (letter === 'A' || letter === 'F') return 'Window'
    if (letter === 'C' || letter === 'D') return 'Aisle'
    return 'Middle'
  }

  const getSeatPrice = (row) => {
    if (row <= BUSINESS_ROWS) return 500000
    if (row === 6 || row === 7) return 150000 // Exit rows
    return 0
  }

  const renderSeat = (row, letter) => {
    const id = `${row}${letter}`
    const isBooked = bookedSeats.includes(id)
    const isSelected = selectedSeats.includes(id)
    const isBusiness = row <= BUSINESS_ROWS
    const isExitRow = row === 6 || row === 7
    const price = getSeatPrice(row)

    return (
      <button
        key={id}
        disabled={isBooked}
        onClick={() => toggleSeat(id)}
        className={`seat-item ${isBusiness ? 'business' : ''} ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isExitRow ? 'extra-legroom' : ''}`}
        title={`${id} - ${getSeatType(row, letter)} - +${price.toLocaleString()}₫`}
      >
        {letter}
        {price > 0 && !isBooked && !isSelected && (
          <span className="price-tag">+{Math.floor(price/1000)}k</span>
        )}
      </button>
    )
  }

  return (
    <div className="seatmap-wrapper">
      <div className="plane-fuselage">
        <div className="plane-nose">
          <div className="cockpit">
            <div className="cockpit-window" />
            <div className="cockpit-window" />
          </div>
        </div>

        <div className="plane-wings" />

        <div className="cabin-container py-8">
          {[...Array(TOTAL_ROWS)].map((_, i) => {
            const row = i + 1
            const isExitRow = row === 6 || row === 7

            return (
              <React.Fragment key={row}>
                {isExitRow && row === 6 && (
                  <div className="flex justify-center my-4">
                    <span className="exit-row-label">Cửa thoát hiểm</span>
                  </div>
                )}
                
                <div className="seat-row-container">
                  <div className="aisle-number">{row}</div>
                  <div className="seat-grid">
                    {/* Left side: A, B, C */}
                    {LETTERS.slice(0, 3).map(l => renderSeat(row, l))}
                    
                    {/* Aisle space */}
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300">{row}</span>
                    </div>

                    {/* Right side: D, E, F */}
                    {LETTERS.slice(3, 6).map(l => renderSeat(row, l))}
                  </div>
                  <div className="aisle-number">{row}</div>
                </div>

                {row === BUSINESS_ROWS && (
                   <div className="h-px bg-slate-100 my-6 mx-8 relative">
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hết hạng thương gia</span>
                   </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="plane-tail" />
      </div>

      {/* Legend */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg border-2 border-slate-200" />
          <span className="text-xs font-bold text-slate-600">Trống</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-sky-500" />
          <span className="text-xs font-bold text-slate-600">Đang chọn</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-slate-100" />
          <span className="text-xs font-bold text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg border-2 border-emerald-500 bg-emerald-50" />
          <span className="text-xs font-bold text-slate-600">Để chân rộng</span>
        </div>
      </div>
    </div>
  )
}
