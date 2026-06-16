import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component - Flight Booking
 * Refactored for a Clean Light Aesthetic with High Contrast.
 * Includes Auth State Sync for real-time user metadata display.
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Chuyến bay', path: '/booking' },
    { name: 'Combo du lịch', path: '/combos' },
    { name: 'Hỗ trợ', path: '/support' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-blue-50 shadow-sm transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <FaPlane className="text-white text-sm rotate-45" />
          </div>
          <span className="text-xl font-bold text-blue-600 tracking-tight">
            Flight<span className="text-slate-900"> Booking</span>
          </span>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                  isActive(link.path) 
                    ? 'text-blue-600 underline underline-offset-8 decoration-2' 
                    : 'text-slate-900 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/admin" className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        {/* Right: CTA & Authentication (Desktop Sync) */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/user-dashboard" 
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-full border border-blue-100 shadow-sm hover:shadow-md hover:bg-blue-50/50 transition-all cursor-pointer group/user"
              >
                <FaUserCircle className="text-blue-600 text-xl group-hover/user:scale-110 transition-transform" />
                <span className="text-sm font-black text-slate-800 tracking-tight">
                  {user.fullName}
                </span>
              </Link>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
                title="Đăng xuất"
              >
                <FaSignOutAlt />
                <span>Thoát</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors px-4 py-2"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-slate-900 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-blue-50 z-[90] flex flex-col p-10 transition-transform duration-500 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-12">
           <span className="text-2xl font-bold text-blue-600 tracking-tighter italic">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-900">
             <FaTimes size={28} />
           </button>
        </div>
        <ul className="space-y-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-bold transition-colors ${
                  isActive(link.path) ? 'text-blue-600' : 'text-slate-900 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          {user?.role === 'ADMIN' && (
             <li>
               <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-rose-600">Admin Panel</Link>
             </li>
          )}
        </ul>
        <div className="mt-auto space-y-4">
          {user ? (
            <div className="space-y-6">
              <Link 
                to="/user-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-6 bg-white rounded-3xl border border-blue-100 shadow-sm flex items-center gap-4 hover:bg-blue-50/50 transition-colors"
              >
                <FaUserCircle className="text-blue-600 text-4xl" />
                <div>
                  <p className="text-lg font-black text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                </div>
              </Link>
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-3 w-full py-5 text-lg font-black text-white bg-rose-600 rounded-3xl shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
              >
                <FaSignOutAlt /> Đăng xuất tài khoản
              </button>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-4 text-center font-bold text-slate-900 border-2 border-slate-200 rounded-2xl bg-white"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-4 text-center font-bold text-white bg-blue-600 rounded-full shadow-lg"
              >
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
