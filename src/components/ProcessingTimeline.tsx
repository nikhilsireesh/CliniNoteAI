import { Check, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import type { ProcessingStage } from '../types/clinical'

interface ProcessingTimelineProps {
  stages: ProcessingStage[]
}

export function ProcessingTimeline({ stages }: ProcessingTimelineProps) {
  return (
    <ol className="space-y-1">
      {stages.map((stage) => (
        <li
          key={stage.id}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors duration-300',
            stage.status === 'processing' && 'bg-brand-50 dark:bg-brand-500/10',
            stage.status === 'complete' && 'bg-mint-50/60 dark:bg-mint-500/5'
          )}
        >
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors duration-300',
              stage.status === 'pending' && 'border-ink-200 text-ink-300 dark:border-ink-700 dark:text-ink-600',
              stage.status === 'processing' && 'border-brand-500 bg-brand-500 text-white',
              stage.status === 'complete' && 'border-mint-500 bg-mint-500 text-white'
            )}
          >
            {stage.status === 'processing' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {stage.status === 'complete' && <Check className="h-3.5 w-3.5 animate-popIn" />}
            {stage.status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span
            className={cn(
              'text-sm transition-colors',
              stage.status === 'pending' && 'text-ink-400',
              stage.status === 'processing' && 'font-medium text-brand-700 dark:text-brand-300',
              stage.status === 'complete' && 'text-ink-600 line-through decoration-mint-400/60 dark:text-ink-300'
            )}
          >
            {stage.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
