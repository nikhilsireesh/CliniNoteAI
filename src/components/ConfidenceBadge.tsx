import { CircleAlert, CircleCheck, CircleDot, Quote } from 'lucide-react'
import { Popover } from './ui/Popover'
import { cn } from '../lib/utils'
import type { ExtractedField } from '../types/clinical'

interface ConfidenceBadgeProps<T> {
  field: ExtractedField<T>
  onViewSource?: () => void
  className?: string
}

const CONFIG = {
  high: { label: 'High confidence', icon: CircleCheck, classes: 'bg-mint-50 text-mint-700 dark:bg-mint-500/10 dark:text-mint-400' },
  medium: { label: 'Medium confidence', icon: CircleDot, classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  review: { label: 'Needs review', icon: CircleAlert, classes: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
} as const

/**
 * Shows the AI's extraction confidence for one field. This reflects how clearly the
 * transcript supported the extraction — never a claim about medical certainty.
 */
export function ConfidenceBadge<T>({ field, className }: ConfidenceBadgeProps<T>) {
  if (field.notDocumented) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-medium text-ink-500 dark:bg-ink-800 dark:text-ink-400',
          className
        )}
      >
        <CircleDot className="h-3 w-3" /> Not documented
      </span>
    )
  }

  const { label, icon: Icon, classes } = CONFIG[field.confidence]

  return (
    <Popover
      align="left"
      trigger={() => (
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium transition hover:brightness-95',
            classes,
            className
          )}
        >
          <Icon className="h-3 w-3" /> {label}
        </button>
      )}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">AI extraction confidence</p>
        <p className="text-ink-600 dark:text-ink-300">
          {field.confidence === 'high' && 'The transcript clearly and directly supports this value.'}
          {field.confidence === 'medium' && 'The transcript supports this value, with some interpretation by the AI.'}
          {field.confidence === 'review' && 'This value is ambiguous or approximate in the transcript — please confirm.'}
        </p>
        {field.source?.excerpt && (
          <div className="flex gap-2 rounded-lg bg-ink-50 p-2.5 text-ink-600 dark:bg-ink-900 dark:text-ink-300">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
            <p className="italic leading-snug">"{field.source.excerpt}"</p>
          </div>
        )}
        <p className="text-[11px] text-ink-400">Not a measure of medical certainty.</p>
      </div>
    </Popover>
  )
}
