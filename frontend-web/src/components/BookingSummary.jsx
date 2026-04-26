import React from "react";

export default function BookingSummary({ flight, passengers = 1 }) {
  if (!flight) return <div className="bg-white p-4 rounded shadow">Không có chuyến được chọn.</div>;

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, "")) || 0;
  const total = priceNumber * passengers;

  return (
    <aside className="bg-white p-4 rounded shadow space-y-3">
      <div className="text-lg font-semibold">Tóm tắt đặt vé</div>
      <div className="text-sm text-slate-600">{flight.airline} · {flight.flightNumber}</div>
      <div className="flex justify-between">
        <div className="text-slate-600">Hành trình</div>
        <div>{flight.depart} → {flight.arrive}</div>
      </div>
      <div className="flex justify-between">
        <div className="text-slate-600">Thời gian</div>
        <div>{flight.duration}</div>
      </div>
      <div className="flex justify-between">
        <div className="text-slate-600">Số hành khách</div>
        <div>{passengers}</div>
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <div className="text-slate-600">Tổng</div>
          <div className="text-xl font-bold">{total.toLocaleString()}₫</div>
        </div>
      </div>
    </aside>
  );
}
