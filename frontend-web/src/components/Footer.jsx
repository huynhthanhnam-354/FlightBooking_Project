import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Footer component for FlightBook AI
 * Designed with a premium, trustworthy aesthetic using brand colors.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Về Flight Booking',
      links: [
        { name: 'Câu chuyện thương hiệu', path: '/about' },
        { name: 'Cơ hội nghề nghiệp', path: '/careers' },
        { name: 'Tin tức & Truyền thông', path: '/news' },
        { name: 'Điều khoản dịch vụ', path: '/terms' },
        { name: 'Chính sách bảo mật', path: '/privacy' },
      ]
    },
    {
      title: 'Dịch vụ của chúng tôi',
      links: [
        { name: 'Đặt vé máy bay', path: '/booking' },
        { name: 'Combo du lịch', path: '/combos' },
        { name: 'Khách sạn đối tác', path: '/hotels' },
        { name: 'Bảo hiểm chuyến bay', path: '/insurance' },
        { name: 'Dịch vụ doanh nghiệp', path: '/corporate' },
      ]
    },
    {
      title: 'Hỗ trợ khách hàng',
      links: [
        { name: 'Trung tâm trợ giúp', path: '/support' },
        { name: 'Quy định hành lý', path: '/baggage' },
        { name: 'Hướng dẫn thanh toán', path: '/payment-guide' },
        { name: 'Hoàn vé & Thay đổi', path: '/refund' },
        { name: 'Liên hệ với chúng tôi', path: '/contact' },
      ]
    }
  ];

  return (
    <footer className="bg-brand-accent text-slate-800 pt-20 pb-10 overflow-hidden relative border-t border-slate-200/60">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Identity & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-soft-lg flex items-center justify-center shadow-premium">
                <FaPlane className="text-white text-lg rotate-45" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-brand-primary">
                Flight<span className="text-brand-secondary"> Booking</span>
              </span>
            </Link>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm font-medium">
              Trải nghiệm đặt vé máy bay thông minh với công nghệ AI hàng đầu. 
              Chúng tôi mang đến sự minh bạch, tốc độ và giá trị tối ưu cho mọi hành trình của bạn.
            </p>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-brand-primary">Đăng ký nhận ưu đãi</h4>
              <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 focus-within:border-brand-primary transition-all shadow-sm">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 px-3 outline-none text-slate-800"
                />
                <button className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-premium">
                  GỬI NGAY
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.path} 
                        className="text-slate-600 text-sm font-medium hover:text-brand-primary transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Social Info */}
        <div className="pt-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                <FaPhoneAlt className="text-brand-primary" />
                <span>1900 123 456 (24/7)</span>
             </div>
             <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                <FaEnvelope className="text-brand-primary" />
                <span>support@flightbooking.ai</span>
             </div>
          </div>

          <div className="flex justify-center gap-5">
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <a 
                key={i} 
                href="#" 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm border border-slate-100"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-bold">
            © {currentYear} Flight Booking. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-6 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             <div className="h-6 w-12 bg-slate-200 rounded-sm" />
             <div className="h-6 w-12 bg-slate-200 rounded-sm" />
             <div className="h-6 w-12 bg-slate-200 rounded-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
