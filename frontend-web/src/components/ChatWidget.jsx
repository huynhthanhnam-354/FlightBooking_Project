import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSend, FiX } from 'react-icons/fi'
import api from '../services/api'

const initialMessage = {
  id: 1,
  from: 'ai',
  text: 'Xin chao, toi la tro ly Sky AI. Ban can tim chuyen bay, hoi FAQ hay can ho tro ve booking?',
}

function getSessionId() {
  const key = 'sky_ai_session_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const value = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem(key, value)
  return value
}

function normalizeSuggestions(items) {
  if (!Array.isArray(items)) return []
  return items
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: `suggestion-${index}-${item}`, label: item }
      }
      if (item && typeof item === 'object') {
        const label = String(item.label || item.id || '').trim()
        const id = String(item.id || label || `suggestion-${index}`).trim()
        return { id, label: label || id }
      }
      return { id: `suggestion-${index}`, label: String(item ?? '') }
    })
    .filter((item) => item.label.trim())
}

export default function ChatWidget() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([initialMessage])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const sessionId = useMemo(getSessionId, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  function handleSuggestionAction(suggestion) {
    const id = suggestion?.id || suggestion?.label || ''
    const routeMap = {
      checkin: '/check-in',
      support: '/support',
      refund: '/support',
      payment: '/support',
      baggage: '/support',
      'extra-baggage': '/support',
      'book-baggage': '/booking',
      'my-bookings': '/user-dashboard',
      ticket: '/user-dashboard',
      eticket: '/user-dashboard',
      pnr: '/user-dashboard',
      flights: '/booking',
      'search-flight': '/booking',
    }

    const route = routeMap[id]
    if (route) {
      setOpen(false)
      navigate(route)
      return
    }

    sendMessage(suggestion?.label || id)
  }

  async function sendMessage(text) {
    const userMessage = text?.trim()
    if (!userMessage || loading) return

    setMessages((items) => [...items, { id: Date.now(), from: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat', {
        message: userMessage,
        sessionId,
        platform: 'web',
        language: 'vi',
      })

      setMessages((items) => [
        ...items,
        {
          id: Date.now() + 1,
          from: 'ai',
          text: data?.reply || 'Toi chua co cau tra loi phu hop.',
          suggestions: normalizeSuggestions(data?.suggestions),
        },
      ])
    } catch (error) {
      console.error('AI Chat Error:', error)
      setMessages((items) => [
        ...items,
        { id: Date.now() + 1, from: 'ai', text: 'He thong AI dang ban. Vui long thu lai sau.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Quy dinh hanh ly nhu the nao?',
    'Toi muon doi hoac huy ve',
    'Huong dan check-in online',
  ]

  return (
    <div className="fixed bottom-20 right-20 z-50">
      {!open ? (
        <button
          type="button"
          aria-label="Open Sky AI assistant"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-2xl shadow-sky-900/20 transition duration-300 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          <span className="sr-only">Open Sky AI Assistant</span>
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
            <path d="M12 2.5c-3.9 0-7 3.1-7 7v1.6C4.9 12.4 4 13.8 4 15.4V17c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-1.6c0-1.6-.9-3-2.3-3.3V9.5c0-3.9-3.1-7-7-7zM8.5 9.5a1 1 0 110 2 1 1 0 010-2zm7 0a1 1 0 110 2 1 1 0 010-2z" />
            <path d="M9.7 16.1c.4-.6 1.1-1 1.8-1h1c.7 0 1.4.4 1.8 1l.3.5H9.4l.3-.5z" />
          </svg>
        </button>
      ) : (
        <section className="transform-gpu transition-all duration-300 ease-out flex h-[520px] max-h-[calc(100vh-7rem)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm shadow-sky-600/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M12 2.5c-3.9 0-7 3.1-7 7v1.6C4.9 12.4 4 13.8 4 15.4V17c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-1.6c0-1.6-.9-3-2.3-3.3V9.5c0-3.9-3.1-7-7-7zM8.5 9.5a1 1 0 110 2 1 1 0 010-2zm7 0a1 1 0 110 2 1 1 0 010-2z" />
                  <path d="M9.7 16.1c.4-.6 1.1-1 1.8-1h1c.7 0 1.4.4 1.8 1l.3.5H9.4l.3-.5z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Sky AI Assistant</div>
                <div className="text-xs text-slate-500">Quick help for search, booking, and support</div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close Sky AI assistant"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <FiX />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-3" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[84%] ${message.from === 'user' ? 'ml-auto' : ''}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.from === 'ai'
                      ? 'rounded-bl-sm bg-white text-slate-800 shadow-sm'
                      : 'rounded-br-sm bg-sky-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
                {message.from === 'ai' && message.suggestions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.id || 'suggestion'}-${suggestion.label || index}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionAction(suggestion)}
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="max-w-[84%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                Sky AI dang tra loi...
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Nhap cau hoi..."
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}
