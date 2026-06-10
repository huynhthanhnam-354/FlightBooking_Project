import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import AIInsightsWidget from '../components/AIInsightsWidget'
import AIDestinationExplorer from '../components/AIDestinationExplorer'
import SpecialDeals from '../components/SpecialDeals'

const DESTINATIONS = [
  {
    id: 1,
    name: 'Vịnh Hạ Long',
    description: 'Khám phá kỳ quan thiên nhiên thế giới',
    price: '1.290.000₫',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Đà Nẵng',
    description: 'Thành phố của những cây cầu',
    price: '890.000₫',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Hà Nội',
    description: 'Nét đẹp nghìn năm văn hiến',
    price: '1.050.000₫',
    image: 'https://images.unsplash.com/photo-1555661530-68c8e98db4e6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Phú Quốc',
    description: 'Thiên đường đảo ngọc',
    price: '1.450.000₫',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=600&q=80'
  }
]

function HomePage() {
  const heroImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'
  const [searchContext, setSearchContext] = useState(null)

  return (
    <div className="w-full">
      <section className="relative overflow-hidden min-h-[650px] flex items-center">
        {/* Background Image with optimized black matte overlays */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="max-w-3xl text-white mb-8 animate-in fade-in slide-in-from-left-4 duration-1000">
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
              Tìm chuyến bay giá tốt — <span className="text-brand-secondary">Nhanh chóng</span> và tin cậy
            </h1>
            <p className="text-lg lg:text-2xl text-slate-100 opacity-90 max-w-xl leading-relaxed">
              So sánh giá, đặt vé và quản lý hành trình của bạn ở cùng một nơi với sự hỗ trợ của AI.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SearchBar onInsightsChange={setSearchContext} />
            </div>
            <div className="lg:col-span-4 h-full">
              <AIInsightsWidget searchContext={searchContext} />
            </div>
          </div>
        </div>
      </section>

      <AIDestinationExplorer />

      <SpecialDeals />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-slate-800 tracking-tight">Gợi ý cho bạn</h2>
          <p className="text-sm sm:text-base text-slate-600">Khám phá hành trình phổ biến và ưu đãi hấp dẫn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest) => (
            <div 
              key={dest.id}
              className="group relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 bg-white cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-lg mb-1">{dest.name}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-1">{dest.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Giá chỉ từ</span>
                  <span className="font-semibold text-sky-600 text-sm">{dest.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage