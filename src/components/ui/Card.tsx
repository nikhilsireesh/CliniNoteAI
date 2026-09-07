import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Transparent by default so the animated background shows straight through every
        // card across the app — border + shadow still give it a "card" silhouette. Pass
        // e.g. `!bg-white` on any specific instance that needs a solid backing (rare —
        // reserved for things like floating menus, not in-page content panels).
        'rounded-2xl border border-ink-200/70 bg-transparent shadow-card transition-shadow duration-200 dark:border-ink-800',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between gap-3 p-5 pb-0', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[15px] font-semibold text-ink-900 dark:text-white', className)} {...props} />
}
