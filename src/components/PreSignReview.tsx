import { useState } from 'react'
import { Check, PenLine, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

interface PreSignReviewProps {
  onSign: () => void
  completeness: number
}

const CHECKLIST = [
  'Transcript reviewed',
  'SOAP sections reviewed',
  'AI-generated content reviewed',
  'Missing information checked',
]

export function PreSignReview({ onSign, completeness }: PreSignReviewProps) {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false))
  const allChecked = checked.every(Boolean)

  return (
    <Card className="border-brand-200/70 dark:border-brand-500/20">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-ink-900 dark:text-white">Pre-sign review</h3>
            <p className="text-xs text-ink-400">Confirm before this note becomes part of the record.</p>
          </div>
        </div>

        <ul className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <li key={item}>
              <button
                onClick={() => setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))}
                className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-800/60"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    checked[i]
                      ? 'border-mint-500 bg-mint-500 text-white'
                      : 'border-ink-300 text-transparent dark:border-ink-600'
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className={cn('text-ink-700 dark:text-ink-200', checked[i] && 'text-ink-500 line-through')}>
                  {item}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {completeness < 80 && (
          <p className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Documentation completeness is {completeness}%. Consider reviewing missing fields before signing.
          </p>
        )}

        <Button className="w-full" size="lg" disabled={!allChecked} onClick={onSign}>
          <PenLine className="h-4 w-4" /> Approve &amp; Sign Note
        </Button>
        <p className="text-center text-[11px] text-ink-400">
          Signing confirms you, the clinician, have reviewed and approved this AI-assisted documentation.
        </p>
      </CardContent>
    </Card>
  )
}
