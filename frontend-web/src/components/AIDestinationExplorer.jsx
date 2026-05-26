import { useMemo, useState } from 'react'
import { FaMapMarkerAlt, FaBolt, FaLeaf, FaStar, FaSun } from 'react-icons/fa'

const filters = [
  { key: 'sunny', label: 'Tìm nơi có thời tiết đẹp nhất', icon: FaSun },
  { key: 'cheap', label: 'Điểm đến tiết kiệm nhất tuần này', icon: FaBolt },
  { key: 'secret', label: 'Địa điểm bí mật ít người biết', icon: FaStar },
]

const destinations = [
  {
    id: 'dn',
    city: 'Đà Nẵng',
    badge: 'Gần biển',
    price: '1.690.000₫',
    weather: 'Nắng nhẹ',
    description: 'Bãi biển Mỹ Khê và ẩm thực hải sản.',
    category: 'sunny',
    coords: { x: '72%', y: '32%' },
  },
  {
    id: 'hn',
    city: 'Hà Nội',
    badge: 'Văn hoá',
    price: '1.290.000₫',
    weather: 'Trời se lạnh',
    description: 'Phố cổ, cà phê trứng và hồ Hoàn Kiếm.',
    category: 'secret',
    coords: { x: '22%', y: '18%' },
  },
  {
    id: 'hq',
    city: 'Hạ Long',
    badge: 'Thiên nhiên',
    price: '1.520.000₫',
    weather: 'Mát mẻ',
    description: 'Vịnh đẹp và trải nghiệm du thuyền.',
    category: 'sunny',
    coords: { x: '45%', y: '28%' },
  },
  {
    id: 'pm',
    city: 'Phú Quốc',
    badge: 'Biển đảo',
    price: '2.450.000₫',
    weather: 'Nắng ấm',
    description: 'Hòn đảo thư giãn với bãi cát trắng.',
    category: 'cheap',
    coords: { x: '70%', y: '72%' },
  },
  {
    id: 'hnm',
    city: 'Huế',
    badge: 'Di sản',
    price: '1.130.000₫',
    weather: 'Mát dịu',
    description: 'Cố đô với lăng tẩm và ẩm thực cung đình.',
    category: 'secret',
    coords: { x: '42%', y: '50%' },
  },
]

function FilterButton({ filter, active, onClick }) {
  const Icon = filter.icon
  return (
    <button
      type="button"
      onClick={() => onClick(filter.key)}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {filter.label}
    </button>
  )
}

function MapPin({ city, price, coords, active }) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 text-xs font-semibold text-white shadow-lg ${
        active ? 'bg-sky-600 border-white' : 'bg-slate-700/90 border-slate-200'
      }`}
      style={{ left: coords.x, top: coords.y }}
    >
      <div className="flex items-center gap-1">
        <FaMapMarkerAlt className="h-3.5 w-3.5" />
        <span>{city}</span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-200">{price}</div>
    </div>
  )
}

export default function AIDestinationExplorer() {
  const [activeFilter, setActiveFilter] = useState('sunny')
  const [hovered, setHovered] = useState(destinations[0].id)

  const filtered = useMemo(() => destinations.filter((item) => item.category === activeFilter), [activeFilter])
  const selected = destinations.find((item) => item.id === hovered) || filtered[0]

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 rounded-[40px] border border-slate-200/80 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-900/40 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.25)] text-white overflow-hidden">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 p-8 backdrop-blur-2xl shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.15),_transparent_30%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80 font-semibold">Khám phá điểm đến cùng AI</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Giá thấp nhất từ Hà Nội đến các điểm du lịch Việt Nam</h2>
              <p className="text-sm sm:text-base text-slate-300/95">
                Lọc nhanh theo tâm trạng: đi tìm nắng đẹp, tiết kiệm ngân sách hoặc vùng bí mật chưa nhiều người biết.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {filters.map((filter) => (
                  <FilterButton key={filter.key} filter={filter} active={activeFilter === filter.key} onClick={setActiveFilter} />
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80 font-semibold">Từ vị trí hiện tại</p>
              <div className="mt-4 text-lg font-semibold text-white">Hà Nội</div>
              <div className="mt-3 grid gap-3 text-sm text-slate-300">
                <div className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">
                  <div className="font-semibold">Xu hướng tuần này</div>
                  <div className="mt-1 text-sky-300">Giảm giá 12% cho chuyến bay nội địa</div>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-3 border border-white/10">
                  <div className="font-semibold">Thời tiết đẹp nhất</div>
                  <div className="mt-1 text-emerald-300">Đà Nẵng và Hạ Long</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="relative h-[320px] md:h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(45deg,_rgba(14,165,233,0.12),_transparent_40%)]" />
              <div className="relative z-10 h-full">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_30%)]" />
                <div className="absolute inset-x-8 top-8 h-0.5 bg-gradient-to-r from-sky-300/70 via-transparent to-sky-300/0" />
                {destinations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onMouseEnter={() => setHovered(location.id)}
                    onFocus={() => setHovered(location.id)}
                    className="absolute"
                    style={{ left: location.coords.x, top: location.coords.y }}
                    aria-label={`Điểm đến ${location.city}`}
                  >
                    <MapPin city={location.city} price={location.price} coords={location.coords} active={hovered === location.id} />
                  </button>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/95 to-transparent" />
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setHovered(item.id)}
                  onFocus={() => setHovered(item.id)}
                  className={`w-full rounded-[28px] border px-5 py-4 text-left transition ${
                    hovered === item.id ? 'border-sky-400 bg-slate-950/90 shadow-xl shadow-sky-500/10' : 'border-white/10 bg-slate-950/80 hover:border-slate-200 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-white">{item.city}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.badge}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-sky-300">{item.price}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{item.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1">
                      <FaLeaf className="h-3 w-3 text-emerald-300" /> {item.weather}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1">
                      <FaBolt className="h-3 w-3 text-sky-300" /> Giá hot
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
