import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>✈️ Flight Booking</h1>
        <ul className="nav-menu">
          <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>Trang chủ</a></li>
          <li><a href="/search" onClick={(e) => { e.preventDefault(); navigate('/search') }}>Tìm kiếm</a></li>
          <li><a href="/bookings" onClick={(e) => { e.preventDefault(); navigate('/bookings') }}>Đặt vé</a></li>
          {user ? (
            <li className="user-section">
              <span className="user-name">👤 {user.name}</span>
              <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
            </li>
          ) : (
            <li><button onClick={handleLoginClick} className="btn-login">Đăng nhập</button></li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar