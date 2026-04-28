import React from 'react';

export default function AIPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden text-slate-50 font-sans selection:bg-cyan-500/30">
      
      {/* Abstract 3D Shapes (mờ ảo) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen" style={{ animationDuration: '10s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
        {/* Header / Typography */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base font-semibold leading-7 text-cyan-400 uppercase tracking-widest">
            Kỷ nguyên du lịch mới
          </p>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-sm pb-2">
            Trợ lý Ảo Thông Minh
          </h1>
          <p className="mt-8 text-xl leading-8 text-slate-300 font-light max-w-2xl mx-auto">
            Khám phá thế giới dễ dàng hơn bao giờ hết với AI của chúng tôi. Lên kế hoạch, săn vé rẻ và nhận hỗ trợ cá nhân hóa 24/7, tất cả trong một cú chạm.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-full bg-cyan-500/10 px-8 py-3.5 text-sm font-semibold text-cyan-400 shadow-sm ring-1 ring-inset ring-cyan-500/50 hover:bg-cyan-500/20 hover:ring-cyan-400 transition-all duration-300">
              Trải nghiệm ngay
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:mt-36 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="flex flex-col relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-2xl flex flex-col items-start">
                <div className="rounded-xl bg-cyan-500/20 p-4 ring-1 ring-cyan-500/30 mb-6 group-hover:bg-cyan-500/30 transition duration-300">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-7 text-white mb-4">Dự báo giá vé rẻ</h3>
                <p className="mt-2 text-base leading-7 text-slate-400 flex-grow font-light">
                  Phân tích hàng triệu dữ liệu để dự đoán xu hướng giá vé. Nhận thông báo tức thì khi có vé rẻ nhất, giúp bạn tiết kiệm tối đa chi phí cho mỗi chuyến đi.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-2xl flex flex-col items-start">
                <div className="rounded-xl bg-purple-500/20 p-4 ring-1 ring-purple-500/30 mb-6 group-hover:bg-purple-500/30 transition duration-300">
                  <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 10.5h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm-3-6h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm6-6h.008v.008H15v-.008zm0 3h.008v.008H15v-.008zm0 3h.008v.008H15v-.008z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-7 text-white mb-4">Tự động lên lịch trình du lịch</h3>
                <p className="mt-2 text-base leading-7 text-slate-400 flex-grow font-light">
                  Chỉ cần cung cấp điểm đến và sở thích, AI sẽ tự động tạo ra một lịch trình hoàn hảo từng giờ, tối ưu hóa thời gian và trải nghiệm của bạn.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-2xl flex flex-col items-start">
                <div className="rounded-xl bg-blue-500/20 p-4 ring-1 ring-blue-500/30 mb-6 group-hover:bg-blue-500/30 transition duration-300">
                  <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-7 text-white mb-4">Hỗ trợ sự cố 24/7</h3>
                <p className="mt-2 text-base leading-7 text-slate-400 flex-grow font-light">
                  Trễ chuyến, đổi vé hay các vấn đề phát sinh? Trợ lý ảo túc trực 24/7 sẵn sàng đưa ra các giải pháp thay thế nhanh chóng và hỗ trợ bạn vượt qua mọi sự cố.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
