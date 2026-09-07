import { cn } from '../../lib/utils'

interface ProgressProps {
  value: number
  className?: string
  barClassName?: string
}

export function Progress({ value, className, barClassName }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const tone = clamped >= 85 ? 'bg-mint-500' : clamped >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800', className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', tone, barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
