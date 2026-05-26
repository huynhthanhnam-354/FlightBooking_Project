import React, { useState } from "react";

export default function FlightSearchForm({ onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  function submit(e) {
    e.preventDefault();
    onSearch({ from, to, date, passengers });
  }

  return (
    <form onSubmit={submit} className="w-full bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-lg border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-600 mb-1 block ml-1">Điểm đi</label>
          <input
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder="Ví dụ: Hà Nội (HAN)"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block ml-1">Điểm đến</label>
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="Ví dụ: Hồ Chí Minh (SGN)"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block ml-1">Ngày đi</label>
          <input
            value={date}
            onChange={e => setDate(e.target.value)}
            type="date"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block ml-1">Hành khách</label>
          <select
            value={passengers}
            onChange={e => setPassengers(Number(e.target.value))}
            className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition text-slate-900 appearance-none"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} hành khách</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="px-8 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition shadow-sky-500/20 active:scale-95">
          Tìm chuyến
        </button>
      </div>
    </form>
  );
}
