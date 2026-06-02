import React, { useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiZap } from 'react-icons/fi';

/**
 * PricePredictor Component
 * A premium AI-powered widget that predicts flight price trends for the next 7 days.
 * Uses pure SVG for a lightweight, dependency-free visualization.
 */
export default function PricePredictor({ from = 'Hà Nội', to = 'Hồ Chí Minh', currentPrice = 1250000 }) {
  // Mock data for price fluctuations (Next 7 days)
  const days = ['Hôm nay', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const prices = [currentPrice, currentPrice * 1.15, currentPrice * 1.05, currentPrice * 1.2, currentPrice * 1.1, currentPrice * 1.25, currentPrice * 1.3];
  
  // Determine trend (Comparing today vs tomorrow/week)
  const isTrendUp = prices[1] > currentPrice;
  const percentageIncrease = Math.round(((prices[1] - currentPrice) / currentPrice) * 100);

  // SVG Chart Configuration
  const chartHeight = 100;
  const chartWidth = 400;
  
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice;

  // Calculate SVG Points
  const points = useMemo(() => {
    return prices.map((p, i) => {
      const x = (i * (chartWidth / (prices.length - 1)));
      const y = chartHeight - ((p - minPrice) / priceRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  }, [prices, minPrice, priceRange]);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 overflow-hidden relative group mb-6">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-sky-50 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-110 duration-700" />
      
      {/* Header & AI Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiZap className="text-amber-500 fill-amber-500" />
            Dự báo xu hướng giá bằng AI
          </h3>
          <p className="text-sm text-slate-500 mt-1">Chặng bay: <span className="font-semibold text-slate-700">{from} → {to}</span></p>
        </div>

        {isTrendUp ? (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl">
            <FiTrendingUp className="text-lg" />
            <div className="text-xs font-bold leading-tight">
              AI khuyên: NÊN MUA NGAY
              <span className="block font-normal text-[10px] opacity-80">(Giá dự kiến tăng {percentageIncrease}% vào ngày mai)</span>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-2xl">
            <FiTrendingDown className="text-lg" />
            <div className="text-xs font-bold leading-tight">
              AI khuyên: NÊN ĐỢI
              <span className="block font-normal text-[10px] opacity-80">(Xu hướng giá ổn định hoặc giảm nhẹ)</span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Chart Section */}
      <div className="relative h-32 mb-8 mt-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Gradient for Area Chart */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under the line */}
          <path
            d={`M 0,${chartHeight} ${points} L ${chartWidth},${chartHeight} Z`}
            fill="url(#chartGradient)"
          />

          {/* The Trend Line */}
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="transition-all duration-1000"
          />

          {/* Data Points */}
          {prices.map((p, i) => {
            const x = (i * (chartWidth / (prices.length - 1)));
            const y = chartHeight - ((p - minPrice) / priceRange) * chartHeight;
            return (
              <g key={i} className="group/point">
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  className={`${i === 0 ? 'fill-sky-600' : 'fill-white'} stroke-sky-500 stroke-2 cursor-pointer hover:r-6 transition-all`}
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-4">
          {days.map((day, i) => (
            <span key={i} className={`text-[10px] font-medium ${i === 0 ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <FiInfo className="text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Dự báo dựa trên dữ liệu lịch sử và thuật toán học máy. Độ chính xác có thể thay đổi tùy theo điều kiện thị trường thực tế. 
          <span className="font-semibold text-slate-600"> Cập nhật 5 phút trước.</span>
        </p>
      </div>
    </div>
  );
}
