import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import FlightSearchForm from '../components/FlightSearchForm'
import FlightCard from '../components/FlightCard'
import FlightCardSkeleton from '../components/FlightCardSkeleton'
import SpecialOffers from '../components/SpecialOffers'
import DatePriceSlider from '../components/DatePriceSlider'
import PriceRangeSlider from '../components/PriceRangeSlider'
import PriceTrendPredictor from '../components/PriceTrendPredictor'
import { MOCK_FLIGHTS } from '../data/mockFlights'

function SearchPage() {
	const fallbackBounds = { min: 500000, max: 5000000 }
	const [allFlights, setAllFlights] = useState(MOCK_FLIGHTS)
	const [results, setResults] = useState(MOCK_FLIGHTS)
	const [priceBounds, setPriceBounds] = useState(fallbackBounds)
	const [minPrice, setMinPrice] = useState(fallbackBounds.min)
	const [maxPrice, setMaxPrice] = useState(fallbackBounds.max)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedAirlines, setSelectedAirlines] = useState([])
	const [selectedTimes, setSelectedTimes] = useState([])
	const [sortBy, setSortBy] = useState('best')
	const [selectedStops, setSelectedStops] = useState([])
	const [selectedAmenities, setSelectedAmenities] = useState([])
	const [selectedDate, setSelectedDate] = useState(null)

	useEffect(() => {
		const prices = MOCK_FLIGHTS.map(f => Number(f.price) || 0)
		const min = Math.min(...prices)
		const max = Math.max(...prices)
		setPriceBounds({ min, max })
		setMinPrice(min)
		setMaxPrice(max)
		setAllFlights(MOCK_FLIGHTS)
		setResults(MOCK_FLIGHTS)
	}, [])

	const airlines = useMemo(() => Array.from(new Set(MOCK_FLIGHTS.map(f => f.airline))), [])

	const location = useLocation()

	const routeLabel = useMemo(() => {
		const search = location?.state?.initialSearch || {}
		const from = search.from || 'Hà Nội'
		const to = search.to || 'Hồ Chí Minh'
		return `${from} → ${to}`
	}, [location?.state?.initialSearch])

	useEffect(() => {
		if (location?.state?.initialSearch) {
			try {
				// apply initial search coming from hero
				handleSearch(location.state.initialSearch)
			} catch (e) {
				// ignore
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location?.state?.initialSearch])

	function applyFilters() {
		setIsLoading(true)
		setTimeout(() => {
			const source = allFlights
			let filtered = source.filter(f => {
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
		setIsLoading(false)
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
		setResults(allFlights)
	}

	function searchAlternativeDates() {
		setAllFlights(MOCK_FLIGHTS)
		setResults(MOCK_FLIGHTS)
		setPriceBounds(fallbackBounds)
		setMinPrice(fallbackBounds.min)
		setMaxPrice(fallbackBounds.max)
		setSelectedAirlines([])
		setSelectedTimes([])
		setSelectedStops([])
		setSelectedAmenities([])
		setSelectedDate(null)
		setSortBy('best')
	}

	function toggleAirline(name) {
		setSelectedAirlines(prev => (prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]))
	}

	function toggleTime(bucket) {
		setSelectedTimes(prev => (prev.includes(bucket) ? prev.filter(x => x !== bucket) : [...prev, bucket]))
	}

	function toggleStops(key) {
		setSelectedStops(prev => (prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]))
	}

	function toggleAmenity(key) {
		setSelectedAmenities(prev => (prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]))
	}

	function handleSearch(criteria) {
		setIsLoading(true)
		setTimeout(() => {
			const from = (criteria.from || '').toLowerCase()
			const to = (criteria.to || '').toLowerCase()
			const results = MOCK_FLIGHTS.filter(f => {
			const depart = (f.depart || '').toLowerCase()
			const arrive = (f.arrive || '').toLowerCase()
			return (from ? depart.includes(from) : true) && (to ? arrive.includes(to) : true)
		})

		setAllFlights(results)
		setResults(results)

		const prices = results.map(f => Number(f.price) || 0)
		const hasFlights = results.length > 0
		const min = hasFlights ? Math.min(...prices) : fallbackBounds.min
		const max = hasFlights ? Math.max(...prices) : fallbackBounds.max
		setPriceBounds({ min, max })
		setMinPrice(min)
		setMaxPrice(max)
		setIsLoading(false)
	}, 420)
}

	return (
		<div className="dashboard-container">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<aside className="filters-panel lg:col-span-1">
					<div className="filter-card sticky top-20">
						<div className="filter-heading">Bộ lọc</div>

						<div className="mb-4">
							<div className="text-sm font-medium">Giá (VNĐ)</div>
							<div className="mt-2">
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
						<div className="text-sm small-note mt-2">Khoảng giá: {(results.length ? priceBounds.min : fallbackBounds.min).toLocaleString()}₫ — {(results.length ? priceBounds.max : fallbackBounds.max).toLocaleString()}₫</div>					</div>

					<div className="mb-4">							<div className="text-sm font-medium">Hãng hàng không</div>
							<div className="mt-2 space-y-2">
								{airlines.map(a => (
									<label key={a} className="flex items-center gap-2">
										<input type="checkbox" checked={selectedAirlines.includes(a)} onChange={() => toggleAirline(a)} />
										<div className="flex items-center gap-2">
											<div className="w-8 h-8">
												{/* placeholder for logo */}
												<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">{a.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>
											</div>
											<span className="text-sm">{a}</span>
										</div>
									</label>
								))}
							</div>
						</div>

						<div className="mb-4">
							<div className="text-sm font-medium">Số điểm dừng</div>
							<div className="mt-2 space-y-1">
								<label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectedStops.includes('0')} onChange={() => toggleStops('0')} /> <span className="text-sm">Bay thẳng</span></label>
								<label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectedStops.includes('1')} onChange={() => toggleStops('1')} /> <span className="text-sm">1 điểm dừng</span></label>
								<label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectedStops.includes('2plus')} onChange={() => toggleStops('2plus')} /> <span className="text-sm">2+ điểm dừng</span></label>
							</div>

							<div className="mb-4 mt-3">
								<div className="text-sm font-medium">Tiện ích</div>
								<div className="mt-2 space-y-1">
									<label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectedAmenities.includes('wifi')} onChange={() => toggleAmenity('wifi')} /> <span className="text-sm">Wifi</span></label>
									<label className="inline-flex items-center gap-2"><input type="checkbox" checked={selectedAmenities.includes('meal')} onChange={() => toggleAmenity('meal')} /> <span className="text-sm">Suất ăn</span></label>
								</div>
							</div>
						</div>

						<div className="flex gap-2 mt-3">
							<button onClick={applyFilters} className="px-3 py-2 bg-sky-600 text-white rounded">Áp dụng</button>
							<button onClick={resetFilters} className="px-3 py-2 border rounded">Xoá</button>
						</div>
					</div>

					<div className="mt-4">
						<SpecialOffers flights={MOCK_FLIGHTS} />
					</div>
				</aside>

				<main className="lg:col-span-3">
					<FlightSearchForm onSearch={handleSearch} />

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
						{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4].map(index => (
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
