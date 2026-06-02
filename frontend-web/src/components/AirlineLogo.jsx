import React from 'react'

export default function AirlineLogo({ name, size = 48, logoUrl }) {
  const initials = name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase()
  
  const colors = {
    'Vietnam Airlines': 'bg-sky-900',
    'VietJet Air': 'bg-red-600',
    'Bamboo Airways': 'bg-emerald-600',
    'Vietravel Airlines': 'bg-amber-500',
    'Pacific Airlines': 'bg-orange-600',
    'VietAir': 'bg-amber-400',
    'SkyFly': 'bg-sky-500',
    'OceanAir': 'bg-emerald-400'
  }
  
  const cls = colors[name] || 'bg-slate-200'

  if (logoUrl) {
    return (
      <div className="overflow-hidden rounded-full border border-slate-100 shadow-sm" style={{ width: size, height: size }}>
        <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center rounded-full ${cls} text-white font-bold text-xs`} style={{ width: size, height: size }}>
      {initials}
    </div>
  )
}
