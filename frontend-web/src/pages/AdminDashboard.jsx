import React from "react";

export default function AdminDashboard() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Thống kê nhanh (bookings, revenue)</div>
        <div className="bg-white p-4 rounded shadow">Quản lý chuyến bay</div>
        <div className="bg-white p-4 rounded shadow">Quản lý đặt chỗ</div>
      </div>
    </section>
  );
}
