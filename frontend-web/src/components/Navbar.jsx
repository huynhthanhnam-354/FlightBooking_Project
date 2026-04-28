import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
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
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-700">👤 {user.name}</span>
                <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Đăng xuất</button>
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