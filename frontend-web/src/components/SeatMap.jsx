import React, { useState } from 'react'
import './SeatMap.css'

const letters = ['A', 'B', 'C', 'D', 'E', 'F']

function generateRows() {
  // Predefined booked seats for demo
  const booked = new Set(['1B', '3C', '4D', '6E', '8A'])
  const rows = []
  for (let r = 1; r <= 12; r++) {
    let leftCount = 3
    let rightCount = 3
    let classType = 'economy'
    if (r <= 2) {
      leftCount = 2
      rightCount = 2
      classType = 'business'
    }

    const seats = []
    for (let i = 0; i < leftCount; i++) {
      const letter = letters[i]
      const id = `${r}${letter}`
      // addOn: extra charge for premium/extramile seats; business shown as premium
      const addOn = classType === 'business' ? 400000 : r === 5 ? 150000 : 0
      seats.push({ id, row: r, letter, side: 'left', status: booked.has(id) ? 'booked' : 'available', classType, extra: r === 5, addOn })
    }
    for (let i = 0; i < rightCount; i++) {
      const letter = letters[3 + i]
      const id = `${r}${letter}`
      const addOn = classType === 'business' ? 400000 : r === 5 ? 150000 : 0
      seats.push({ id, row: r, letter, side: 'right', status: booked.has(id) ? 'booked' : 'available', classType, extra: r === 5, addOn })
    }
    rows.push({ row: r, leftCount, rightCount, seats, classType })
  }
  return rows
}

export default function SeatMap() {
  const [rows, setRows] = useState(generateRows())

  const toggleSelect = (seatId) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        seats: row.seats.map((s) => (s.id === seatId ? (s.status === 'booked' ? s : { ...s, selected: !s.selected }) : s)),
      })),
    )
  }

  const renderSeatButton = (s) => {
    const classes = ['seat', s.status === 'booked' ? 'booked' : s.selected ? 'selected' : 'available', s.classType === 'business' ? 'business' : '', s.extra ? 'extra' : ''].join(' ')

    return (
      <button
        key={s.id}
        className={classes}
        onClick={() => toggleSelect(s.id)}
        disabled={s.status === 'booked'}
        aria-label={`Ghế ${s.id} ${s.status}`}
        aria-describedby={`tooltip-${s.id}`}
      >
        <span className="seat-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10V7a3 3 0 0 1 3-3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 21v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <span className="seat-id">{s.letter}</span>

        <div className="seat-tooltip" role="tooltip" id={`tooltip-${s.id}`}>
          <div className="tt-seat">Ghế {s.id}</div>
          <div className="tt-class">{s.classType === 'business' ? 'Hạng thương gia' : 'Hạng phổ thông'}</div>
          <div className="tt-price">Phí cộng thêm: +{s.addOn.toLocaleString()}₫</div>
        </div>
      </button>
    )
  }

  const businessRows = rows.filter((r) => r.classType === 'business')
  const economyRows = rows.filter((r) => r.classType === 'economy')

  const renderRow = (row) => {
    const leftSeats = row.seats.filter((s) => s.side === 'left')
    const rightSeats = row.seats.filter((s) => s.side === 'right')
    const seatSize = row.classType === 'business' ? 56 : 48
    const aisleSize = 28
    const gridTemplate = `repeat(${row.leftCount}, ${seatSize}px) ${aisleSize}px repeat(${row.rightCount}, ${seatSize}px)`

    return (
      <div className="seat-row-wrapper" key={row.row} data-class={row.classType}>
        <div className="row-number">{row.row}</div>
        <div className="seat-row" style={{ gridTemplateColumns: gridTemplate }}>
          {leftSeats.map((s) => renderSeatButton(s))}

          <div className="aisle" />

          {rightSeats.map((s) => renderSeatButton(s))}
        </div>
      </div>
    )
  }

  return (
    <div className="seatmap-container">
      <div className="seatmap">
        <div className="cabin-top" />

        <div className="cabin-section">
          <div className="cabin-label">Hạng thương gia</div>
          {businessRows.map(renderRow)}
        </div>

        <div className="cabin-divider" />

        <div className="cabin-section">
          <div className="cabin-label">Phổ thông</div>
          {economyRows.map(renderRow)}
        </div>

        <div className="cabin-bottom" />
      </div>

      <div className="legend">
        <div className="legend-row">
          <div className="legend-item">
            <span className="swatch available" /> Ghế trống
          </div>
          <div className="legend-item">
            <span className="swatch booked" /> Ghế đã đặt
          </div>
          <div className="legend-item">
            <span className="swatch selected" /> Ghế đang chọn
          </div>
        </div>

        <div className="legend-row">
          <div className="legend-item">
            <span className="swatch business" /> Hạng thương gia
          </div>
          <div className="legend-item">
            <span className="swatch economy" /> Hạng phổ thông
          </div>
          <div className="legend-item">
            <span className="swatch extra" /> Ghế có chỗ để chân rộng
          </div>
        </div>
      </div>
    </div>
  )
}
