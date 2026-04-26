import React, { useState } from "react";

export default function BookingForm({ flight, passengers = 1, onPassengersChange, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function submit(e) {
    e.preventDefault();
    const booking = { flight, passengers, passenger: { name, email, phone } };
    onSubmit && onSubmit(booking);
  }

  if (!flight) return <div className="bg-white p-4 rounded shadow">Vui lòng chọn chuyến để đặt vé.</div>;

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <div className="text-lg font-semibold">Đặt vé — {flight.airline} ({flight.flightNumber})</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Họ và tên</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Số hành khách</label>
          <select value={passengers} onChange={e => onPassengersChange && onPassengersChange(Number(e.target.value))} className="w-full border p-2 rounded">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Số điện thoại</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">Tổng: {typeof flight.price === 'number' ? (flight.price * passengers).toLocaleString() : flight.price + '₫'}</div>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Xác nhận đặt vé</button>
      </div>
    </form>
  );
}
