import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 border-2 ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-blue-500'}`} />
      {filter.label}
    </button>
  )
}

function MapPin({ city, price, coords, active }) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 px-4 py-2 text-xs font-black transition-all duration-500 shadow-xl ${
        active 
          ? 'bg-blue-600 border-white text-white scale-110 z-20' 
          : 'bg-white border-slate-100 text-slate-900 scale-100 z-10'
      }`}
      style={{ left: coords.x, top: coords.y }}
    >
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className={active ? 'text-white' : 'text-blue-500'} />
        <span className="tracking-tight">{city}</span>
      </div>
      <div className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${active ? 'text-blue-100' : 'text-blue-600'}`}>
        {price}
      </div>
    </div>
  )
}

export default function AIDestinationExplorer() {
  const [activeFilter, setActiveFilter] = useState('sunny')
  const [hovered, setHovered] = useState(destinations[0].id)

  const filtered = useMemo(() => destinations.filter((item) => item.category === activeFilter), [activeFilter])
  
  return (
    <section className="w-full bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Content Area */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-8 md:p-12">
            
            {/* Header Section */}
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between mb-12">
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-4">
                    ✨ Khám phá cùng AI
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                    Gợi ý điểm đến <span className="text-blue-600">tốt nhất</span> dành riêng cho bạn
                  </h2>
                </div>
                <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
                  Dựa trên sở thích và xu hướng thực tế, chúng tôi tìm ra những hành trình tuyệt vời nhất từ Hà Nội đến khắp Việt Nam.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {filters.map((filter) => (
                    <FilterButton 
                      key={filter.key} 
                      filter={filter} 
                      active={activeFilter === filter.key} 
                      onClick={setActiveFilter} 
                    />
                  ))}
                </div>
              </div>

              {/* Status Mini Card */}
              <div className="w-full lg:max-w-sm rounded-[2.5rem] bg-slate-50 border border-slate-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí hiện tại</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">Hà Nội</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Xu hướng tuần</p>
                    <p className="text-sm font-bold text-slate-800">Giảm giá 12% nội địa</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Thời tiết đẹp</p>
                    <p className="text-sm font-bold text-slate-800">Đà Nẵng & Hạ Long</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizer Grid */}
            <div className="grid gap-10 lg:grid-cols-12 items-stretch">
              
              {/* Left: Map Box */}
              <div className="lg:col-span-8 relative min-h-[450px] rounded-[3rem] bg-slate-50 border border-slate-100 overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-40 pointer-events-none" 
                     style={{backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 0)', backgroundSize: '30px 30px'}} />
                
                <div className="relative z-10 h-full p-8">
                  {destinations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onMouseEnter={() => setHovered(location.id)}
                      onFocus={() => setHovered(location.id)}
                      className="absolute transition-all duration-300"
                      style={{ left: location.coords.x, top: location.coords.y }}
                    >
                      <MapPin city={location.city} price={location.price} coords={location.coords} active={hovered === location.id} />
                    </button>
                  ))}
                  
                  {/* Decorative Elements */}
                  <div className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Live Price Matrix
                  </div>
                </div>
              </div>

              {/* Right: Destination Pricing List */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {filtered.map((item) => {
                  const isActive = hovered === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setHovered(item.id)}
                      onFocus={() => setHovered(item.id)}
                      className={`w-full rounded-[2rem] border p-6 text-left transition-all duration-500 group ${
                        isActive 
                          ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/5 -translate-x-2' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{item.city}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.badge}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          {item.price}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                          <FaLeaf className="h-3 w-3 text-emerald-500" /> {item.weather}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-slate-100">
                          <FaBolt className="h-3 w-3" /> Giá hot
                        </span>
                      </div>
                    </button>
                  );
                })}
                
                {/* Empty State / More link */}
                <Link to="/search" className="mt-auto group flex items-center justify-center gap-3 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all font-bold text-sm uppercase tracking-widest">
                  Xem thêm {destinations.length - filtered.length} điểm đến
                  <FaStar className="group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
