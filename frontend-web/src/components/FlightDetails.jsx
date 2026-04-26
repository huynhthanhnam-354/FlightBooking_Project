import React from "react";

export default function FlightDetails({ flight }) {
  if (!flight) return <div className="bg-white p-4 rounded shadow">Không có thông tin chuyến.</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold text-lg">Chi tiết chuyến</h3>
      <div className="mt-2 text-sm text-slate-700">
        <div><strong>Hãng:</strong> {flight.airline}</div>
        <div><strong>Số hiệu:</strong> {flight.flightNumber}</div>
        <div><strong>Khởi hành:</strong> {flight.depart}</div>
        <div><strong>Đến:</strong> {flight.arrive}</div>
        <div><strong>Thời gian bay:</strong> {flight.duration}</div>
        <div><strong>Giá:</strong> {flight.price}₫</div>
      </div>
    </div>
  );
}
