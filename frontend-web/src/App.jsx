import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import BookingConfirmation from './pages/BookingConfirmation'
import BookingSeat from './pages/BookingSeat'
import ComboList from './pages/ComboList'
import PassengerForm from './pages/PassengerForm'
import CheckoutPage from './pages/CheckoutPage'
import ChatWidget from './components/ChatWidget'
import SupportPage from './pages/SupportPage'
import CheckInPage from './pages/CheckInPage'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/booking" element={<SearchPage />} />
              <Route path="/booking/seat" element={<BookingSeat />} />
              <Route path="/booking/passenger" element={<PassengerForm />} />
              <Route path="/booking/checkout" element={<CheckoutPage />} />
              <Route path="/booking/confirmation" element={<BookingConfirmation />} />
              <Route path="/combos" element={<ComboList />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
