import React, { useState, useRef, useEffect } from "react";
import { AIRPORTS } from "../data/airports";

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

function AirportSuggest({ query, onPick, excludeCode }) {
  const q = (query || "").trim().toLowerCase();
  const results = AIRPORTS.filter((a) => {
    if (excludeCode && a.code === excludeCode) return false;
    if (!q) return true;
    return (
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.name || a.airport || "").toLowerCase().includes(q)
    );
  }).slice(0, 10);

  if (!results.length) return (
    <div className="p-4 text-sm text-slate-500 italic">Không tìm thấy địa điểm</div>
  );

  return (
    <ul className="max-h-60 overflow-y-auto divide-y divide-slate-50 bg-white">
      {results.map((a) => (
        <li key={a.code}>
          <button
            type="button"
            onClick={() => onPick(a)}
            className="w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors group"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 group-hover:text-sky-700">{a.city}</span>
              <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded">{a.code}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">
              {a.name || a.airport}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function FlightSearchForm({ onSearch }) {
  const [from, setFrom] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [to, setTo] = useState("");
  const [toCode, setToCode] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  const [showFromSuggest, setShowFromSuggest] = useState(false);
  const [showToSuggest, setShowToSuggest] = useState(false);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useOutsideClick(fromRef, () => { setShowFromSuggest(false); setFromQuery(""); });
  useOutsideClick(toRef, () => { setShowToSuggest(false); setToQuery(""); });

  const handlePickAirport = (setter, setCode, setQuery, setShow, a) => {
    setter(`${a.city} (${a.code})`);
    setCode(a.code);
    setQuery("");
    setShow(false);
  };

  function submit(e) {
    e.preventDefault();
    // Gửi mã IATA (ví dụ: HAN, SGN) thay vì tên hiển thị để khớp với Backend
    onSearch({ 
      from: fromCode || from.match(/\((.*?)\)/)?.[1] || from, 
      to: toCode || to.match(/\((.*?)\)/)?.[1] || to, 
      date, 
      passengers 
    });
  }

  return (
    <form onSubmit={submit} className="w-full bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-lg border border-slate-100 relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="relative" ref={fromRef}>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">Điểm đi</label>
          <input
            value={fromQuery || from}
            onChange={(e) => { setFromQuery(e.target.value); setShowFromSuggest(true); }}
            onFocus={() => setShowFromSuggest(true)}
            placeholder="Chọn điểm đi"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900 font-medium"
          />
          {showFromSuggest && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[60] border border-slate-100 overflow-hidden">
              <AirportSuggest 
                query={fromQuery} 
                excludeCode={toCode}
                onPick={(a) => handlePickAirport(setFrom, setFromCode, setFromQuery, setShowFromSuggest, a)} 
              />
            </div>
          )}
        </div>

        <div className="relative" ref={toRef}>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">Điểm đến</label>
          <input
            value={toQuery || to}
            onChange={(e) => { setToQuery(e.target.value); setShowToSuggest(true); }}
            onFocus={() => setShowToSuggest(true)}
            placeholder="Chọn điểm đến"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900 font-medium"
          />
          {showToSuggest && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[60] border border-slate-100 overflow-hidden">
              <AirportSuggest 
                query={toQuery} 
                excludeCode={fromCode}
                onPick={(a) => handlePickAirport(setTo, setToCode, setToQuery, setShowToSuggest, a)} 
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">Ngày đi</label>
          <input
            value={date}
            onChange={e => setDate(e.target.value)}
            type="date"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900 font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">Hành khách</label>
          <select
            value={passengers}
            onChange={e => setPassengers(Number(e.target.value))}
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900 appearance-none font-medium"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} hành khách</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:shadow-lg transition shadow-sky-500/20 active:scale-95">
          Tìm chuyến
        </button>
      </div>
    </form>
  );
}
