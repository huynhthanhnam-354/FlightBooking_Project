import FlightSearchForm from '../components/FlightSearchForm'

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Tìm kiếm chuyến bay</h1>
        <p>Đặt vé máy bay nhanh chóng và dễ dàng</p>
      </div>
      <FlightSearchForm />
    </div>
  )
}

export default HomePage