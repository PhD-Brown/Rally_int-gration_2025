import React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border bg-white', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 border-b bg-slate-50/50 rounded-2xl rounded-b-none', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-600', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 space-y-3', className)} {...props} />
}
export function CardFooter({ className, ...props }) {
  return <div className={cn('p-5 border-t rounded-2xl rounded-t-none flex items-center', className)} {...props} />
}
