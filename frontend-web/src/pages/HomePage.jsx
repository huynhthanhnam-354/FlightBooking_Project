import SearchBar from '../components/SearchBar'

function HomePage() {
  const heroImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'

  return (
    <div className="w-full">
      <section className="relative h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 h-full flex flex-col justify-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tìm chuyến bay giá tốt — Nhanh chóng và tin cậy</h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">So sánh giá, đặt vé và quản lý hành trình của bạn ở cùng một nơi.</p>
          </div>

          <div className="mt-6">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">Gợi ý cho bạn</h2>
        <p className="text-sm text-slate-600">Khám phá hành trình phổ biến và ưu đãi hấp dẫn.</p>
      </section>
    </div>
  )
}

export default HomePage