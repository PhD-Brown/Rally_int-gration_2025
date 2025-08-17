import React from 'react'
import { cn } from '@/lib/utils'
export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn('w-full min-h-[100px] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500', className)}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
