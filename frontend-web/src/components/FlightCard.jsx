import React from "react";
import { Link } from "react-router-dom";

export default function FlightCard({ flight, onOpenDetails }) {
  const { id, airline, flightNumber, depart, arrive, duration, price } = flight;
  const priceLabel = typeof price === "number" ? price.toLocaleString() : price;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{airline} <span className="text-sm text-slate-500">({flightNumber})</span></div>
            <div className="text-slate-600 mt-1">{depart} → {arrive} <span className="mx-2">·</span> {duration}</div>
          </div>
          <div className="hidden md:block text-sm text-slate-500">Economy</div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="text-right">
          <div className="text-2xl font-bold text-sky-600">{priceLabel}₫</div>
          <div className="text-sm text-slate-500">Giá mỗi khách</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => onOpenDetails && onOpenDetails(flight)} className="px-3 py-2 border rounded text-slate-700 hover:bg-slate-50">Chi tiết</button>
          <Link to="/booking" state={{ flight }} className="px-3 py-2 bg-sky-600 text-white rounded">Đặt vé</Link>
        </div>
      </div>
    </div>
  );
}
