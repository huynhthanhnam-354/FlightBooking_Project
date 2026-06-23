import React, { useState, useEffect } from 'react';
import { LuCheck } from 'react-icons/lu';

const formatCurrency = value => {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

export default function FilterSidebar({
  maxPrice = 5000000,
  selectedAirlines = [],
  directOnly = false,
  airlines = [],
  onFilterChange = () => {},
  onReset = () => {},
  disabled = false,
}) {
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSelectedAirlines, setLocalSelectedAirlines] = useState(selectedAirlines);
  const [localDirectOnly, setLocalDirectOnly] = useState(directOnly);

  // Sync internal states with incoming props (e.g. on reset or parent state change)
  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    setLocalSelectedAirlines(selectedAirlines);
  }, [selectedAirlines]);

  useEffect(() => {
    setLocalDirectOnly(directOnly);
  }, [directOnly]);

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setLocalMaxPrice(val);
    if (onFilterChange) {
      onFilterChange({
        maxPrice: val,
        airlines: localSelectedAirlines,
        selectedAirlines: localSelectedAirlines,
        isDirectOnly: localDirectOnly,
        directOnly: localDirectOnly,
      });
    }
  };

  const handleToggleAirline = (name) => {
    const nextAirlines = localSelectedAirlines.includes(name)
      ? localSelectedAirlines.filter(a => a !== name)
      : [...localSelectedAirlines, name];
    setLocalSelectedAirlines(nextAirlines);
    if (onFilterChange) {
      onFilterChange({
        maxPrice: localMaxPrice,
        airlines: nextAirlines,
        selectedAirlines: nextAirlines,
        isDirectOnly: localDirectOnly,
        directOnly: localDirectOnly,
      });
    }
  };

  const handleDirectOnlyChange = (e) => {
    const val = e.target.checked;
    setLocalDirectOnly(val);
    if (onFilterChange) {
      onFilterChange({
        maxPrice: localMaxPrice,
        airlines: localSelectedAirlines,
        selectedAirlines: localSelectedAirlines,
        isDirectOnly: val,
        directOnly: val,
      });
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-[0.24em] text-slate-400">Bộ lọc</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Tìm chuyến</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 transition active:scale-95 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="space-y-6">
        {/* PRICE FILTER */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Giá tối đa</h3>
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
              Dưới {formatCurrency(localMaxPrice)}
            </span>
          </div>
          <div className="relative pt-2">
            <input
              type="range"
              min="0"
              max="5000000"
              step="100000"
              value={localMaxPrice}
              onChange={handlePriceChange}
              disabled={disabled}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2">
              <span>0đ</span>
              <span>5.000.000đ</span>
            </div>
          </div>
        </section>

        {/* AIRLINE FILTER */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Hãng hàng không</h3>
          <div className="flex flex-wrap gap-2">
            {airlines.map((airline) => {
              const isActive = localSelectedAirlines.includes(airline.name);
              return (
                <button
                  key={airline.code}
                  type="button"
                  onClick={() => handleToggleAirline(airline.name)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isActive && <LuCheck className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{airline.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* DIRECT FLIGHT SWITCH */}
        <section className="pt-4 border-t border-slate-100">
          <label className="flex items-center justify-between cursor-pointer select-none group">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900">Bay thẳng</span>
              <p className="text-xs text-slate-400">Chỉ hiển thị chuyến bay không quá cảnh</p>
            </div>
            <input
              type="checkbox"
              checked={localDirectOnly}
              onChange={handleDirectOnlyChange}
              disabled={disabled}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:opacity-50"
            />
          </label>
        </section>
      </div>
    </div>
  );
}
