import React from 'react'

export default function PriceRangeSlider({ min = 500000, max = 5000000, valueMin = 500000, valueMax = 5000000, onChangeMin = () => {}, onChangeMax = () => {}, disabled = false }) {
  return (
    <div className={`rounded-3xl border p-4 ${disabled ? 'border-slate-200 bg-slate-50/80' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={e => onChangeMin(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-sky-600"
        />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={e => onChangeMax(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-sky-600"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-100 px-3 py-2">Min: {valueMin.toLocaleString()}₫</div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2">Max: {valueMax.toLocaleString()}₫</div>
      </div>
      {disabled && (
        <div className="mt-3 text-xs text-slate-500">Không có chuyến phù hợp để điều chỉnh phạm vi giá.</div>
      )}
    </div>
  )
}
