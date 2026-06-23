import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMicrophone } from 'react-icons/fa'
import { AIRPORTS, airportSearchBlob, normalizeAirportSearchText } from '../data/airports'

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

function AirportSuggest({ query, onPick, excludeCode }) {
  const q = normalizeAirportSearchText(query || '')
  const results = AIRPORTS.filter(a => {
    if (excludeCode && a.code === excludeCode) return false
    if (!q) return true
    return airportSearchBlob(a).includes(q)
  }).slice(0, 10)

  if (!results.length) return (
    <div className="p-4 text-sm text-slate-500 italic">Không tìm thấy địa điểm phù hợp</div>
  )

  return (
    <ul className="max-h-60 overflow-y-auto divide-y divide-slate-50">
      {results.map((a) => (
        <li key={a.code}>
          <button type="button" onClick={() => onPick(a)} className="w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 group-hover:text-sky-700">{a.city}</span>
              <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded">{a.code}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{a.name || a.airport}</div>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function SearchBar({ onSearch, onInsightsChange, initialSearch }) {
  const navigate = useNavigate()
  const [searchMode, setSearchMode] = useState('classic')
  const [tripType, setTripType] = useState('roundtrip')
  const [from, setFrom] = useState('Hà Nội (HAN)')
  const [fromCode, setFromCode] = useState('HAN')
  const [to, setTo] = useState('Hồ Chí Minh (SGN)')
  const [toCode, setToCode] = useState('SGN')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [segments, setSegments] = useState([{ id: 1, from: '', to: '', date: '' }, { id: 2, from: '', to: '', date: '' }])
  const [aiQuery, setAiQuery] = useState('')

  const [showFromSuggest, setShowFromSuggest] = useState(false)
  const [showToSuggest, setShowToSuggest] = useState(false)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 })
  const [cabinClass, setCabinClass] = useState('economy')
  const [showPax, setShowPax] = useState(false)

  useEffect(() => {
    if (!initialSearch) return

    if (initialSearch.from) {
      setFrom(initialSearch.from)
      const code = (initialSearch.from.match(/\((.*?)\)/) || [])[1]
      if (code) setFromCode(code)
      setFromQuery('')
    }
    if (initialSearch.to) {
      setTo(initialSearch.to)
      const code = (initialSearch.to.match(/\((.*?)\)/) || [])[1]
      if (code) setToCode(code)
      setToQuery('')
    }
    if (initialSearch.departDate) {
      setDepartDate(initialSearch.departDate)
    }
    if (initialSearch.returnDate !== undefined && initialSearch.returnDate !== null) {
      setReturnDate(initialSearch.returnDate)
    }
    if (initialSearch.passengers) {
      const count = Number((initialSearch.passengers || '').match(/\d+/)?.[0] || 1)
      setPassengers((prev) => ({ ...prev, adults: Math.max(1, count) }))
    }
    if (initialSearch.cabinClass) {
      setCabinClass(initialSearch.cabinClass)
    }
  }, [initialSearch])

  useEffect(() => {
    onInsightsChange?.({
      tripType,
      from: fromQuery || from,
      to: toQuery || to,
      departDate,
      returnDate: tripType === 'oneway' ? null : returnDate,
      passengers,
      cabinClass,
      aiQuery: searchMode === 'ai' ? aiQuery : undefined,
      searchMode,
    })
  }, [tripType, from, to, fromQuery, toQuery, departDate, returnDate, passengers, cabinClass, aiQuery, searchMode, onInsightsChange])

  const fromRef = useRef(null)
  const toRef = useRef(null)
  const paxRef = useRef(null)

  useOutsideClick(fromRef, () => { setShowFromSuggest(false); setFromQuery('') })
  useOutsideClick(toRef, () => { setShowToSuggest(false); setToQuery('') })
  useOutsideClick(paxRef, () => setShowPax(false))

  const handlePickAirport = (setter, setCode, setQuery, setShow, a) => {
    setter(`${a.city} (${a.code})`)
    setCode(a.code)
    setQuery('')
    setShow(false)
  }

  function submit(e) {
    e.preventDefault()
    
    // Trích xuất mã IATA từ chuỗi (ví dụ: "Hà Nội (HAN)" -> "HAN")
    const getCode = (str, code) => {
      if (code) return code;
      const match = (str || "").match(/\((.*?)\)/);
      return match ? match[1] : str;
    };

    const payload = isAIMode
      ? { searchMode: 'ai', query: aiQuery, tripType, passengers, cabinClass }
      : { 
          tripType, 
          from: getCode(from, fromCode), 
          to: getCode(to, toCode), 
          date: departDate, // Đổi tên cho đồng bộ với SearchPage
          departDate, 
          returnDate: tripType === 'oneway' ? null : returnDate, 
          passengers: passengers.adults + passengers.children, 
          cabinClass 
        }
    navigate('/search', { state: { initialSearch: payload } })
  }

  function updateSegment(idx, field, value) {
    setSegments(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function addSegment() {
    setSegments(prev => prev.length >= 4 ? prev : [...prev, { id: Date.now(), from: '', to: '', date: '' }])
  }

  const isAIMode = searchMode === 'ai'

  return (
    <form onSubmit={submit} className="w-full bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-lg relative z-30">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button
          type="button"
          onClick={() => {
            setSearchMode('classic')
            setTripType('oneway')
          }}
          className={`px-4 py-2 rounded-full text-sm transition ${searchMode !== 'ai' && tripType === 'oneway' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >Một chiều</button>
        <button
          type="button"
          onClick={() => {
            setSearchMode('classic')
            setTripType('roundtrip')
          }}
          className={`px-4 py-2 rounded-full text-sm transition ${searchMode !== 'ai' && tripType === 'roundtrip' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >Khứ hồi</button>
        <button
          type="button"
          onClick={() => {
            setSearchMode('classic')
            setTripType('multicity')
          }}
          className={`px-4 py-2 rounded-full text-sm transition ${searchMode !== 'ai' && tripType === 'multicity' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >Đa chặng</button>
        <button
          type="button"
          onClick={() => setSearchMode('ai')}
          className={`ml-auto rounded-full px-4 py-2 text-sm font-semibold transition ${isAIMode ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_20px_60px_rgba(59,130,246,0.35)]' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          Tìm kiếm bằng AI ✨
        </button>
      </div>

      <div className="transition-all duration-500 ease-out">
        {isAIMode ? (
          <div className="relative mt-4">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ví dụ: Tìm vé khứ hồi đi Đà Nẵng từ Hà Nội cuối tuần sau..."
              className="w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 pr-16 text-slate-900 text-base outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <FaMicrophone className="h-5 w-5" />
            </div>
          </div>
        ) : (
          <div>
            {tripType !== 'multicity' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-1 relative" ref={fromRef}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Điểm đi</label>
                  <input
                    value={fromQuery || from}
                    onChange={(e) => { setFromQuery(e.target.value); setShowFromSuggest(true) }}
                    onFocus={() => setShowFromSuggest(true)}
                    placeholder="Chọn điểm đi"
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition font-medium"
                  />
                  {showFromSuggest && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[60] border border-slate-100 overflow-hidden">
                      <AirportSuggest 
                        query={fromQuery} 
                        excludeCode={toCode}
                        onPick={(a) => handlePickAirport(setFrom, setFromCode, setFromQuery, setShowFromSuggest, a)} 
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 relative" ref={toRef}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Điểm đến</label>
                  <input
                    value={toQuery || to}
                    onChange={(e) => { setToQuery(e.target.value); setShowToSuggest(true) }}
                    onFocus={() => setShowToSuggest(true)}
                    placeholder="Chọn điểm đến"
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition font-medium"
                  />
                  {showToSuggest && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[60] border border-slate-100 overflow-hidden">
                      <AirportSuggest 
                        query={toQuery} 
                        excludeCode={fromCode}
                        onPick={(a) => handlePickAirport(setTo, setToCode, setToQuery, setShowToSuggest, a)} 
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-slate-600">Ngày đi</label>
                  <input
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    type="date"
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs text-slate-600">Ngày về</label>
                  <input
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    type="date"
                    disabled={tripType === 'oneway'}
                    className={`w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition ${tripType === 'oneway' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Hành khách & Hạng</label>
                  <div className="relative" ref={paxRef}>
                    <button
                      type="button"
                      onClick={() => setShowPax(!showPax)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition"
                    >
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
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} className="p-1 rounded border">-</button>
                              <div className="w-8 text-center">{passengers.adults}</div>
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))} className="p-1 rounded border">+</button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Trẻ em</div>
                              <div className="text-xs text-slate-500">2-11 tuổi</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))} className="p-1 rounded border">-</button>
                              <div className="w-8 text-center">{passengers.children}</div>
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))} className="p-1 rounded border">+</button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Trẻ sơ sinh</div>
                              <div className="text-xs text-slate-500">Dưới 2 tuổi</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))} className="p-1 rounded border">-</button>
                              <div className="w-8 text-center">{passengers.infants}</div>
                              <button type="button" onClick={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))} className="p-1 rounded border">+</button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Hạng ghế</label>
                            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="w-full mt-2 border p-2 rounded">
                              <option value="economy">Phổ thông</option>
                              <option value="premium">Premium Economy</option>
                              <option value="business">Hạng thương gia</option>
                            </select>
                          </div>

                          <div className="flex justify-end">
                            <button type="button" onClick={() => setShowPax(false)} className="px-3 py-2 bg-slate-100 rounded">Xong</button>
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
                      <input value={s.from} onChange={e => updateSegment(idx, 'from', e.target.value)} placeholder="Điểm đi" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Đến</label>
                      <input value={s.to} onChange={e => updateSegment(idx, 'to', e.target.value)} placeholder="Điểm đến" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Ngày</label>
                      <input value={s.date} onChange={e => updateSegment(idx, 'date', e.target.value)} type="date" className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:shadow-sm transition" />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={() => setSegments(prev => prev.filter((_, i) => i !== idx))} className="px-4 py-2 bg-red-50 text-red-600 rounded">Xóa</button>
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
          </div>
        )}
      </div>
    </form>
  )
}
