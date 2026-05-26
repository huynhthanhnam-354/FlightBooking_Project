import React from 'react'

export default function FlightCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 animate-pulse overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-3xl bg-slate-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded-full bg-slate-200"></div>
            <div className="h-4 w-1/2 rounded-full bg-slate-200"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-4 rounded-full bg-slate-200"></div>
              <div className="h-4 rounded-full bg-slate-200"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-4 min-w-[140px] py-1">
          <div className="h-5 w-24 rounded-full bg-slate-200"></div>
          <div className="h-10 w-32 rounded-full bg-slate-200"></div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-400">
        <div className="h-4 rounded-full bg-slate-200" />
        <div className="h-4 rounded-full bg-slate-200" />
      </div>
    </div>
  )
}
