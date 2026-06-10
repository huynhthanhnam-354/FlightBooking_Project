import React from 'react'

const formatCurrency = value => value.toLocaleString('vi-VN') + '₫'

export default function FilterSidebar({
  priceBounds = { min: 500000, max: 5000000 },
  minPrice = 500000,
  maxPrice = 5000000,
  onMinPriceChange = () => {},
  onMaxPriceChange = () => {},
  airlines = [],
  selectedAirlines = [],
  onToggleAirline = () => {},
  selectedStops = [],
  onToggleStop = () => {},
  selectedAmenities = [],
  onToggleAmenity = () => {},
  onApply = () => {},
  onReset = () => {},
  disabled = false,
}) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Tùy chọn tìm chuyến</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Bộ lọc</h2>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Khoảng giá</h3>
                <p className="mt-1 text-sm text-slate-500">Điều chỉnh phạm vi giá phù hợp với ngân sách.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{formatCurrency(minPrice)} - {formatCurrency(maxPrice)}</span>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-100 p-4">
              <div className="space-y-3">
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 rounded-full bg-sky-600"
                    style={{ left: `${((minPrice - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) * 100}%`, right: `${100 - ((maxPrice - priceBounds.min) / Math.max(priceBounds.max - priceBounds.min, 1)) * 100}%` }}
                  />
                </div>

                <div className="grid gap-3">
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={minPrice}
                    onChange={e => onMinPriceChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full cursor-pointer accent-sky-600"
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={maxPrice}
                    onChange={e => onMaxPriceChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full cursor-pointer accent-sky-600"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Min</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={e => onMinPriceChange(Number(e.target.value))}
                      disabled={disabled}
                      className="mt-2 w-full border-0 bg-transparent p-0 text-lg font-semibold text-slate-900 focus:outline-none"
                    />
                  </label>
                  <label className="rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Max</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={e => onMaxPriceChange(Number(e.target.value))}
                      disabled={disabled}
                      className="mt-2 w-full border-0 bg-transparent p-0 text-lg font-semibold text-slate-900 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Hãng hàng không</h3>
              <p className="mt-1 text-sm text-slate-500">Chọn hãng bay uy tín, phù hợp lịch trình.</p>
            </div>
            <div className="space-y-3">
              {airlines.map((airline) => (
                <button
                  key={airline.code}
                  type="button"
                  onClick={() => onToggleAirline(airline.name)}
                  className={`group flex w-full items-center justify-between gap-3 rounded-3xl border px-3 py-3 text-left transition ${selectedAirlines.includes(airline.name) ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-600 shadow-sm">
                      {airline.code}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{airline.name}</p>
                      <p className="text-xs text-slate-500">Mã: {airline.code}</p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border ${selectedAirlines.includes(airline.name) ? 'border-sky-500 bg-sky-500 shadow-sm' : 'border-slate-300 bg-white'}`} />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Số điểm dừng</h3>
              <p className="mt-1 text-sm text-slate-500">Lọc chuyến theo số lần transit.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: '0', label: 'Bay thẳng' },
                { value: '1', label: '1 điểm dừng' },
                { value: '2plus', label: '2+ điểm dừng' },
              ].map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center justify-between rounded-3xl border px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(option.value)}
                    onChange={() => onToggleStop(option.value)}
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tiện ích</h3>
              <p className="mt-1 text-sm text-slate-500">Chọn tiện nghi đi kèm chuyến bay.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'wifi', label: 'Wifi' },
                { value: 'meal', label: 'Suất ăn' },
              ].map((item) => (
                <label key={item.value} className="flex cursor-pointer items-center justify-between rounded-3xl border px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(item.value)}
                    onChange={() => onToggleAmenity(item.value)}
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="grid gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onApply}
              className="w-full rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700"
              disabled={disabled}
            >
              Áp dụng bộ lọc
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Đặt lại
            </button>
          </div>
      </div>
    </div>
  )
}
