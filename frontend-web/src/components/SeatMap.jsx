import React, { useState } from 'react'
import { useBookingStore } from '../store/bookingStore'
import { toast } from 'react-toastify'
import './SeatMap.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const BUSINESS_ROWS = 2
const TOTAL_ROWS = 15

export default function SeatMap() {
  const selectedSeats = useBookingStore((state) => state.selectedSeats)
  const setSelectedSeats = useBookingStore((state) => state.setSelectedSeats)
  const passengerCount = useBookingStore((state) => state.searchParams.passengers || 1)
  const [bookedSeats] = useState(['1A', '5C', '10F', '3B']) // Mock booked seats

  const handleSeatClick = (id) => {
    const isSelected = selectedSeats.includes(id);
    
    if (isSelected) {
      // Hủy chọn nếu ghế đã có trong danh sách
      setSelectedSeats(selectedSeats.filter(seat => seat !== id));
    } else {
      // Ghế mới
      if (passengerCount === 1) {
        // Thay thế ghế hiện tại
        setSelectedSeats([id]);
      } else {
        // Nhiều hành khách
        if (selectedSeats.length < passengerCount) {
          setSelectedSeats([...selectedSeats, id]);
        } else {
          // Báo lỗi bằng Toast
          toast.warning(`Bạn đã chọn đủ số lượng ghế cho ${passengerCount} hành khách.`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      }
    }
  }

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

    let seatClass = 'seat-item'
    if (isBooked) seatClass += ' booked'
    else if (isSelected) seatClass += ' selected'
    else if (isBusiness) seatClass += ' business'
    else if (isExitRow) seatClass += ' extra-legroom'

    return (
      <button
        key={id}
        disabled={isBooked}
        onClick={() => handleSeatClick(id)}
        className={seatClass}
        title={`${id} - ${getSeatType(row, letter)}${price > 0 ? ` - +${price.toLocaleString()}₫` : ''}`}
      >
        <span className="seat-label">{letter}</span>
      </button>
    )
  }

  return (
    <div className="seatmap-wrapper">
      {/* 1. Header Legend - Clean & Professional */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg border-2 border-slate-200 bg-white" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase leading-none">Phổ thông</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">Gốc</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg border-2 border-blue-300 bg-blue-50" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-700 uppercase leading-none">Thương gia</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">+500k</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg border-2 border-emerald-500 bg-emerald-50 border-dashed" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-700 uppercase leading-none">Chỗ rộng</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">+150k</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-sky-500 shadow-lg shadow-sky-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-sky-700 uppercase leading-none">Đang chọn</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">Của bạn</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-slate-100 border-2 border-slate-200 opacity-50" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Đã đặt</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">Hết chỗ</span>
          </div>
        </div>
      </div>

      {/* 2. Airplane Fuselage */}
      <div className="plane-fuselage">
        <div className="plane-nose">
          <div className="cockpit">
            <div className="cockpit-window" />
            <div className="cockpit-window" />
          </div>
        </div>

        <div className="plane-wings" />
        
        {/* Entrance Doors */}
        <div className="plane-door door-left top-40" />
        <div className="plane-door door-right top-40" />

        <div className="cabin-container py-10">
          {[...Array(TOTAL_ROWS)].map((_, i) => {
            const row = i + 1
            const isExitRow = row === 6 || row === 7

            return (
              <React.Fragment key={row}>
                {isExitRow && row === 6 && (
                  <div className="flex flex-col items-center my-6 relative">
                    <div className="plane-door door-left -top-2" />
                    <div className="plane-door door-right -top-2" />
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
                      <span className="text-[10px] font-bold text-slate-200">{row}</span>
                    </div>

                    {/* Right side: D, E, F */}
                    {LETTERS.slice(3, 6).map(l => renderSeat(row, l))}
                  </div>
                  <div className="aisle-number">{row}</div>
                </div>

                {row === BUSINESS_ROWS && (
                   <div className="h-px bg-slate-100 my-8 mx-10 relative">
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Khoang Phổ Thông</span>
                   </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="plane-tail" />
      </div>
    </div>
  )
}
