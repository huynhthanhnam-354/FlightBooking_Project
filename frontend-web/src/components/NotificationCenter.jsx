import React, { useMemo, useState } from 'react'
import MOCK_NOTIFICATIONS from '../data/mockNotifications'
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaGift, FaBell } from 'react-icons/fa'

const TYPE_MAP = {
  warning: { Icon: FaExclamationTriangle, bg: 'bg-yellow-100', color: 'text-yellow-700' },
  success: { Icon: FaCheckCircle, bg: 'bg-green-100', color: 'text-green-700' },
  info: { Icon: FaInfoCircle, bg: 'bg-sky-100', color: 'text-sky-700' },
  promo: { Icon: FaGift, bg: 'bg-pink-100', color: 'text-pink-700' },
  reminder: { Icon: FaBell, bg: 'bg-indigo-100', color: 'text-indigo-700' }
}

function timeLabel(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch (e) { return iso }
}

export default function NotificationCenter({ initial = MOCK_NOTIFICATIONS }) {
  const [notifications, setNotifications] = useState(initial)

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function toggleRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Thông báo</h3>
          <div className="text-sm text-slate-500">{unreadCount} chưa đọc</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={markAllRead} disabled={unreadCount === 0} className={`text-sm ${unreadCount === 0 ? 'text-slate-300' : 'text-slate-600 hover:underline'}`}>
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      <ul className="divide-y">
        {notifications.map(n => {
          const meta = TYPE_MAP[n.type] || TYPE_MAP.info
          const Icon = meta.Icon
          return (
            <li key={n.id} className={`py-3 flex items-start gap-3 ${n.read ? 'opacity-80' : 'bg-slate-50'}`}>
              <div className={`${meta.bg} p-2 rounded-md shrink-0`}>
                <Icon className={`${meta.color} w-5 h-5`} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-medium ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{n.message}</div>
                  </div>

                  <div className="text-xs text-slate-400 whitespace-nowrap">{timeLabel(n.time)}</div>
                </div>

                <div className="mt-2">
                  <button onClick={() => toggleRead(n.id)} className="text-xs text-slate-500 hover:text-slate-700">{n.read ? 'Đã đọc' : 'Đánh dấu là đã đọc'}</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
