import React from 'react'

export default function PriceRangeSlider({ min = 0, max = 2000000, valueMin = 0, valueMax = 0, onChangeMin = () => {}, onChangeMax = () => {} }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={valueMin} onChange={e => onChangeMin(Number(e.target.value))} className="w-full" />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <input type="range" min={min} max={max} value={valueMax} onChange={e => onChangeMax(Number(e.target.value))} className="w-full" />
      </div>
      <div className="flex justify-between text-sm text-slate-500 mt-2">
        <div>Min: {(valueMin || min).toLocaleString()}₫</div>
        <div>Max: {(valueMax || max).toLocaleString()}₫</div>
      </div>
    </div>
  )
}
