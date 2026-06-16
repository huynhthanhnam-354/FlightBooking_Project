import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { bookingApi, api } from '../services/api';
import { 
  FiHome, FiAirplay, FiBook, FiBarChart2, FiSettings, FiSearch, FiBell, FiUser, FiDollarSign, FiTag, FiActivity, FiClock,
  FiMoreVertical, FiCheckCircle, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, FiFilter, FiCheck, FiTrendingDown, FiTrendingUp,
  FiDownload, FiCalendar, FiSliders, FiArrowRight
} from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';

/**
 * 1. Bookings Management Component (Updated for Real Data)
 */
function BookingsManagement({ bookings, stats }) {
  const [searchTerm, setSearchParams] = useState('');
  
  const filtered = useMemo(() => 
    bookings.filter(b => b.pnr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.passengerName.toLowerCase().includes(searchTerm.toLowerCase())),
    [bookings, searchTerm]
  );

  const displayStats = [
    { label: 'Tổng số đơn', value: stats.totalBookings || 0, icon: FiBook, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Đã xác nhận', value: stats.confirmedCount || 0, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Chờ thanh toán', value: stats.pendingPaymentCount || 0, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5">
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <s.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{s.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Hệ thống đặt vé</h3>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Tìm PNR hoặc tên khách..." 
              value={searchTerm}
              onChange={e => setSearchParams(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-80 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50 bg-white">
                <th className="px-10 py-6">PNR</th>
                <th className="px-6 py-6">Khách hàng / Tài khoản</th>
                <th className="px-6 py-6 text-center">Trạng thái</th>
                <th className="px-6 py-6 text-right">Tổng tiền</th>
                <th className="px-10 py-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6 font-mono text-sm font-black text-sky-600 uppercase tracking-tighter group-hover:text-sky-700 transition-colors">#{item.pnr}</td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-tight">{item.passengerName}</span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">{item.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        item.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {item.status === 'CONFIRMED' ? 'Đã thanh toán' : item.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-base font-black text-slate-900 text-right tabular-nums">{item.totalPriceVnd.toLocaleString()}₫</td>
                  <td className="px-10 py-6 text-center">
                    <button className="p-2 text-slate-300 hover:text-sky-600 transition-colors"><FiMoreVertical /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
              <div className="p-32 text-center text-slate-400 italic font-medium bg-white">
                 <FiBook size={48} className="mx-auto mb-4 opacity-5" />
                 Không tìm thấy dữ liệu đặt vé phù hợp.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Revenue Analytics Placeholder (Clean UI)
 */
function RevenueAnalytics() {
  return (
    <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm animate-in fade-in duration-500">
       <FiBarChart2 size={64} className="mx-auto text-sky-100 mb-8" />
       <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Phân tích kinh doanh</h3>
       <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto leading-relaxed">
         Hệ thống đang tổng hợp dữ liệu thời gian thực từ các giao dịch. Biểu đồ chi tiết sẽ khả dụng sau khi có ít nhất 10 giao dịch thực tế.
       </p>
    </div>
  );
}

/**
 * Main Admin Dashboard
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, summaryRes] = await Promise.all([
            api.get('/admin/bookings'),
            api.get('/admin/bookings/summary')
        ]);
        setBookings(bookingsRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error("Admin Dashboard fetch error:", err);
        toast.error("Không thể kết nối tới Server Admin.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
    );
  }

  const stats = [
    { label: 'Tổng doanh thu', value: (summary.totalRevenueVnd || 0).toLocaleString() + '₫', icon: FiDollarSign, color: 'bg-emerald-500', trend: 'Dữ liệu trực tiếp' },
    { label: 'Vé hệ thống', value: (summary.totalBookings || 0).toLocaleString(), icon: FiTag, color: 'bg-sky-500', trend: 'Tất cả trạng thái' },
    { label: 'Đã Check-in', value: summary.checkedInCount || 0, icon: FiActivity, color: 'bg-indigo-500', trend: 'Hoàn tất thủ tục' },
    { label: 'Chờ thanh toán', value: summary.pendingPaymentCount || 0, icon: FiClock, color: 'bg-amber-400', trend: 'Yêu cầu mới' },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - Senior Design */}
      <aside className="w-72 bg-white flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="p-10 flex items-center gap-4 border-b border-slate-50">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/30">
            <FiAirplay className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tighter">FlightBook</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">Console</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-12 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FiHome },
            { id: 'bookings', label: 'Quản lý đặt vé', icon: FiBook },
            { id: 'analytics', label: 'Thống kê', icon: FiBarChart2 },
          ].map(link => (
            <button 
              key={link.id} 
              onClick={() => setActiveTab(link.id)} 
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-500 ${
                activeTab === link.id 
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <link.icon size={18} className={activeTab === link.id ? 'text-sky-400' : 'text-slate-300'} />
              <span className="font-black text-xs uppercase tracking-widest">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-10 border-t border-slate-50">
           <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-sky-600 border border-slate-100">{user.fullName?.[0]}</div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black truncate">{user.fullName}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen flex flex-col relative z-10">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase tracking-[0.05em]">Quản trị hệ thống</h2>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="flex items-center gap-6">
             <button className="relative text-slate-400 hover:text-slate-900 transition-colors">
                <FiBell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">3</span>
             </button>
             <div className="h-8 w-px bg-slate-100"></div>
             <div className="flex items-center gap-4 cursor-pointer">
                <div className="text-right hidden md:block">
                    <p className="text-xs font-black text-slate-900">{user.fullName}</p>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Hệ thống đang chạy</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black flex items-center justify-center shadow-lg border border-slate-700">
                   {user.fullName?.[0]}
                </div>
             </div>
          </div>
        </header>

        <div className="p-12 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform`}><stat.icon size={26} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    <p className="text-[10px] text-slate-300 mt-6 font-bold uppercase tracking-widest border-t border-slate-50 pt-4">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Giao dịch mới nhất</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-[10px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest transition-all">Xem tất cả giao dịch →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-50">
                        <th className="px-12 py-6">PNR</th>
                        <th className="px-6 py-6">Khách hàng</th>
                        <th className="px-6 py-6 text-right">Tổng tiền</th>
                        <th className="px-12 py-6 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bookings.slice(0, 8).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-all duration-200">
                          <td className="px-12 py-6 font-mono text-sm font-black text-sky-600 tracking-tighter uppercase">#{item.pnr}</td>
                          <td className="px-6 py-6">
                             <p className="text-sm font-bold text-slate-800 leading-tight">{item.passengerName}</p>
                             <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{item.userEmail}</p>
                          </td>
                          <td className="px-6 py-6 text-base font-black text-slate-900 text-right tabular-nums">{item.totalPriceVnd.toLocaleString()}₫</td>
                          <td className="px-12 py-6 text-center">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                              item.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {item.status === 'CONFIRMED' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && (
                      <div className="p-32 text-center text-slate-300 italic font-medium bg-white">
                          <FiActivity size={64} className="mx-auto mb-6 opacity-5" />
                          Chưa có giao dịch nào được ghi nhận trên hệ thống.
                      </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && <BookingsManagement bookings={bookings} stats={summary} />}
          {activeTab === 'analytics' && <RevenueAnalytics />}
          
          {activeTab !== 'dashboard' && activeTab !== 'bookings' && activeTab !== 'analytics' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-32 text-center animate-in zoom-in-95 duration-500">
               <FiActivity size={80} className="mx-auto text-sky-100 mb-10 opacity-20" />
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Tính năng bảo trì</h3>
               <p className="text-slate-400 font-medium mt-4 max-w-md mx-auto leading-relaxed">
                 Chúng tôi đang cập nhật các module quản trị nâng cao. Vui lòng quay lại sau khi quá trình đồng bộ hoàn tất.
               </p>
               <button onClick={() => setActiveTab('dashboard')} className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Quay lại Dashboard</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
