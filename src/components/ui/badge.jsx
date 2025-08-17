import React from 'react'
import { cn } from '@/lib/utils'
export function Badge({ className, variant='default', ...props }) {
  const styles = {
    default: 'bg-emerald-600 text-white',
    secondary: 'bg-slate-100 text-slate-900',
    outline: 'border border-slate-300 text-slate-900',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', styles[variant] ?? styles.default, className)} {...props} />
  )
}
