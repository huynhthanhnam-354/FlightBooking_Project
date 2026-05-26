import { useEffect, useMemo, useState } from 'react'
import { FaMicrophone } from 'react-icons/fa'
import { AIRPORTS } from '../data/airports'

const samplePrompt = 'Tìm vé khứ hồi Hà Nội đi Đà Nẵng giữa tháng sau cho 2 người...'

function normalizeText(text) {
  return text.trim().toLowerCase()
}

function findCitiesFromText(text) {
  const normalized = normalizeText(text)
  const matches = AIRPORTS.filter((airport) => {
    const cityLower = airport.city.toLowerCase()
    return normalized.includes(cityLower) || normalized.includes(airport.code.toLowerCase())
  })
  const unique = []
  const seen = new Set()
  for (const airport of matches) {
    if (!seen.has(airport.city)) {
      seen.add(airport.city)
      unique.push(airport.city)
    }
  }
  return unique
}

function capitalize(str) {
  return str
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function parseQuery(text) {
  const raw = normalizeText(text)
  const result = {
    from: '',
    to: '',
    date: '',
    passengers: '1 người',
    tripType: 'Khứ hồi',
  }

  if (/một chiều|1 chiều|one way|one-way|oneway/.test(raw)) {
    result.tripType = 'Một chiều'
  }

  if (/khứ hồi|return/.test(raw)) {
    result.tripType = 'Khứ hồi'
  }

  const cities = findCitiesFromText(raw)
  if (cities.length >= 1) result.from = cities[0]
  if (cities.length >= 2) result.to = cities[1]

  const routeMatch = raw.match(/(?:từ\s*)?([\p{L}0-9\s]+?)\s+(?:đi|to)\s+([\p{L}0-9\s]+?)(?:\s|$)/u)
  if (routeMatch) {
    if (!result.from) result.from = capitalize(routeMatch[1].trim())
    if (!result.to) result.to = capitalize(routeMatch[2].trim())
  }

  const passengerMatch = raw.match(/(\d+)\s*(?:người|hành khách|khách)/)
  if (passengerMatch) {
    result.passengers = `${passengerMatch[1]} người`
  }

  const datePatterns = [
    { regex: /giữa tháng sau/, value: 'Giữa tháng sau' },
    { regex: /cuối tháng sau/, value: 'Cuối tháng sau' },
    { regex: /đầu tháng sau/, value: 'Đầu tháng sau' },
    { regex: /tháng\s*(\d{1,2})/, value: (m) => `Tháng ${m[1]}` },
    { regex: /ngày\s*(\d{1,2})/, value: (m) => `Ngày ${m[1]}` },
  ]

  for (const pattern of datePatterns) {
    const match = raw.match(pattern.regex)
    if (match) {
      result.date = typeof pattern.value === 'function' ? pattern.value(match) : pattern.value
      break
    }
  }

  return result
}

export default function AIFlightSearch({ onParse }) {
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [parsed, setParsed] = useState({ from: '', to: '', date: '', passengers: '1 người', tripType: 'Khứ hồi' })

  useEffect(() => {
    const parsedResult = parseQuery(query || samplePrompt)
    setParsed(parsedResult)
    onParse?.(parsedResult)
  }, [query, onParse])

  const fields = useMemo(() => [
    { title: 'From', value: parsed.from || 'Hà Nội', hint: 'Điểm khởi hành' },
    { title: 'To', value: parsed.to || 'Đà Nẵng', hint: 'Điểm đến' },
    { title: 'Date', value: parsed.date || 'Giữa tháng sau', hint: 'Thời gian bay' },
    { title: 'Passenger', value: parsed.passengers || '2 người', hint: 'Số hành khách' },
  ], [parsed])

  const statusText = listening ? 'Đang lắng nghe giọng nói...' : 'Nhập yêu cầu tự nhiên để AI hiểu hành trình của bạn.'

  return (
    <section className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-600 font-semibold">Tìm chuyến bay bằng AI</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Nhập một câu lệnh. AI sẽ chuyển hoá thành lịch trình.</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Phân tích tự động nhu cầu của bạn và chuẩn bị thông tin cho tìm chuyến đi.</p>
        </div>
        <div className="rounded-full bg-sky-100/70 px-4 py-3 text-sm font-medium text-sky-700 shadow-sm ring-1 ring-sky-200">Giải thích câu lệnh thành: Từ, Đến, Ngày, Hành khách</div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={samplePrompt}
            className="w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 pr-16 text-slate-900 text-base outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setListening((value) => !value)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full transition ${listening ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
            aria-label="Voice command"
          >
            <FaMicrophone className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500">{statusText}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <div key={field.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{field.title}</p>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">AI</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-900 leading-tight">{field.value}</p>
            <p className="mt-2 text-sm text-slate-500">{field.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
