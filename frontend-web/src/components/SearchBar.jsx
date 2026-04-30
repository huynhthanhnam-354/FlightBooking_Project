import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AIRPORTS } from '../data/airports'

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [ref, handler])
}

function AirportSuggest({ query, onPick }) {
  if (!query || query.length < 1) return null
  const q = query.trim().toLowerCase()
  const results = AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
  ).slice(0, 6)

  if (!results.length) return (
    <div className="p-2 text-sm text-slate-500">Không tìm thấy</div>
  )

  return (
    <ul className="divide-y">
      {results.map((a) => (
        <li key={a.code}>
          <button type="button" onClick={() => onPick(a)} className="w-full text-left p-2 hover:bg-slate-50">
            <div className="font-medium">{a.city} <span className="text-xs text-slate-400">({a.code})</span></div>
            <div className="text-xs text-slate-500">{a.name}</div>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function SearchBar() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState('roundtrip')
  const [from, setFrom] = useState('Hà Nội (HAN)')
  const [to, setTo] = useState('Hồ Chí Minh (SGN)')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [segments, setSegments] = useState([{ id: 1, from: '', to: '', date: '' }, { id: 2, from: '', to: '', date: '' }])

  const [showFromSuggest, setShowFromSuggest] = useState(false)
  const [showToSuggest, setShowToSuggest] = useState(false)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')

  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 })
  const [cabinClass, setCabinClass] = useState('economy')
  const [showPax, setShowPax] = useState(false)

  const fromRef = useRef(null)
  const toRef = useRef(null)
  const paxRef = useRef(null)

  useOutsideClick(fromRef, () => setShowFromSuggest(false))
  useOutsideClick(toRef, () => setShowToSuggest(false))
  useOutsideClick(paxRef, () => setShowPax(false))

  const handlePickAirport = (setter, codeCity, setQuery, a) => {
    setter(`${a.city} (${a.code})`)
    setQuery('')
    setShowFromSuggest(false)
    setShowToSuggest(false)
  }

  function submit(e) {
    e.preventDefault()
    const payload = { tripType, from, to, departDate, returnDate: tripType === 'oneway' ? null : returnDate, passengers, cabinClass }
    navigate('/search', { state: { initialSearch: payload } })
  }

  function updateSegment(idx, field, value) {
    setSegments(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function addSegment() {
    setSegments(prev => prev.length >= 4 ? prev : [...prev, { id: Date.now(), from: '', to: '', date: '' }])
  }

  return (
    <form onSubmit={submit} className="bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-lg max-w-4xl mx-auto">
      <div className="flex gap-2 items-center mb-4">
        <button type="button" onClick={() => setTripType('oneway')} className={`px-4 py-2 rounded-full text-sm ${tripType==='oneway' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Một chiều</button>
        <button type="button" onClick={() => setTripType('roundtrip')} className={`px-4 py-2 rounded-full text-sm ${tripType==='roundtrip' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Khứ hồi</button>
        <button type="button" onClick={() => setTripType('multicity')} className={`px-4 py-2 rounded-full text-sm ${tripType==='multicity' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Đa chặng</button>
      </div>

      {tripType !== 'multicity' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="text-xs text-slate-600">Điểm đi</label>
            <div className="relative" ref={fromRef}>
              <input value={fromQuery || from} onChange={(e)=>{ setFromQuery(e.target.value); setShowFromSuggest(true) }} onFocus={() => setShowFromSuggest(true)} placeholder="Điểm đi" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
              {showFromSuggest && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 border">
                  <AirportSuggest query={fromQuery} onPick={(a) => handlePickAirport(setFrom, a, setFromQuery, a)} />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-slate-600">Điểm đến</label>
            <div className="relative" ref={toRef}>
              <input value={toQuery || to} onChange={(e)=>{ setToQuery(e.target.value); setShowToSuggest(true) }} onFocus={() => setShowToSuggest(true)} placeholder="Điểm đến" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
              {showToSuggest && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 border">
                  <AirportSuggest query={toQuery} onPick={(a) => handlePickAirport(setTo, a, setToQuery, a)} />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-slate-600">Ngày đi</label>
            <input value={departDate} onChange={e=>setDepartDate(e.target.value)} type="date" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-slate-600">Ngày về</label>
            <input value={returnDate} onChange={e=>setReturnDate(e.target.value)} type="date" disabled={tripType==='oneway'} className={`w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition ${tripType==='oneway' ? 'opacity-50 cursor-not-allowed' : ''}`} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600">Hành khách & Hạng</label>
            <div className="relative" ref={paxRef}>
              <button type="button" onClick={()=>setShowPax(!showPax)} className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition">
                <div>{passengers.adults + passengers.children} hành khách · {cabinClass === 'economy' ? 'Phổ thông' : cabinClass === 'premium' ? 'Premium' : 'Thương gia'}</div>
                <div className="text-slate-400">Thay đổi</div>
              </button>

              {showPax && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-3 z-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Người lớn</div>
                        <div className="text-xs text-slate-500">Từ 12 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={()=>setPassengers(p => ({...p, adults: Math.max(1, p.adults-1)}))} className="p-1 rounded border">-</button>
                        <div className="w-8 text-center">{passengers.adults}</div>
                        <button type="button" onClick={()=>setPassengers(p => ({...p, adults: p.adults+1}))} className="p-1 rounded border">+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Trẻ em</div>
                        <div className="text-xs text-slate-500">2-11 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={()=>setPassengers(p => ({...p, children: Math.max(0, p.children-1)}))} className="p-1 rounded border">-</button>
                        <div className="w-8 text-center">{passengers.children}</div>
                        <button type="button" onClick={()=>setPassengers(p => ({...p, children: p.children+1}))} className="p-1 rounded border">+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Trẻ sơ sinh</div>
                        <div className="text-xs text-slate-500">Dưới 2 tuổi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={()=>setPassengers(p => ({...p, infants: Math.max(0, p.infants-1)}))} className="p-1 rounded border">-</button>
                        <div className="w-8 text-center">{passengers.infants}</div>
                        <button type="button" onClick={()=>setPassengers(p => ({...p, infants: p.infants+1}))} className="p-1 rounded border">+</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Hạng ghế</label>
                      <select value={cabinClass} onChange={e=>setCabinClass(e.target.value)} className="w-full mt-2 border p-2 rounded">
                        <option value="economy">Phổ thông</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Hạng thương gia</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={()=>setShowPax(false)} className="px-3 py-2 bg-slate-100 rounded">Xong</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex items-end justify-end">
            <button type="submit" className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:shadow-md transition">Tìm chuyến</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((s, idx) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-600">Từ</label>
                <input value={s.from} onChange={e=>updateSegment(idx, 'from', e.target.value)} placeholder="Điểm đi" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
              </div>
              <div>
                <label className="text-xs text-slate-600">Đến</label>
                <input value={s.to} onChange={e=>updateSegment(idx, 'to', e.target.value)} placeholder="Điểm đến" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
              </div>
              <div>
                <label className="text-xs text-slate-600">Ngày</label>
                <input value={s.date} onChange={e=>updateSegment(idx, 'date', e.target.value)} type="date" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={()=>setSegments(prev=>prev.filter((_,i)=>i!==idx))} className="px-4 py-2 bg-red-50 text-red-600 rounded">Xóa</button>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button type="button" onClick={addSegment} className="px-4 py-2 bg-slate-100 rounded">Thêm chặng</button>
            <div className="ml-auto">
              <button type="submit" className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:shadow-md transition">Tìm chuyến</button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
