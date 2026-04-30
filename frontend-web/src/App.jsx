import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import ChatWidget from './components/ChatWidget'
import BookingPage from './pages/BookingPage'
import BookingConfirmation from './pages/BookingConfirmation'
import CheckoutPage from './pages/CheckoutPage'
import BookingsPage from './pages/BookingsPage'
import MyFlightsPage from './pages/MyFlightsPage'
import NotificationsPage from './pages/NotificationsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-flights" element={<MyFlightsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          </Routes>
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App