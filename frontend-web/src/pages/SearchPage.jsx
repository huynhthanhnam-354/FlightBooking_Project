import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import FlightSearchForm from '../components/FlightSearchForm'
import FlightCard from '../components/FlightCard'
import FlightCardSkeleton from '../components/FlightCardSkeleton'
import SpecialOffers from '../components/SpecialOffers'
import DatePriceSlider from '../components/DatePriceSlider'
import FilterSidebar from '../components/FilterSidebar'
import PriceTrendPredictor from '../components/PriceTrendPredictor'
import { useBookingStore } from '../store/bookingStore'

const AIRLINES = [
  { code: 'VN', name: 'Vietnam Airlines', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109c05?w=50&h=50&fit=crop' },
  { code: 'VJ', name: 'VietJet Air', logo: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=50&h=50&fit=crop' },
  { code: 'QH', name: 'Bamboo Airways', logo: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=50&h=50&fit=crop' },
  { code: 'VU', name: 'Vietravel Airlines', logo: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=50&h=50&fit=crop' },
  { code: 'BL', name: 'Pacific Airlines', logo: 'https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=50&h=50&fit=crop' }
];

function SearchPage() {
	const fallbackBounds = { min: 500000, max: 5000000 }
	const searchParams = useBookingStore((state) => state.searchParams)
	const setSearchParams = useBookingStore((state) => state.setSearchParams)

	// 1. DYNAMIC STATE FOR FLIGHTS, LOADING, AND ERROR
	const [flights, setFlights] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [results, setResults] = useState([])

	// 2. FETCH FLIGHTS FROM BACKEND API USING STANDARDIZED API SERVICE
	useEffect(() => {
		const fetchFlights = async () => {
			const { from, to, date } = searchParams
			// Prevent search if route is not specified
			if (!from || !to) return

			setIsLoading(true)
			setError(null)

			try {
				// 1. INTERCEPT & FORMAT DATE BOUNDARIES (ISO-8601)
				// Current 'date' is YYYY-MM-DD from <input type="date" />
				let start = null;
				let end = null;
				
				if (date) {
					start = `${date}T00:00:00`;
					end = `${date}T23:59:59`;
				}

				// 2. PASS FORMATTED BOUNDARIES AS QUERY PARAMETERS
				// Using the new API contract: departureAirport, arrivalAirport, start, end
				const response = await api.get(`/v1/flights/search`, {
					params: { 
						departureAirport: from, 
						arrivalAirport: to, 
						start, 
						end 
					}
				})

				// 3. HANDLE RESPONSE SAFELY
				const mappedFlights = response.data.map(f => {
					const depDate = new Date(f.departureAt)
					const arrDate = new Date(f.arrivalAt)
					
					return {
						...f,
						depart: depDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
						arrive: arrDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
						origin: f.departureAirport,
						destination: f.arrivalAirport,
						duration: f.durationMinutes ? `${Math.floor(f.durationMinutes / 60)}h ${f.durationMinutes % 60}m` : '2h 00m',
						amenities: f.premiumCabin ? ['wifi', 'meal'] : ['meal']
					}
				})

				setFlights(mappedFlights)
				setResults(mappedFlights)
			} catch (err) {
				console.error('API Fetch Error:', err)
				setError('Không thể kết nối tới máy chủ FlightBook. Vui lòng đảm bảo Backend (Port 8081) đang chạy.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchFlights()
	}, [searchParams])

	const [priceBounds, setPriceBounds] = useState(fallbackBounds)
	const [minPrice, setMinPrice] = useState(fallbackBounds.min)
	const [maxPrice, setMaxPrice] = useState(fallbackBounds.max)
	const [isFiltering, setIsFiltering] = useState(false)
	const [selectedAirlines, setSelectedAirlines] = useState([])
	const [selectedTimes, setSelectedTimes] = useState([])
	const [sortBy, setSortBy] = useState('best')
	const [selectedStops, setSelectedStops] = useState([])
	const [selectedAmenities, setSelectedAmenities] = useState([])
	const [selectedDate, setSelectedDate] = useState(null)

	useEffect(() => {
		if (flights.length > 0) {
			const prices = flights.map(f => Number(f.price) || 0)
			const min = Math.min(...prices)
			const max = Math.max(...prices)
			setPriceBounds({ min, max })
			setMinPrice(min)
			setMaxPrice(max)
		}
	}, [flights])

	const location = useLocation()

	const routeLabel = useMemo(() => {
		const from = searchParams.from || 'Hà Nội'
		const to = searchParams.to || 'Hồ Chí Minh'
		return `${from} → ${to}`
	}, [searchParams])

	useEffect(() => {
		if (location?.state?.initialSearch) {
			setSearchParams(location.state.initialSearch)
		}
	}, [location?.state?.initialSearch, setSearchParams])

	function applyFilters() {
		setIsFiltering(true)
		setTimeout(() => {
			let filtered = flights.filter(f => {
			const p = Number(f.price) || 0
			if (p < minPrice) return false
			if (p > maxPrice) return false
			if (selectedAirlines.length > 0 && !selectedAirlines.includes(f.airline)) return false

			if (selectedTimes.length > 0) {
				const hour = parseInt(String(f.depart).split(':')[0])
				const bucket = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening'
				if (!selectedTimes.includes(bucket)) return false
			}

			if (selectedStops.length > 0) {
				const stops = Number(f.stops || 0)
				const ok = selectedStops.some(s => {
					if (s === '0') return stops === 0
					if (s === '1') return stops === 1
					if (s === '2plus') return stops >= 2
					return false
				})
				if (!ok) return false
			}

			if (selectedAmenities.length > 0) {
				const hasAll = selectedAmenities.every(a => (f.amenities || []).includes(a))
				if (!hasAll) return false
			}

			return true
		})

		if (sortBy === 'priceAsc') filtered.sort((a, b) => a.price - b.price)
		if (sortBy === 'priceDesc') filtered.sort((a, b) => b.price - a.price)

		setResults(filtered)
		setIsFiltering(false)
	}, 380)
}

	function resetFilters() {
		setMinPrice(priceBounds.min)
		setMaxPrice(priceBounds.max)
		setSelectedAirlines([])
		setSelectedTimes([])
		setSortBy('best')
		setSelectedStops([])
		setSelectedAmenities([])
		setSelectedDate(null)
		setResults(flights)
	}

	function searchAlternativeDates() {
		setSearchParams({ from: '', to: '', date: '', passengers: 1 })
	}

	function toggleAirline(name) {
		setSelectedAirlines(prev => (prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]))
	}

	function handleSearch(criteria) {
		setSearchParams(criteria)
	}

	return (
		<div className="dashboard-container">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<aside className="lg:col-span-1">
					<FilterSidebar
						priceBounds={results.length ? priceBounds : fallbackBounds}
						minPrice={results.length ? minPrice : fallbackBounds.min}
						maxPrice={results.length ? maxPrice : fallbackBounds.max}
						onMinPriceChange={setMinPrice}
						onMaxPriceChange={setMaxPrice}
						airlines={AIRLINES}
						selectedAirlines={selectedAirlines}
						onToggleAirline={toggleAirline}
						selectedStops={selectedStops}
						onToggleStop={(value) => setSelectedStops(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value])}
						selectedAmenities={selectedAmenities}
						onToggleAmenity={(value) => setSelectedAmenities(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value])}
						onApply={applyFilters}
						onReset={resetFilters}
						disabled={!results.length}
					/>
				</aside>

				<main className="lg:col-span-3">
					<FlightSearchForm onSearch={handleSearch} />

					<div className="mt-6">
						<DatePriceSlider 
							flights={flights} 
							selectedDate={selectedDate}
							onSelect={setSelectedDate}
						/>
					</div>

					<div className="mt-6">
						<PriceTrendPredictor routeLabel={routeLabel} />
					</div>

					<div className="mt-4 flex items-center justify-between">
						<div className="text-sm small-note">Hiển thị {results.length} kết quả</div>
						<div className="flex items-center gap-3">
							<label className="text-sm small-note">Sắp xếp:</label>
							<select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border p-2 rounded">
								<option value="best">Phù hợp nhất</option>
								<option value="priceAsc">Giá tăng dần</option>
								<option value="priceDesc">Giá giảm dần</option>
							</select>
							<button onClick={applyFilters} className="px-3 py-2 border rounded">Áp dụng</button>
						</div>
					</div>

					<div className="mt-4 results-list">
						{/* 3. LOADING AND ERROR STATES */}
						{error ? (
							<div className="bg-red-50 border border-red-200 text-red-700 p-10 rounded-[32px] text-center animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
								<div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
								<h3 className="text-2xl font-black mb-3">Lỗi kết nối Backend</h3>
								<p className="max-w-md mx-auto font-medium text-red-600/70 leading-relaxed">{error}</p>
								<button 
									onClick={() => window.location.reload()} 
									className="mt-8 px-10 py-4 bg-red-600 text-white rounded-[20px] font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-95"
								>
									Thử lại ngay
								</button>
							</div>
						) : isLoading ? (
							<div className="space-y-4">
								{[1, 2, 3].map(index => (
									<FlightCardSkeleton key={index} />
								))}
							</div>
						) : results.length === 0 ? (
							<div className="rounded-[32px] border border-slate-200 bg-slate-50 p-16 text-center shadow-sm">
								<div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-sky-500/10 text-4xl text-sky-600">✈️</div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-3">Không tìm thấy chuyến bay</h2>
								<p className="mx-auto max-w-xl text-slate-600 mb-8 font-medium">Chúng tôi không tìm thấy chuyến bay nào cho hành trình này. Vui lòng thử lại với các tiêu chí khác.</p>
								<div className="flex flex-col sm:flex-row justify-center gap-4">
									<button onClick={resetFilters} className="rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-black text-white hover:bg-slate-800 transition shadow-lg active:scale-95">Xóa bộ lọc</button>
									<button onClick={searchAlternativeDates} className="rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-100 transition active:scale-95">Tìm ngày khác</button>
								</div>
							</div>
						) : (
							results.map(f => (
								<FlightCard key={f.id} flight={f} />
							))
						)}
					</div>
				</main>
			</div>
		</div>
	)
}

export default SearchPage
