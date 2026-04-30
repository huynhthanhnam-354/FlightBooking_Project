import React from 'react'
import NotificationCenter from '../components/NotificationCenter'

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Trung tâm thông báo</h1>
          <p className="text-sm text-slate-500">Xem các thay đổi, nhắc nhở và ưu đãi gần đây</p>
        </div>

        <NotificationCenter />
      </div>
    </div>
  )
}
