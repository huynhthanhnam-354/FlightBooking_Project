import React, { useState, useEffect, useRef } from 'react'
import { useBookingStore } from '../store/bookingStore'
import { toast } from 'react-toastify'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import api, { bookingApi } from '../services/api'
import './SeatMap.css'

if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const BUSINESS_ROWS = 2
const TOTAL_ROWS = 12

export default function SeatMap({ flight }) {
  const selectedSeats = useBookingStore((state) => state?.selectedSeats || [])
  const setSelectedSeats = useBookingStore((state) => state?.setSelectedSeats)
  const passengerCount = useBookingStore((state) => state?.searchParams?.passengers || 1)
  
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [heldSeats, setHeldSeats] = useState([])
  const [seatActionLoading, setSeatActionLoading] = useState(false)
  const stompClientRef = useRef(null)
  const previousFlightIdRef = useRef(null)

  useEffect(() => {
    if (previousFlightIdRef.current !== null && previousFlightIdRef.current !== flight?.id) {
      setSelectedSeats?.([])
    }
    previousFlightIdRef.current = flight?.id || null
  }, [flight?.id, setSelectedSeats])

  const refreshOccupiedSeats = async () => {
    if (!flight?.id) return
    try {
      const response = await api.get(`/bookings/occupied-seats?flightId=${flight.id}`)
      const nextSeats = response?.data || []
      setOccupiedSeats(nextSeats)
    } catch (err) {
      console.error("Error fetching occupied seats:", err)
    }
  }

  // 1. Fetch occupied seats from database, with polling fallback for clients without WebSocket updates.
  useEffect(() => {
    if (!flight?.id) return

    refreshOccupiedSeats()
    const pollId = window.setInterval(refreshOccupiedSeats, 3000)
    return () => window.clearInterval(pollId)
  }, [flight?.id, selectedSeats, setSelectedSeats])

  // 2. Connect WebSocket STOMP client
  useEffect(() => {
    if (!flight?.id) return

    let socket;
    let client;
    try {
      socket = new SockJS('/ws-seat-selection')
      client = Stomp.over(socket)
      
      client.debug = () => {} // disable debug messages

      client.connect({}, (frame) => {
        stompClientRef.current = client
        
        client.subscribe(`/topic/flight/${flight.id}/seats`, (message) => {
          try {
            const event = JSON.parse(message?.body || '{}')
            const { seatNumber, actionStatus } = event
            
            if (seatNumber) {
              if (actionStatus === 'HOLD') {
                setHeldSeats(prev => [...new Set([...prev, seatNumber])])
              } else if (actionStatus === 'UNHOLD') {
                setHeldSeats(prev => prev.filter(s => s !== seatNumber))
              } else if (actionStatus === 'BOOKED') {
                setOccupiedSeats(prev => [...new Set([...prev, seatNumber])])
                setHeldSeats(prev => prev.filter(s => s !== seatNumber))
              }
            }
          } catch (e) {
            console.error("Error parsing dynamic seat event:", e)
          }
        })
      }, (error) => {
        console.warn("STOMP connection failed, running in fallback offline mode:", error)
      })
    } catch (err) {
      console.error("Failed to initialize STOMP client connection:", err)
    }

    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.disconnect()
        } catch (e) {
          console.warn("Error during STOMP client disconnect cleanup:", e)
        }
      }
    }
  }, [flight])

  const sendSeatToggle = (seatNumber, actionStatus) => {
    if (stompClientRef.current?.connected && flight?.id) {
      try {
        stompClientRef.current.send(`/app/flight/${flight.id}/toggle-seat`, {}, JSON.stringify({
          seatNumber,
          actionStatus
        }));
      } catch (err) {
        console.warn("Failed to publish seat toggle message via STOMP:", err);
      }
    }
  }

  const handleSeatClick = (id) => {
    const currentSeats = selectedSeats || [];
    const isSelected = currentSeats.includes(id);
    
    let actionStatus;
    if (isSelected) {
      // Hủy chọn
      setSelectedSeats?.(currentSeats.filter(seat => seat !== id));
      actionStatus = 'UNHOLD';
      sendSeatToggle(id, actionStatus);
    } else {
      // Ghế mới
      if (passengerCount === 1) {
        // Hủy chọn ghế cũ
        if (currentSeats.length > 0) {
          const oldSeat = currentSeats[0];
          sendSeatToggle(oldSeat, 'UNHOLD');
        }
        setSelectedSeats?.([id]);
        actionStatus = 'HOLD';
        sendSeatToggle(id, actionStatus);
      } else {
        // Nhiều hành khách
        if (currentSeats.length < passengerCount) {
          setSelectedSeats?.([...currentSeats, id]);
          actionStatus = 'HOLD';
          sendSeatToggle(id, actionStatus);
        } else {
          toast.warning(`Bạn đã chọn đủ số lượng ghế cho ${passengerCount} hành khách.`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      }
    }
  }

  const handleSeatClickWithHold = async (id) => {
    if (seatActionLoading) return
    const currentSeats = selectedSeats || []
    const isSelected = currentSeats.includes(id)

    setSeatActionLoading(true)
    try {
      if (isSelected) {
        await bookingApi.releaseSeatHold(flight.id, id)
        setSelectedSeats?.(currentSeats.filter(seat => seat !== id))
        return
      }

      await bookingApi.holdSeat(flight.id, id)
      if (passengerCount === 1) {
        if (currentSeats.length > 0) {
          await bookingApi.releaseSeatHold(flight.id, currentSeats[0])
        }
        setSelectedSeats?.([id])
      } else if (currentSeats.length < passengerCount) {
        setSelectedSeats?.([...currentSeats, id])
      } else {
        toast.warning(`Bạn đã chọn đủ số lượng ghế cho ${passengerCount} hành khách.`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        })
        await bookingApi.releaseSeatHold(flight.id, id)
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Ghế này đang được người khác giữ. Vui lòng chọn ghế khác.'
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      })
      try {
        const response = await api.get(`/bookings/occupied-seats?flightId=${flight.id}`)
        setOccupiedSeats(response?.data || [])
      } catch (_) {}
    } finally {
      setSeatActionLoading(false)
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
    const isSelected = selectedSeats?.includes(id)
    const isBooked = occupiedSeats?.includes(id) && !isSelected
    const isHeldByOthers = heldSeats?.includes(id) && !isSelected
    const isBusiness = row <= BUSINESS_ROWS
    const isExitRow = row === 6 || row === 7
    const price = getSeatPrice(row)

    let seatClass = 'seat-item'
    if (isBooked) seatClass += ' booked'
    else if (isHeldByOthers) seatClass += ' held'
    else if (isSelected) seatClass += ' selected'
    else if (isBusiness) seatClass += ' business'
    else if (isExitRow) seatClass += ' extra-legroom'

    return (
      <button
        key={id}
        disabled={(isBooked || isHeldByOthers || seatActionLoading) && !isSelected}
        onClick={() => handleSeatClickWithHold(id)}
        className={seatClass}
        title={`${id} - ${getSeatType(row, letter)}${price > 0 ? ` - +${price.toLocaleString()}₫` : ''}${isHeldByOthers ? ' - Đang được người khác chọn' : ''}`}
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
          <div className="w-6 h-6 rounded-lg bg-slate-100 border-2 border-slate-300" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Tạm giữ</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">Hành khách khác</span>
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

                    {/* Right side: D, E */}
                    {LETTERS.slice(3).map(l => renderSeat(row, l))}
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
