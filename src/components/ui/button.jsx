import React from 'react'
import { cn } from '@/lib/utils'

export const Button = React.forwardRef(({ className, variant='default', size='default', ...props }, ref) => {
  const variants = {
    default: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 text-slate-900 hover:bg-slate-50',
    ghost: 'hover:bg-slate-100',
    link: 'text-emerald-700 underline-offset-4 hover:underline',
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-6',
    icon: 'h-10 w-10',
  }
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition shadow-sm',
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.default,
        className
      )}
      {...props}
    />
  )
})
Button.displayName = 'Button'
