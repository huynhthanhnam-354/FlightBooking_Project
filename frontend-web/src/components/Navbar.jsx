import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 text-sky-600 font-bold text-xl">
              <span className="text-2xl">✈️</span>
              <span>Flight Booking</span>
            </Link>

            <nav className="hidden md:flex gap-4 text-slate-700">
              <Link to="/booking" className="hover:text-sky-600">Vé máy bay</Link>
              <Link to="#" className="hover:text-sky-600">Khách sạn</Link>
              <Link to="#" className="hover:text-sky-600">Combo</Link>
              <Link to="/admin-dashboard" className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 transition">Admin Dashboard</Link>
              <Link to="/user-dashboard" className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 transition">User Dashboard</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 hover:bg-slate-200 transition shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.role === 'admin' ? 'Administrator' : 'Traveler'}</span>
                  </div>
                  <FaChevronDown className={`text-slate-500 transition ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100 overflow-hidden">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin-dashboard"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/bookings"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                    )}
                    <Link
                      to="/user-dashboard"
                      className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-50"
                    >
                      Logout
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