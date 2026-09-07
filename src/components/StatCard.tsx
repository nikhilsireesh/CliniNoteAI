import type { LucideIcon } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/utils'
import { useCountUp } from '../lib/useCountUp'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'brand' | 'mint' | 'amber' | 'ink'
  /** Stagger delay in ms applied to the entrance animation, so a row of stat cards cascades in. */
  delay?: number
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  mint: 'bg-mint-50 text-mint-600 dark:bg-mint-500/10 dark:text-mint-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  ink: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
}

/** Splits "94%" or "48 min" into an animatable leading number and its trailing unit text. */
function splitValue(value: string) {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { number: null as number | null, suffix: value }
  return { number: Number(match[1]), suffix: match[2] }
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'brand', delay = 0 }: StatCardProps) {
  const { number, suffix } = splitValue(value)
  const animated = useCountUp(number ?? 0)
  const display = number === null ? value : `${Math.round(animated)}${suffix}`

  return (
    <Card
      className="hover-lift group animate-fadeUp p-5 hover:shadow-soft"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink-900 dark:text-white">
            {display}
          </p>
          {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
        </div>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6',
            toneClasses[tone]
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </Card>
  )
}
