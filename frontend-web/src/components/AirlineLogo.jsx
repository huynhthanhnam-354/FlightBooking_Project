import React from 'react'

export default function AirlineLogo({ name, size = 48 }) {
  const initials = name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase()
  const colors = {
    VietAir: 'bg-amber-400',
    SkyFly: 'bg-sky-500',
    OceanAir: 'bg-emerald-400'
  }
  const cls = colors[name] || 'bg-slate-200'

  return (
    <div className={`flex items-center justify-center rounded-full ${cls} text-white font-bold`} style={{ width: size, height: size }}>
      {initials}
    </div>
  )
}
