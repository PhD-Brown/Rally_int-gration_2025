import React from 'react'
import { cn } from '@/lib/utils'
export function Progress({ value=0, className }) {
  const val = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('w-full h-2 bg-slate-200 rounded-full overflow-hidden', className)}>
      <div className="h-full bg-emerald-600" style={{ width: `${val}%` }} />
    </div>
  )
}
