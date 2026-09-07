import { useMemo } from 'react'
import { CheckCircle2, Copy, Mic, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { Card } from './ui/Card'
import { Textarea } from './ui/Input'
import { useToast } from '../context/ToastContext'
import { summarizeLive } from '../lib/liveSummary'
import { cn } from '../lib/utils'

interface TranscriptPanelProps {
  text: string
  isLive: boolean
  isComplete: boolean
  onChange: (text: string) => void
  onClear: () => void
  onReRecord: () => void
}

export function TranscriptPanel({ text, isLive, isComplete, onChange, onClear, onReRecord }: TranscriptPanelProps) {
  const { showToast } = useToast()
  // Recomputed on every transcript update — cheap and local, so it can safely track
  // speech as it comes in without waiting for the deliberate "Generate SOAP Note" step.
  const liveSummary = useMemo(() => (isLive ? summarizeLive(text) : null), [isLive, text])

  return (
    <Card className="animate-fadeUp">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Transcript</h3>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" /> Listening…
            </span>
          )}
          {isComplete && !isLive && (
            <span className="flex items-center gap-1 text-xs font-medium text-mint-600 dark:text-mint-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Transcription complete
            </span>
          )}
        </div>
        {!isLive && text && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(text)
                showToast('Transcript copied to clipboard.', 'success')
              }}
              title="Copy transcript"
              aria-label="Copy transcript"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onReRecord}
              title="Re-record"
              aria-label="Re-record"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClear}
              title="Clear transcript"
              aria-label="Clear transcript"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {liveSummary && (
        <div className="animate-fadeIn border-b border-ink-100 bg-brand-50/40 px-5 py-3 dark:border-ink-800 dark:bg-brand-500/5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            <Sparkles className="h-3 w-3" /> Live summary
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{liveSummary.headline}</p>
          {liveSummary.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {liveSummary.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-medium text-brand-700 shadow-sm dark:bg-ink-800 dark:text-brand-300"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {text ? (
          <Textarea
            value={text}
            readOnly={isLive}
            onChange={(e) => onChange(e.target.value)}
            rows={7}
            className={cn('text-[15px] leading-relaxed', isLive && 'cursor-default text-ink-500')}
            aria-label="Encounter transcript"
          />
        ) : (
          <p className="py-6 text-center text-sm text-ink-400">
            Your transcript will appear here once you start recording.
          </p>
        )}
      </div>
      {!isLive && text && (
        <div className="flex items-center gap-1.5 border-t border-ink-100 px-5 py-2.5 text-[11px] text-ink-400 dark:border-ink-800">
          <RotateCcw className="h-3 w-3" /> You can edit the transcript directly before generating the SOAP note.
        </div>
      )}
    </Card>
  )
}
