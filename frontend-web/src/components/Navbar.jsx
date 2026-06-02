import { useAuth } from '../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const hideNav = location.pathname.includes('dashboard') || location.pathname.includes('admin')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 text-sky-600 font-bold text-xl">
              <span className="text-2xl">✈️</span>
              <span>Flight Booking</span>
            </Link>

            {!hideNav && (
              <nav className="hidden md:flex gap-6 text-slate-700 font-medium">
                <Link to="/" className="hover:text-sky-600 transition">Trang chủ</Link>
                <Link to="/booking" className="hover:text-sky-600 transition">Vé máy bay</Link>
                <Link to="/combos" className="hover:text-sky-600 transition">Combo</Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 pr-4 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    {user.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{user.role === 'admin' ? 'Quản trị viên' : 'Hành khách'}</span>
                  </div>
                  <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden z-50 py-2">
                    <div className="px-4 py-2 border-bottom border-slate-50 mb-1">
                      <p className="text-xs text-slate-400">Tài khoản</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/user-dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      User Dashboard
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Chuyến bay của tôi
                    </Link>
                    <div className="h-px bg-slate-100 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3 py-1 text-sm text-slate-700 hover:text-sky-600">Đăng nhập</Link>
                <Link to="/register" className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar