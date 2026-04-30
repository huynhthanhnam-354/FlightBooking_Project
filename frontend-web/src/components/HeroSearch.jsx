import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeroSearch() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState('roundtrip')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)

  function onSearch(e) {
    e.preventDefault()
    const payload = { tripType, from, to, departDate, returnDate: tripType === 'oneway' ? null : returnDate, passengers }
    navigate('/search', { state: { initialSearch: payload } })
  }

  return (
    <form onSubmit={onSearch} className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex gap-2 items-center mb-3">
        <button type="button" onClick={() => setTripType('roundtrip')} className={`px-3 py-1 rounded ${tripType==='roundtrip' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Khứ hồi</button>
        <button type="button" onClick={() => setTripType('oneway')} className={`px-3 py-1 rounded ${tripType==='oneway' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Một chiều</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Điểm đi</label>
          <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Hà Nội (HAN)" className="w-full border p-2 rounded" />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Điểm đến</label>
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="Hồ Chí Minh (SGN)" className="w-full border p-2 rounded" />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Ngày đi</label>
          <input value={departDate} onChange={e => setDepartDate(e.target.value)} type="date" className="w-full border p-2 rounded" />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Ngày về</label>
          <input value={returnDate} onChange={e => setReturnDate(e.target.value)} type="date" disabled={tripType==='oneway'} className={`w-full border p-2 rounded ${tripType==='oneway' ? 'opacity-50' : ''}`} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-600">Hành khách</label>
          <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="w-full border p-2 rounded">
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} hành khách</option>)}
          </select>
        </div>

        <div className="md:col-span-2 flex items-end justify-end">
          <button type="submit" className="w-full md:w-auto px-6 py-3 bg-sky-600 text-white rounded font-semibold">Tìm chuyến</button>
        </div>
      </div>
    </form>
  )
}
