import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import ChatWidget from './components/ChatWidget'
import BookingSeat from './pages/BookingSeat'
import BookingConfirmation from './pages/BookingConfirmation'
import CheckoutPage from './pages/CheckoutPage'
import BookingsPage from './pages/BookingsPage'
import MyFlightsPage from './pages/MyFlightsPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import RegisterPage from './pages/RegisterPage'
import PassengerForm from './pages/PassengerForm'
import ComboList from './pages/ComboList'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/combos" element={<ComboList />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-flights" element={<MyFlightsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/booking" element={<BookingSeat />} />
            <Route path="/booking/passenger" element={<PassengerForm />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Routes>
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App