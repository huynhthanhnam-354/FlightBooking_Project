import React, { useState } from 'react'
import FlightSearchForm from '../components/FlightSearchForm'
import FlightCard from '../components/FlightCard'
import { MOCK_FLIGHTS } from '../data/mockFlights'

function SearchPage() {
	const [flights, setFlights] = useState(MOCK_FLIGHTS)

	function handleSearch(criteria) {
		const from = (criteria.from || '').toLowerCase()
		const to = (criteria.to || '').toLowerCase()
		const results = MOCK_FLIGHTS.filter(f => {
			const depart = (f.depart || '').toLowerCase()
			const arrive = (f.arrive || '').toLowerCase()
			return (from ? depart.includes(from) : true) && (to ? arrive.includes(to) : true)
		})
		setFlights(results)
	}

	function handleOpenDetails(flight) {
		// TODO: open modal or navigate to details page
		console.log('Open details for', flight)
	}

	return (
		<div className="p-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<FlightSearchForm onSearch={handleSearch} />

				<div className="grid gap-4">
					{flights.length === 0 && (
						<div className="text-center text-slate-500">Không tìm thấy chuyến nào.</div>
					)}
					{flights.map(f => (
						<FlightCard key={f.id} flight={f} onOpenDetails={handleOpenDetails} />
					))}
				</div>
			</div>
		</div>
	)
}

export default SearchPage
