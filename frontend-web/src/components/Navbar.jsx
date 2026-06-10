import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

/**
 * Navbar component for FlightBook AI
 * Following Senior Frontend standards: Semantic HTML, Pixel-perfect alignment, and Modern UX.
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Change background on scroll for a "Glassmorphism" effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Chuyến bay', path: '/booking' },
    { name: 'Combo du lịch', path: '/combos' },
    { name: 'Hỗ trợ', path: '/support' },
  ];

  const isActive = (path) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-premium py-3' 
          : isHomePage ? 'bg-transparent py-5' : 'bg-white shadow-sm py-3'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-large flex items-center justify-between">
        
        {/* Left: Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand-primary rounded-soft-lg flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform duration-300">
            <FaPlane className="text-white text-lg rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-black tracking-tighter leading-none ${
              !isScrolled && isHomePage ? 'text-white' : 'text-brand-primary'
            }`}>
              Flight<span className="text-brand-secondary"> Booking</span>
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              !isScrolled && isHomePage ? 'text-white/60' : 'text-slate-400'
            }`}>Premium Travel</span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-all duration-300 relative py-2 group ${
                  isScrolled || !isHomePage
                    ? isActive(link.path) ? 'text-brand-primary' : 'text-slate-600 hover:text-brand-primary'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
                {/* Modern active indicator line */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-secondary transition-all duration-300 ${
                  isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: CTA Section */}
        <div className="hidden md:flex items-center gap-small">
          <Link 
            to="/login" 
            className={`px-6 py-2.5 text-sm font-medium transition-all duration-300 rounded-soft-sm ${
              isScrolled || !isHomePage ? 'text-slate-700 hover:text-brand-primary hover:bg-slate-50' : 'text-white hover:bg-white/10'
            }`}
          >
            Đăng nhập
          </Link>
          <Link 
            to="/register" 
            className="px-6 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-soft-sm shadow-premium hover:bg-brand-primary/90 hover:-translate-y-0.5 transition-all duration-300"
          >
            Đăng ký
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-slate-800 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-[90] flex flex-col p-10 transition-all duration-500 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex justify-between items-center mb-10">
           <span className="text-2xl font-black text-brand-primary">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)}><FaTimes size={28} /></button>
        </div>
        <ul className="space-y-6">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-black ${isActive(link.path) ? 'text-brand-secondary' : 'text-slate-800'}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-4">
          <Link 
            to="/login" 
            className="block w-full py-4 text-center font-bold text-slate-800 border-2 border-slate-100 rounded-soft-lg"
          >
            Đăng nhập
          </Link>
          <Link 
            to="/register" 
            className="block w-full py-4 text-center font-bold text-white bg-brand-primary rounded-soft-lg"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
