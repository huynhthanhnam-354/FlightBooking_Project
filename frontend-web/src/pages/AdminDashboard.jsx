import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  FiHome, 
  FiAirplay, 
  FiBook, 
  FiBarChart2, 
  FiSettings, 
  FiSearch, 
  FiBell, 
  FiUser, 
  FiDollarSign, 
  FiTag, 
  FiActivity, 
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiCheck,
  FiTrendingDown,
  FiTrendingUp,
  FiDownload,
  FiCalendar,
  FiSliders
} from 'react-icons/fi';

const SIDEBAR_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'flights', label: 'Quản lý chuyến bay', icon: FiAirplay },
  { id: 'bookings', label: 'Quản lý đặt vé', icon: FiBook },
  { id: 'analytics', label: 'Phân tích doanh thu', icon: FiBarChart2 },
  { id: 'settings', label: 'Cài đặt hệ thống', icon: FiSettings },
];

const SUMMARY_STATS = [
  { label: 'Tổng doanh thu', value: '4,850,000,000₫', icon: FiDollarSign, color: 'bg-emerald-500', trend: '+12.5% so với tháng trước' },
  { label: 'Tổng vé đã bán', value: '12,450', icon: FiTag, color: 'bg-sky-500', trend: '+8.2% so với tháng trước' },
  { label: 'Chuyến bay đang chạy', value: '48', icon: FiActivity, color: 'bg-indigo-500', trend: 'Đang khai thác' },
  { label: 'Yêu cầu chờ xử lý', value: '24', icon: FiClock, color: 'bg-amber-500', trend: 'Cần phê duyệt ngay' },
];

const RECENT_BOOKINGS = [
  { id: 'FB-9821', flight: 'VN123 (HAN-SGN)', passenger: 'Huỳnh Trần Nam Bình', date: '27/05/2026', price: '2,450,000₫', status: 'Completed' },
  { id: 'FB-9822', flight: 'VJ456 (SGN-DAD)', passenger: 'Nguyễn Thị Minh Anh', date: '27/05/2026', price: '1,200,000₫', status: 'Pending' },
  { id: 'FB-9823', flight: 'QH789 (HAN-PQC)', passenger: 'Trần Văn Hoàng', date: '26/05/2026', price: '3,850,000₫', status: 'Completed' },
  { id: 'FB-9824', flight: 'VN456 (DAD-HAN)', passenger: 'Lê Thanh Hải', date: '26/05/2026', price: '1,950,000₫', status: 'Cancelled' },
  { id: 'FB-9825', flight: 'VJ789 (SGN-HAN)', passenger: 'Phạm Minh Đức', date: '25/05/2026', price: '2,100,000₫', status: 'Completed' },
];

const MOCK_FLIGHTS_DATA = [
  { id: 1, flightNumber: 'VN123', airline: 'Vietnam Airlines', from: 'HAN', to: 'SGN', depart: '08:00', arrive: '10:00', price: '2,100,000₫', status: 'Available' },
  { id: 2, flightNumber: 'VJ456', airline: 'Vietjet Air', from: 'SGN', to: 'DAD', depart: '12:30', arrive: '13:50', price: '980,000₫', status: 'Delayed' },
  { id: 3, flightNumber: 'QH789', airline: 'Bamboo Airways', from: 'HAN', to: 'PQC', depart: '14:00', arrive: '16:10', price: '1,850,000₫', status: 'Cancelled' },
  { id: 4, flightNumber: 'VN456', airline: 'Vietnam Airlines', from: 'DAD', to: 'HAN', depart: '18:20', arrive: '19:40', price: '1,450,000₫', status: 'Available' },
  { id: 5, flightNumber: 'VJ789', airline: 'Vietjet Air', from: 'SGN', to: 'HAN', depart: '21:00', arrive: '23:10', price: '1,250,000₫', status: 'Available' },
];

const MOCK_BOOKINGS_DATA = [
  { id: 1, pnr: 'FB-9821', passenger: 'Huỳnh Trần Nam Bình', flight: 'VN123', date: '27/05/2026', price: '2,450,000₫', status: 'Completed' },
  { id: 2, pnr: 'FB-9822', passenger: 'Nguyễn Thị Minh Anh', flight: 'VJ456', date: '27/05/2026', price: '1,200,000₫', status: 'Pending' },
  { id: 3, pnr: 'FB-9823', passenger: 'Trần Văn Hoàng', flight: 'QH789', date: '26/05/2026', price: '3,850,000₫', status: 'Completed' },
  { id: 4, pnr: 'FB-9826', passenger: 'Nguyễn Văn A', flight: 'VN123', date: '27/05/2026', price: '2,100,000₫', status: 'Pending' },
  { id: 5, pnr: 'FB-9827', passenger: 'Lê Thị B', flight: 'VJ789', date: '25/05/2026', price: '1,250,000₫', status: 'Completed' },
];

