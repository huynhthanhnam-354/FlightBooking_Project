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
    <form onSubmit={submit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">From</label>
          <input
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder="Nơi khởi hành"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">To</label>
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="Điểm đến"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Departure Date</label>
          <input
            value={date}
            onChange={e => setDate(e.target.value)}
            type="date"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Passengers</label>
          <select
            value={passengers}
            onChange={e => setPassengers(Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value={1}>1 hành khách</option>
            <option value={2}>2 hành khách</option>
            <option value={3}>3 hành khách</option>
            <option value={4}>4 hành khách</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700">
          Tìm chuyến
        </button>
      </div>
    </form>
  );
}
