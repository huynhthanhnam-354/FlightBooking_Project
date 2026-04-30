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
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <div className="flex gap-2">
        <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From" className="flex-1 border p-2 rounded" />
        <input value={to} onChange={e => setTo(e.target.value)} placeholder="To" className="flex-1 border p-2 rounded" />
      </div>
      <div className="flex gap-2">
        <input value={date} onChange={e => setDate(e.target.value)} type="date" className="border p-2 rounded" />
        <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="border p-2 rounded">
          <option value={1}>1 hành khách</option>
          <option value={2}>2 hành khách</option>
          <option value={3}>3 hành khách</option>
          <option value={4}>4 hành khách</option>
        </select>
      </div>
      <div>
        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded">Tìm chuyến</button>
      </div>
    </form>
  );
}
