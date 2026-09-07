import { CheckCircle2, Copy, Mic, RotateCcw, Trash2 } from 'lucide-react'
import { Card } from './ui/Card'
import { Textarea } from './ui/Input'
import { useToast } from '../context/ToastContext'
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