const MOCK_AIRLINE_REVENUE = [
  { name: 'Vietnam Airlines', percentage: 45, value: '2,182,500,000₫', color: 'bg-sky-600' },
  { name: 'Vietjet Air', percentage: 32, value: '1,552,000,000₫', color: 'bg-red-500' },
  { name: 'Bamboo Airways', percentage: 15, value: '727,500,000₫', color: 'bg-emerald-500' },
  { name: 'Vietravel Airlines', percentage: 8, value: '388,000,000₫', color: 'bg-amber-500' },
];

const MOCK_DAILY_REVENUE = [
  { date: '27/05/2026', bookings: 42, revenue: '185,000,000₫', growth: '+12%' },
  { date: '26/05/2026', bookings: 38, revenue: '162,000,000₫', growth: '+5%' },
  { date: '25/05/2026', bookings: 45, revenue: '198,000,000₫', growth: '+8%' },
  { date: '24/05/2026', bookings: 31, revenue: '142,000,000₫', growth: '-2%' },
  { date: '23/05/2026', bookings: 52, revenue: '215,000,000₫', growth: '+20%' },
];

// 1. Bookings Management Component
function BookingsManagement() {
  const stats = [
    { label: 'Tổng số đơn', value: '124', icon: FiBook, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Đã thanh toán', value: '98', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Chờ xử lý', value: '26', icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Danh sách đặt vé</h3>
          <div className="flex items-center gap-3">
             <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Tìm mã PNR..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-48 focus:ring-0 focus:border-sky-500" />
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Mã PNR</th>
                <th className="px-6 py-5">Hành khách</th>
                <th className="px-6 py-5">Chuyến bay</th>
                <th className="px-6 py-5">Ngày đặt</th>
                <th className="px-6 py-5 text-right">Tổng tiền</th>
                <th className="px-6 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_BOOKINGS_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4 font-mono text-sm font-bold text-sky-600">{item.pnr}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">{item.passenger}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.flight}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{item.price}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {item.status === 'Completed' ? 'Đã thanh toán' : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    {item.status === 'Pending' && (
                      <button className="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold hover:bg-sky-700 transition-all">Phê duyệt</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Flights Management Component
function FlightsManagement() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex gap-4 flex-1">
          <div className="relative max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Tìm chuyến bay..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full" />
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-600/20">
          <FiPlus /> Thêm chuyến bay
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Số hiệu</th>
                <th className="px-6 py-5">Hãng bay</th>
                <th className="px-6 py-5">Chặng bay</th>
                <th className="px-6 py-5 text-right">Giá gốc</th>
                <th className="px-6 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_FLIGHTS_DATA.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4 font-mono font-bold text-sky-600">{flight.flightNumber}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{flight.airline}</td>
                  <td className="px-6 py-4 text-sm font-medium">{flight.from} → {flight.to}</td>
                  <td className="px-6 py-4 text-sm font-black text-right">{flight.price}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                      {flight.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-sky-600"><FiEdit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Revenue Analytics Component
function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800">Báo cáo doanh thu</h3>
          <p className="text-sm text-slate-500">Phân tích hiệu quả kinh doanh</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === range ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {range === 'week' ? 'Theo tuần' : range === 'month' ? 'Theo tháng' : 'Theo quý'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          <h4 className="font-bold text-slate-800 mb-8">Tỉ lệ theo Hãng</h4>
          <div className="space-y-8">
            {MOCK_AIRLINE_REVENUE.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-700">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
                <div className="flex justify-end text-[10px] font-bold text-slate-400">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h4 className="font-bold text-slate-800">Chi tiết theo ngày</h4>
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
              <FiDownload size={14} /> Xuất file Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">Ngày</th>
                  <th className="px-6 py-5 text-center">Số đơn</th>
                  <th className="px-6 py-5 text-right">Doanh thu</th>
                  <th className="px-8 py-5 text-center">Tăng trưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_DAILY_REVENUE.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">{item.date}</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{item.bookings}</span></td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{item.revenue}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {item.growth.startsWith('+') ? <FiTrendingUp /> : <FiTrendingDown />} {item.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. System Settings Component
function SystemSettings() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [serviceFee, setServiceFee] = useState(5);
  const [cancelLimit, setCancelLimit] = useState(24);
  const [aiThreshold, setAiThreshold] = useState(95);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-black text-slate-800">Cài đặt hệ thống</h3>
        <p className="text-sm text-slate-500">Tùy chỉnh tham số vận hành</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-6">
          <h4 className="font-bold text-slate-800 flex items-center gap-2"><FiAirplay size={20} /> Tham số bay</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phí dịch vụ mặc định (%)</label>
              <input type="number" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Giới hạn hủy vé (Giờ)</label>
              <input type="number" value={cancelLimit} onChange={(e) => setCancelLimit(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-6">
          <h4 className="font-bold text-slate-800 flex items-center gap-2"><FiActivity size={20} /> Trợ lý AI</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-700">Dự báo giá thông minh</span>
              <button onClick={() => setAiEnabled(!aiEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${aiEnabled ? 'bg-sky-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ngưỡng chính xác (%)</label>
              <input type="number" value={aiThreshold} onChange={(e) => setAiThreshold(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="px-10 py-4 bg-sky-600 text-white rounded-2xl font-black text-sm hover:bg-sky-700 shadow-xl shadow-sky-600/30 active:scale-95">Lưu cấu hình</button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const chartPoints = "0,80 50,40 100,60 150,20 200,50 250,30 300,10";
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed top-0 left-0 h-screen z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg"><FiAirplay className="text-white text-xl" /></div>
          <div><h1 className="font-bold text-lg leading-none">FlightBook</h1><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Panel</p></div>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1">
          {SIDEBAR_LINKS.map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === link.id ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <link.icon className="text-lg" />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600"><FiUser className="text-slate-400" /></div>
            <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{user.fullName || 'Admin'}</p><p className="text-[10px] text-slate-500 truncate">System Controller</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4"><h2 className="text-xl font-extrabold text-slate-800">Hệ thống Quản trị - FlightBook AI</h2><div className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold border border-sky-100">v1.0.0 Live</div></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block"><p className="text-sm font-bold text-slate-800">{user.fullName || 'Admin'}</p><p className="text-[10px] text-slate-500">Online</p></div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
              {user.fullName?.[0]?.toUpperCase() || 'AD'}
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SUMMARY_STATS.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}><stat.icon size={24} /></div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    <p className="text-[11px] text-slate-400 mt-3 font-semibold uppercase">{stat.trend}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-8">Xu hướng doanh thu</h3>
                  <div className="h-64 w-full relative pt-4">
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      <polyline fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={chartPoints} />
                      {chartPoints.split(' ').map((p, i) => {
                        const [x, y] = p.split(',');
                        return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#0ea5e9" strokeWidth="2" />;
                      })}
                    </svg>
                    <div className="flex justify-between mt-6">
                      {days.map((day, i) => <span key={i} className="text-[10px] font-bold text-slate-400 uppercase w-10 text-center">{day}</span>)}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[2rem] shadow-xl p-8 text-white">
                  <h3 className="text-xl font-black mb-2">AI Performance</h3>
                  <p className="text-slate-400 text-sm mb-8">Hiệu suất hỗ trợ khách hàng bằng AI Bot</p>
                  <div className="space-y-6">
                    {[{l:'Độ chính xác',v:'98.5%',p:'98.5%'},{l:'Tốc độ',v:'< 2s',p:'90%'},{l:'Tự động',v:'85%',p:'85%'}].map((s,i)=>(
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase"><span>{s.l}</span><span className="text-sky-400">{s.v}</span></div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{width:s.p}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">Giao dịch gần đây</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
                        <th className="px-8 py-4">Mã PNR</th><th className="px-6 py-4">Chuyến bay</th><th className="px-6 py-4">Hành khách</th><th className="px-6 py-4 text-right">Giá vé</th><th className="px-8 py-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {RECENT_BOOKINGS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-4 font-mono text-sm font-bold text-sky-600">{item.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{item.flight}</td>
                          <td className="px-6 py-4 text-sm font-semibold">{item.passenger}</td>
                          <td className="px-6 py-4 text-sm font-black text-right">{item.price}</td>
                          <td className="px-8 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flights' && <FlightsManagement />}
          {activeTab === 'bookings' && <BookingsManagement />}
          {activeTab === 'analytics' && <RevenueAnalytics />}
          {activeTab === 'settings' && <SystemSettings />}

          {activeTab !== 'dashboard' && activeTab !== 'flights' && activeTab !== 'bookings' && activeTab !== 'analytics' && activeTab !== 'settings' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-12 text-center">
               <FiActivity size={48} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-lg font-bold text-slate-800">Tính năng đang phát triển</h3>
               <p className="text-slate-500 text-sm mt-1">Vui lòng quay lại sau để trải nghiệm chức năng này.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
