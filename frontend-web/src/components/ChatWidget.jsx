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
      <div className="fixed right-6 bottom-6 z-50">
        {!open && (
          <button aria-label="Mở trợ lý" onClick={() => setOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition">
            <FaRobot size={20} />
          </button>
        )}

        {open && (
          <div className="w-80 md:w-96 h-[520px] bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-3 flex flex-col text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">AI</div>
                <div>
                  <div className="font-semibold">Trợ lý Đặt vé</div>
                  <div className="text-xs text-green-300">Online</div>
                </div>
              </div>
              <div>
                <button onClick={() => setOpen(false)} aria-label="Đóng" className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <FiChevronDown />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-1" role="log" aria-live="polite">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[84%] p-2 rounded-lg ${m.from === 'ai' ? 'bg-white/10 text-white' : 'bg-white text-black self-end'}`}>
                    <div className="text-sm">{m.text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-200 mb-2">Gợi ý nhanh</div>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((a) => (
                    <QuickActionCard key={a.id} title={a.title} subtitle={a.subtitle} onClick={() => sendMessage(a.title)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex gap-2">
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 rounded-xl bg-white/10 placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <button onClick={() => sendMessage(input)} className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 transition flex items-center justify-center">
                  <FiSend className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
