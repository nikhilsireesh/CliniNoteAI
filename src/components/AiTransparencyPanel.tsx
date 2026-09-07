import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/utils'
import type { AiExtractionSummary } from '../types/clinical'

export function AiTransparencyPanel({ items }: { items: AiExtractionSummary[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
          <Sparkles className="h-4 w-4 text-brand-600" /> How AI structured this note
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="animate-fadeUp space-y-2.5 border-t border-ink-100 px-4 py-4 dark:border-ink-800">
          {items.map((item) => (
            <div key={item.label} className="flex gap-2.5 text-sm">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <p>
                <span className="font-medium text-ink-800 dark:text-ink-100">{item.label}:</span>{' '}
                <span className="text-ink-500 dark:text-ink-400">{item.detail}</span>
              </p>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-ink-400">
            This summarizes what CliniNote extracted from your transcript — not the model's internal reasoning.
          </p>
        </div>
      )}
    </Card>
  )
}
