import { FileText, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface SourceTracePanelProps {
  transcript: string
  excerpt?: string
  fieldLabel?: string
  onClose: () => void
}

/** Highlights the transcript excerpt that backs a given SOAP field — the explainability panel. */
export function SourceTracePanel({ transcript, excerpt, fieldLabel, onClose }: SourceTracePanelProps) {
  const idx = excerpt ? transcript.toLowerCase().indexOf(excerpt.toLowerCase()) : -1
  const before = idx >= 0 ? transcript.slice(0, idx) : transcript
  const match = idx >= 0 ? transcript.slice(idx, idx + (excerpt?.length ?? 0)) : ''
  const after = idx >= 0 ? transcript.slice(idx + (excerpt?.length ?? 0)) : ''

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-ink-950/30" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fadeUp dark:bg-ink-900">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Source transcript</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {fieldLabel && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Supporting: <span className="text-brand-600 dark:text-brand-300">{fieldLabel}</span>
            </p>
          )}
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
            {before}
            {match && (
              <mark className="rounded bg-amber-200/70 px-0.5 text-ink-900 dark:bg-amber-500/40 dark:text-white">
                {match}
              </mark>
            )}
            {after}
          </p>
          {idx < 0 && excerpt && (
            <p className={cn('mt-3 rounded-lg bg-ink-50 p-3 text-xs text-ink-500 dark:bg-ink-800')}>
              Exact excerpt: "{excerpt}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
