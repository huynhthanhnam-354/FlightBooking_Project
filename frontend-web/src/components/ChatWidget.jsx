import React, { useEffect, useRef, useState } from 'react'
import { FaRobot } from 'react-icons/fa'
import { FiSend, FiChevronDown } from 'react-icons/fi'

function QuickActionCard({ title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 backdrop-blur-sm transition">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-slate-200 mt-1">{subtitle}</div>
    </button>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Chào bạn! Tôi có thể giúp gì hôm nay?' },
  ])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    // scroll to bottom when messages change
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  function sendMessage(text) {
    if (!text || !text.trim()) return
    const m = { id: Date.now(), from: 'user', text: text.trim() }
    setMessages((s) => [...s, m])
    setInput('')
    // fake AI reply
    setTimeout(() => {
      setMessages((s) => [...s, { id: Date.now() + 1, from: 'ai', text: `Gợi ý cho: ${text.trim()}` }])
    }, 700)
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

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1" role="log" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[84%] p-3 rounded-3xl ${m.from === 'ai' ? 'bg-slate-100 text-slate-900 self-start' : 'bg-slate-900 text-white self-end'}`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                </div>
              ))}

              <div className="mt-2">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-3">Quick prompts</div>
                <div className="grid gap-2">
                  {quickActions.map((a) => (
                    <QuickActionCard key={a.id} title={a.title} subtitle={a.subtitle} onClick={() => sendMessage(a.title)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask me anything about your booking..."
                  className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button onClick={() => sendMessage(input)} className="rounded-3xl bg-sky-600 px-4 py-3 text-white font-semibold hover:bg-sky-700 transition">
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
