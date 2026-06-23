import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ComboAiAssistant({ onApplyFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: 'Chào bạn, hãy để AI thiết kế Combo du lịch riêng cho bạn!' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call suggest API
      const res = await api.get('/v1/ai/combo-suggest', {
        params: { prompt: text }
      });

      const { origin, destination, budget } = res.data || {};
      
      let reply = 'Tôi không tìm thấy combo phù hợp với mô tả của bạn. Hãy thử nhập lại cụ thể hơn nhé!';
      
      if (destination || budget > 0) {
        reply = `Dựa vào yêu cầu của bạn, tôi đã tìm được các combo nghỉ dưỡng phù hợp:\n`;
        if (destination) {
          reply += `📍 Điểm đến: ${destination}\n`;
        }
        if (origin) {
          reply += `🛫 Khởi hành từ: ${origin}\n`;
        }
        if (budget > 0) {
          reply += `💰 Ngân sách tối đa: ${budget.toLocaleString()}₫\n`;
        }
        reply += `Tôi đã tự động cập nhật bộ lọc hiển thị chuyến bay cho bạn!`;

        // Apply filters to parent component
        if (onApplyFilters) {
          onApplyFilters({ origin, destination, budget });
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: reply
      }]);
    } catch (err) {
      console.error("AI Combo suggest error:", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Có lỗi kết nối với trợ lý AI. Vui lòng thử lại sau.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] font-sans">
      {/* 1. Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce relative group"
        >
          <FaRobot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* 2. Chat Widget (Chat box) */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-[#1a2b49] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-300">
                <FaRobot size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">AI Trip Designer</h4>
                <p className="text-[9px] text-slate-300 font-medium">Hỗ trợ thiết kế Combo 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                  msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {msg.sender === 'user' ? <FaUser size={10} /> : <FaRobot size={10} />}
                </div>
                <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs bg-slate-200 text-slate-600">
                  <FaRobot size={10} />
                </div>
                <div className="p-3 bg-white text-slate-500 rounded-2xl rounded-tl-none border border-slate-100 text-xs flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Nhập yêu cầu... (VD: Đi Phú Quốc dưới 5 triệu)"
              className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
            >
              <FaPaperPlane size={11} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
