import React, { useState } from "react";

export default function BookingForm({ flight, passengers = 1, onPassengersChange, onSubmit }) {
  if (!flight) return <div className="bg-white p-4 rounded shadow">Vui lòng chọn chuyến để đặt vé.</div>;

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [passport, setPassport] = useState("");
  const [seatPref, setSeatPref] = useState("any");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelClass, setTravelClass] = useState("economy");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, "")) || 0;
  const subtotal = priceNumber * passengers;
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = 50000 * passengers;
  const total = subtotal + tax + serviceFee;

  function submit(e) {
    e.preventDefault();
    setIsLoading(true);
    const booking = {
      flight,
      passengers,
      passenger: { name, dob, passport, seatPref },
      contact: { email, phone },
      travelClass,
      paymentMethod,
      priceBreakdown: { pricePer: priceNumber, subtotal, tax, serviceFee, total }
    };

    setTimeout(() => {
      onSubmit && onSubmit(booking);
      setIsLoading(false);
    }, 700);
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Đặt vé — {flight.airline} <span className="text-sm text-slate-500">({flight.flightNumber})</span></div>
          <div className="text-sm text-slate-500">{flight.depart} → {flight.arrive} · {flight.duration}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Số hành khách</div>
          <select value={passengers} onChange={e => onPassengersChange && onPassengersChange(Number(e.target.value))} className="border p-2 rounded">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600">Họ và tên chính</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Ngày sinh</label>
          <input value={dob} onChange={e => setDob(e.target.value)} type="date" className="w-full border p-2 rounded mt-1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600">Hộ chiếu / CMND (tuỳ chọn)</label>
          <input value={passport} onChange={e => setPassport(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Ưu tiên chỗ ngồi</label>
          <select value={seatPref} onChange={e => setSeatPref(e.target.value)} className="w-full border p-2 rounded mt-1">
            <option value="any">Bất kỳ</option>
            <option value="window">Cạnh cửa sổ</option>
            <option value="aisle">Lối đi</option>
          </select>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-slate-600">Thông tin liên hệ</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required className="w-full border p-2 rounded" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" required className="w-full border p-2 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600">Hạng vé</label>
          <select value={travelClass} onChange={e => setTravelClass(e.target.value)} className="w-full border p-2 rounded mt-1">
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600">Phương thức thanh toán</label>
          <div className="mt-1 flex gap-3">
            <label className="inline-flex items-center gap-2"><input type="radio" name="pay" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} /> Thẻ</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="pay" checked={paymentMethod==='paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">Tổng (bao gồm thuế & phí)</div>
          <div className="text-xl font-bold">{total.toLocaleString()}₫</div>
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isLoading} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded font-semibold shadow">
            {isLoading ? 'Đang xử lý…' : `Xác nhận & Thanh toán (${total.toLocaleString()}₫)`}
          </button>
        </div>
      </div>
    </form>
  );
}
