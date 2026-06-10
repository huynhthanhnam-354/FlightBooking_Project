import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import FlightSearchForm from '../components/FlightSearchForm'
import FlightCard from '../components/FlightCard'
import FlightCardSkeleton from '../components/FlightCardSkeleton'
import SpecialOffers from '../components/SpecialOffers'
import DatePriceSlider from '../components/DatePriceSlider'
import PriceRangeSlider from '../components/PriceRangeSlider'
import PriceTrendPredictor from '../components/PriceTrendPredictor'
import PricePredictor from '../components/PricePredictor'
import { MOCK_FLIGHTS } from '../data/mockFlights'
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

	// TanStack Query Configuration
	const { data: flights = [], isLoading: isQueryLoading, isError, error } = useQuery({
		queryKey: ['flights', searchParams],
		queryFn: async () => {
			const { from, to } = searchParams
			const fromLower = (from || '').toLowerCase()
			const toLower = (to || '').toLowerCase()
			
			// Simulate network delay
			await new Promise(resolve => setTimeout(resolve, 800))
			
			return MOCK_FLIGHTS.filter((f) => {
				const depart = (f.depart || '').toLowerCase()
				const arrive = (f.arrive || '').toLowerCase()
				return (fromLower ? depart.includes(fromLower) : true) && (toLower ? arrive.includes(toLower) : true)
			})
		},
		staleTime: 5 * 60 * 1000,
		retry: 2,
	})

	const [results, setResults] = useState([])
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
			setResults(flights)
		} else {
			setResults([])
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

			// stops filter
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

			// amenities filter
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

	const isLoading = isQueryLoading || isFiltering;

	return (
		<div className="dashboard-container">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<aside className="filters-panel lg:col-span-1">
					<div className="filter-card lg:sticky lg:top-24">
						<div className="filter-heading border-b border-slate-100 pb-2 mb-4">Bộ lọc</div>

						<div className="mb-6">
							<div className="text-sm font-bold text-slate-700 mb-3">Khoảng giá (VNĐ)</div>
							<div className="px-2">
								<PriceRangeSlider
									min={results.length ? priceBounds.min : fallbackBounds.min}
									max={results.length ? priceBounds.max : fallbackBounds.max}
									valueMin={results.length ? minPrice : fallbackBounds.min}
									valueMax={results.length ? maxPrice : fallbackBounds.max}
									onChangeMin={setMinPrice}
									onChangeMax={setMaxPrice}
									disabled={!results.length}
								/>
							</div>
							<div className="text-[11px] font-medium text-slate-500 mt-3 flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
								<span>{(results.length ? priceBounds.min : fallbackBounds.min).toLocaleString()}₫</span>
								<span className="text-slate-300">—</span>
								<span>{(results.length ? priceBounds.max : fallbackBounds.max).toLocaleString()}₫</span>
							</div>
						</div>

						{/* Special Offers block immediately after Price Filter */}
						<div className="mb-6 rounded-xl overflow-hidden border border-sky-100 shadow-sm">
							<SpecialOffers flights={MOCK_FLIGHTS} />
						</div>

						<div className="mb-6">
							<div className="text-sm font-bold text-slate-700 mb-3">Hãng hàng không</div>
							<div className="space-y-3">
								{AIRLINES.map(a => (
									<label key={a.code} className="flex items-center justify-between group cursor-pointer">
										<div className="flex items-center gap-3">
											<input 
												type="checkbox" 
												className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
												checked={selectedAirlines.includes(a.name)} 
												onChange={() => toggleAirline(a.name)} 
											/>
											<div className="flex items-center gap-2">
												<img src={a.logo} alt={a.name} className="w-6 h-6 rounded-full object-cover border border-slate-100 shadow-sm" />
												<span className="text-sm font-medium text-slate-600 group-hover:text-sky-600 transition-colors">{a.name}</span>
											</div>
										</div>
										<span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{a.code}</span>
									</label>
								))}
							</div>
						</div>

						<div className="mb-6">
							<div className="text-sm font-bold text-slate-700 mb-3">Số điểm dừng</div>
							<div className="space-y-2">
								<label className="flex items-center gap-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600" checked={selectedStops.includes('0')} onChange={() => setSelectedStops(prev => prev.includes('0') ? prev.filter(x => x !== '0') : [...prev, '0'])} /> 
									<span className="text-sm text-slate-600 group-hover:text-sky-600">Bay thẳng</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600" checked={selectedStops.includes('1')} onChange={() => setSelectedStops(prev => prev.includes('1') ? prev.filter(x => x !== '1') : [...prev, '1'])} /> 
									<span className="text-sm text-slate-600 group-hover:text-sky-600">1 điểm dừng</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600" checked={selectedStops.includes('2plus')} onChange={() => setSelectedStops(prev => prev.includes('2plus') ? prev.filter(x => x !== '2plus') : [...prev, '2plus'])} /> 
									<span className="text-sm text-slate-600 group-hover:text-sky-600">2+ điểm dừng</span>
								</label>
							</div>
						</div>

						<div className="mb-6">
							<div className="text-sm font-bold text-slate-700 mb-3">Tiện ích</div>
							<div className="space-y-2">
								<label className="flex items-center gap-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600" checked={selectedAmenities.includes('wifi')} onChange={() => setSelectedAmenities(prev => prev.includes('wifi') ? prev.filter(x => x !== 'wifi') : [...prev, 'wifi'])} /> 
									<span className="text-sm text-slate-600 group-hover:text-sky-600">Wifi</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600" checked={selectedAmenities.includes('meal')} onChange={() => setSelectedAmenities(prev => prev.includes('meal') ? prev.filter(x => x !== 'meal') : [...prev, 'meal'])} /> 
									<span className="text-sm text-slate-600 group-hover:text-sky-600">Suất ăn</span>
								</label>
							</div>
						</div>

						<div className="flex gap-2 pt-4 border-t border-slate-100">
							<button onClick={applyFilters} className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-sky-200">Áp dụng</button>
							<button onClick={resetFilters} className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors">Xoá</button>
						</div>
					</div>
				</aside>

				<main className="lg:col-span-3">
					<FlightSearchForm onSearch={handleSearch} />

					<div className="mt-6">
						<PricePredictor 
							from={searchParams.from || 'Hà Nội'} 
							to={searchParams.to || 'Hồ Chí Minh'}
							currentPrice={results.length > 0 ? Math.min(...results.map(f => f.price)) : 1250000}
						/>
					</div>

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
						{isError ? (
							<div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[32px] text-center">
								<h3 className="text-lg font-bold">Đã có lỗi xảy ra</h3>
								<p>{error?.message || 'Không thể tải danh sách chuyến bay.'}</p>
								<button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">Thử lại</button>
							</div>
						) : isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map(index => (
								<FlightCardSkeleton key={index} />
							))}
						</div>
					) : results.length === 0 ? (
							<div className="rounded-[32px] border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
								<div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-sky-500/10 text-4xl text-sky-600">✈️</div>
								<h2 className="text-2xl font-semibold text-slate-900 mb-3">Không tìm thấy chuyến bay phù hợp</h2>
								<p className="mx-auto max-w-xl text-slate-600 mb-6">Thử mở rộng ngày bay, điều chỉnh bộ lọc hoặc tìm các ngày khác để tìm chuyến bay tốt nhất cho bạn.</p>
								<div className="flex flex-col sm:flex-row justify-center gap-3">
									<button onClick={resetFilters} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">Xóa bộ lọc</button>
									<button onClick={searchAlternativeDates} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Tìm ngày khác</button>
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
