import React from "react";
import { FaPlane, FaUsers, FaChair, FaInfoCircle } from 'react-icons/fa';

export default function BookingSummary({ flight, passengers = 1, selectedSeats = [] }) {
  if (!flight) return <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">Không có chuyến được chọn.</div>;

  const priceNumber = Number(String(flight.price).replace(/[^0-9]/g, "")) || 0;
  const subtotal = priceNumber * passengers;
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = 50000 * passengers;
  const total = subtotal + tax + serviceFee;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden sticky top-24">
      <div className="bg-slate-900 p-6 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FaPlane className="rotate-45 text-sky-400" />
          Tóm tắt đặt vé
        </h3>
        <p className="text-slate-400 text-sm mt-1">{flight.airline} • {flight.flightNumber}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3 pb-6 border-b border-dashed border-slate-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-2"><FaUsers /> Hành khách</span>
            <span className="font-bold text-slate-800">{passengers} người</span>
          </div>
          
          {selectedSeats.length > 0 && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500 flex items-center gap-2 mt-0.5"><FaChair /> Chỗ ngồi</span>
              <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                {selectedSeats.map(seat => (
                  <span key={seat} className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-100">
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Giá cơ bản</span>
            <span className="text-slate-800 font-medium">{subtotal.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Thuế & Phí (10%)</span>
            <span className="text-slate-800 font-medium">{tax.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Phí dịch vụ</span>
            <span className="text-slate-800 font-medium">{serviceFee.toLocaleString()}₫</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tổng thanh toán</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {total.toLocaleString()}<span className="text-sm ml-0.5">₫</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100">
          <FaInfoCircle className="text-amber-500 mt-1 shrink-0" size={16} />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Giá vé cuối cùng có thể thay đổi tùy thuộc vào dịch vụ bổ sung bạn chọn ở bước sau.
          </p>
        </div>
      </div>
    </div>
  );
}
