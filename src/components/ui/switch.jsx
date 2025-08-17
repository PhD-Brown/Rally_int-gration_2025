import React from 'react'
import { cn } from '@/lib/utils'
export function Switch({ checked=false, onCheckedChange=()=>{}, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition', checked ? 'bg-emerald-600' : 'bg-slate-300', className)}
    >
      <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white transition', checked ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  )
}
