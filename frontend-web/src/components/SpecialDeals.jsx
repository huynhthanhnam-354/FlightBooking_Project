import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaSuitcase, FaChevronRight, FaTicketAlt } from 'react-icons/fa';
import api from '../services/api';
import { DEALS_DATA } from '../data/dealsData';

/**
 * SpecialDeals Component
 * A premium, voucher-style deals section inspired by Traveloka.
 * Features category-based filtering and high-impact visual hierarchy.
 */
const SpecialDeals = () => {
  const [activeCategory, setActiveTab] = useState('all');
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.get('/v1/promotions');
        setDeals(res.data || []);
      } catch (err) {
        console.error("Fetch promotions error, using fallback data:", err);
        // Map fallback mock data
        const fallback = DEALS_DATA.map(d => ({
          id: d.id,
          title: d.title,
          description: d.subTitle,
          discountPercentage: d.discountPercentage,
          type: d.category.toUpperCase(),
          tags: d.meta?.tags || [],
          bannerUrl: d.image,
          hotDeal: d.status === 'hot'
        }));
        setDeals(fallback);
      }
    };
    fetchPromotions();
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: FaTicketAlt },
    { id: 'flight', label: 'Chuyến bay', icon: FaPlane },
    { id: 'hotel', label: 'Khách sạn', icon: FaHotel },
    { id: 'combo', label: 'Combo tiết kiệm', icon: FaSuitcase },
  ];

  const filteredDeals = useMemo(() => {
    if (activeCategory === 'all') return deals;
    return deals.filter(deal => (deal.type || '').toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory, deals]);

  const getCtaLink = (deal) => {
    const type = (deal.type || '').toUpperCase();
    const title = (deal.title || '').toLowerCase();
    
    if (type === 'FLIGHT') {
      if (title.includes('hà giang')) return '/flights?to=HAN';
      if (title.includes('sơn đoòng')) return '/flights?to=HAN';
      return '/flights';
    }
    if (type === 'COMBO') {
      if (title.includes('phú quốc')) return '/combos/search?to=PQC';
      return '/combos/search';
    }
    if (type === 'HOTEL') {
      if (title.includes('nha trang')) return '/combos/search?to=CXR'; // Nha Trang combo
      return '/booking';
    }
    return '/';
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 bg-white">
      {/* 1. Header & Category Tabs Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ưu đãi độc quyền</h2>
          <p className="text-slate-500 font-medium">Săn deal hời, vi vu khắp thế giới cùng Flight Booking</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isAct = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                  isAct 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <Icon size={14} className={isAct ? 'text-white' : 'text-slate-400'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeals.map((deal) => (
          <Link 
            to={getCtaLink(deal)} 
            key={deal.id}
            className="group relative flex h-44 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-500"
          >
            {/* Split Layout: Left side (Image) */}
            <div className="relative w-2/5 h-full overflow-hidden bg-slate-200">
              <img 
                src={deal.bannerUrl} 
                alt={deal.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loops
                  e.target.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80'; // Fallback
                }}
              />
              {/* Inner border / Overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3">
                 <span className="bg-white/20 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                    {deal.type}
                 </span>
              </div>
            </div>

            {/* Split Layout: Right side (Voucher Content) */}
            <div className="flex-1 p-5 flex flex-col justify-between relative bg-white min-w-0">
              {/* Decorative "Voucher Notch" using CSS circles */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r border-slate-100 hidden md:block" />
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{deal.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{deal.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giảm đến</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">
                    {deal.discountPercentage}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
                   <div className="flex gap-1 overflow-hidden">
                      {deal.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-black bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 uppercase whitespace-nowrap">{tag}</span>
                      ))}
                   </div>
                   <div className="text-blue-600 font-black text-[10px] flex items-center gap-1 group-hover:gap-2 transition-all shrink-0 uppercase tracking-widest">
                      Săn ngay <FaChevronRight size={7} />
                   </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {deal.hotDeal && (
              <div className="absolute -top-1 -right-1">
                 <div className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-lg uppercase tracking-widest">
                    Hot Deal
                 </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 3. Footer Action Button */}
      <div className="mt-16 flex justify-center">
        <Link 
          to="/flights"
          className="group flex items-center gap-4 px-10 py-4 rounded-full border-2 border-slate-100 bg-slate-50 text-blue-600 font-black text-sm tracking-wide hover:bg-white hover:border-blue-600 hover:shadow-lg transition-all duration-300"
        >
          XEM TẤT CẢ ƯU ĐÃI
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center group-hover:translate-x-2 transition-all duration-300">
             <FaChevronRight size={10} />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default SpecialDeals;
