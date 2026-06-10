import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes } from 'react-icons/fa';

/**
 * Navbar Component - Flight Booking
 * Refactored for a Clean Light Aesthetic with High Contrast.
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        </ul>

        {/* Right: CTA & Authentication */}
        <div className="hidden md:flex items-center gap-4">
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
           <span className="text-2xl font-bold text-blue-600">Menu</span>
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
        </ul>
        <div className="mt-auto space-y-4">
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
