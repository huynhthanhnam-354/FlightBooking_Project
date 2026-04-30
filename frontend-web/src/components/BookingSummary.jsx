import React from "react";

export default function BookingSummary({ flight, passengers = 1 }) {
  if (!flight) return <div className="bg-white p-4 rounded shadow">Không có chuyến được chọn.</div>;

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, "")) || 0;
  const subtotal = priceNumber * passengers;
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = 50000 * passengers;
  const total = subtotal + tax + serviceFee;

  return (
    <aside className="bg-white p-4 rounded shadow space-y-4">
      <div>
        <div className="text-lg font-semibold">Tóm tắt đặt vé</div>
        <div className="text-sm text-slate-500">{flight.airline} · {flight.flightNumber}</div>
      </div>

      <div className="text-sm">
        <div className="flex justify-between py-1"><div className="text-slate-600">Giá mỗi khách</div><div>{priceNumber.toLocaleString()}₫</div></div>
        <div className="flex justify-between py-1"><div className="text-slate-600">Hành khách ({passengers})</div><div>{subtotal.toLocaleString()}₫</div></div>
        <div className="flex justify-between py-1"><div className="text-slate-600">Thuế (10%)</div><div>{tax.toLocaleString()}₫</div></div>
        <div className="flex justify-between py-1"><div className="text-slate-600">Phí dịch vụ</div><div>{serviceFee.toLocaleString()}₫</div></div>
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <div className="text-slate-600">Tổng phải trả</div>
          <div className="text-2xl font-bold">{total.toLocaleString()}₫</div>
        </div>
      </div>

      <div className="text-xs text-slate-500">Giá chỉ mang tính tham khảo — thanh toán sẽ được xử lý ở bước tiếp theo.</div>
    </aside>
  );
}
