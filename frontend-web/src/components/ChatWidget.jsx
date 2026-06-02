import React, { useEffect, useRef, useState } from 'react'
import { FaRobot } from 'react-icons/fa'
import { FiSend, FiChevronDown } from 'react-icons/fi'
import axios from 'axios'

function QuickActionCard({ title, subtitle, onClick }) {
// ... (QuickActionCard content remains same)
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Chào bạn! Tôi là trợ lý ảo Sky AI. Tôi có thể giúp bạn tìm chuyến bay hoặc giải đáp thắc mắc về hành trình.' },
  ])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, loading])

  async function sendMessage(text) {
    if (!text || !text.trim() || loading) return
    
    const userMessage = text.trim()
    const m = { id: Date.now(), from: 'user', text: userMessage }
    
    setMessages((s) => [...s, m])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8080/api/ai/chat', {
        message: userMessage
      })
      
      const aiReply = response.data.reply
      setMessages((s) => [...s, { id: Date.now() + 1, from: 'ai', text: aiReply }])
    } catch (error) {
      console.error('AI Chat Error:', error)
      setMessages((s) => [...s, { 
        id: Date.now() + 1, 
        from: 'ai', 
        text: 'Hệ thống đang bận, trợ lý AI sẽ quay lại sau ít phút.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { id: 'cheap', title: 'Tìm vé rẻ nhất', subtitle: 'So sánh giá trong tuần' },
    { id: 'weather', title: 'Xem thời tiết điểm đến', subtitle: 'Nhiệt độ & dự báo' },
    { id: 'help', title: 'Gợi ý hành trình', subtitle: 'Gợi ý điểm dừng và lịch trình' },
  ]

  return (
    <div>
      {/* Floating button */}
      <div className="fixed right-6 bottom-6 z-50 flex items-end justify-end">
        {!open && (
          <div className="relative flex items-center justify-end">
            <div className="absolute -right-1 top-0 rounded-full bg-slate-950/95 px-3 py-2 text-xs text-white shadow-xl shadow-slate-900/20 animate-fade-in">
              Hi, need help booking?
            </div>
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl" />
            <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping" />
            <button aria-label="Mở trợ lý" onClick={() => setOpen(true)} className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-600 text-white shadow-2xl shadow-sky-500/40 flex items-center justify-center hover:scale-105 transition-transform duration-200 z-10 border border-white/10">
              <FaRobot size={22} />
            </button>
          </div>
        )}

        {open && (
          <div className="w-80 md:w-96 max-h-[540px] bg-white border border-slate-200 rounded-[32px] shadow-[0_30px_90px_rgba(15,23,42,0.18)] p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-sky-500/20">AI</div>
                <div>
                  <div className="font-semibold text-slate-900">Sky AI Assistant</div>
                  <div className="text-xs text-slate-500">Smart help for booking & support</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Đóng" className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition">
                <FiChevronDown className="text-slate-700" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2" role="log" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[84%] p-3 rounded-3xl ${m.from === 'ai' ? 'bg-slate-100 text-slate-900 self-start rounded-bl-none' : 'bg-slate-900 text-white self-end rounded-br-none ml-auto'}`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 bg-slate-100 text-slate-500 rounded-3xl rounded-bl-none max-w-[84%] animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs italic">Sky AI đang suy nghĩ...</span>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-slate-50">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick prompts</div>
                <div className="grid gap-2">
                  {quickActions.map((a) => (
                    <button key={a.id} onClick={() => sendMessage(a.title)} className="w-full text-left p-3 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-100 transition group">
                      <div className="font-bold text-xs text-slate-700 group-hover:text-sky-700">{a.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{a.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi tôi bất cứ điều gì..."
                  className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                />
                <button type="submit" disabled={loading} className="rounded-3xl bg-sky-600 px-4 py-3 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-50">
                  <FiSend />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
