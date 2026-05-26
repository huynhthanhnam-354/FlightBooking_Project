import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import AIInsightsWidget from '../components/AIInsightsWidget'
import AIDestinationExplorer from '../components/AIDestinationExplorer'

function HomePage() {
  const heroImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'
  const [searchContext, setSearchContext] = useState(null)

  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-10 max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Tìm chuyến bay giá tốt — Nhanh chóng và tin cậy</h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90">So sánh giá, đặt vé và quản lý hành trình của bạn ở cùng một nơi.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SearchBar onInsightsChange={setSearchContext} />
            </div>
            <div className="lg:col-span-1">
              <AIInsightsWidget searchContext={searchContext} />
            </div>
          </div>
        </div>
      </section>

      <AIDestinationExplorer />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Gợi ý cho bạn</h2>
        <p className="text-sm sm:text-base text-slate-600">Khám phá hành trình phổ biến và ưu đãi hấp dẫn.</p>
      </section>
    </div>
  )
}

export default HomePage