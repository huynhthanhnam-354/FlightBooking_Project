import React from 'react';
import { FiHome, FiSend, FiUsers, FiSettings, FiBell, FiSearch, FiDollarSign, FiMessageSquare, FiFileText } from 'react-icons/fi';

const Sidebar = () => (
  <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20">
    <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
        <FiSend className="w-5 h-5 text-white" />
      </div>
      <span className="text-lg font-bold tracking-wide text-white">SkyAdmin</span>
    </div>
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg transition-colors shadow-sm shadow-blue-600/20">
        <FiHome className="w-5 h-5" />
        <span className="font-medium">Tổng quan</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
        <FiSend className="w-5 h-5" />
        <span className="font-medium">Quản lý chuyến bay</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
        <FiUsers className="w-5 h-5" />
        <span className="font-medium">Quản lý người dùng</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
        <FiSettings className="w-5 h-5" />
        <span className="font-medium">Cấu hình trợ lý ảo</span>
      </a>
    </nav>
    <div className="p-4 border-t border-gray-800 m-4 rounded-xl bg-gray-800/50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
          <span className="font-bold text-sm text-white">AD</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Super Admin</p>
          <p className="text-xs text-gray-400">admin@skyadmin.com</p>
        </div>
      </div>
    </div>
  </aside>
);

const Header = () => (
  <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
    <div className="flex items-center w-96 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
      <FiSearch className="text-gray-400 w-5 h-5" />
      <input 
        type="text" 
        placeholder="Tìm kiếm..." 
        className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700 placeholder-gray-400"
      />
    </div>
    <div className="flex items-center gap-5">
      <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
        <FiBell className="w-5 h-5" />
        <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white ring-2 ring-white"></span>
      </button>
      <div className="h-6 w-px bg-gray-200"></div>
      <button className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Đăng xuất</button>
    </div>
  </header>
);

const StatCard = ({ title, value, icon, change, changeType }) => (
  <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
      {React.cloneElement(icon, { className: 'w-32 h-32' })}
    </div>
    
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
        changeType === 'positive' ? 'bg-green-50 border-green-100' : 
        changeType === 'negative' ? 'bg-orange-50 border-orange-100' : 
        changeType === 'neutral' ? 'bg-blue-50 border-blue-100' :
        'bg-purple-50 border-purple-100'
      }`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        changeType === 'positive' ? 'text-green-700 bg-green-50 border border-green-200' : 
        changeType === 'negative' ? 'text-red-700 bg-red-50 border border-red-200' : 
        'text-blue-700 bg-blue-50 border border-blue-200'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-medium relative z-10">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1 relative z-10">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const stats = [
    { title: 'Tổng doanh thu', value: '$845,200', icon: <FiDollarSign className="w-6 h-6 text-green-600" />, change: '+15%', changeType: 'positive' },
    { title: 'Tổng số vé đã đặt', value: '12,543', icon: <FiFileText className="w-6 h-6 text-blue-600" />, change: '+8%', changeType: 'positive' },
    { title: 'Số lượng Chatbot session', value: '4,892', icon: <FiMessageSquare className="w-6 h-6 text-purple-600" />, change: '+22%', changeType: 'positive' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi hoạt động kinh doanh và trợ lý ảo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
          
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 min-h-[400px]">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Biểu đồ & Phân tích</h2>
             <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                Khu vực hiển thị biểu đồ phân tích tương tác Chatbot
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
