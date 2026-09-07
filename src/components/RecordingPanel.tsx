import { useRef } from 'react'
import { Mic, Sparkles, Square, TriangleAlert, Upload } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Waveform } from './Waveform'
import { ECGLine } from './ECGLine'
import { cn, formatDuration } from '../lib/utils'

export type RecordingStatus = 'idle' | 'requesting' | 'recording' | 'error'

interface RecordingPanelProps {
  status: RecordingStatus
  elapsedSeconds: number
  errorMessage?: string
  onStart: () => void
  onStop: () => void
  onRetry: () => void
  onUseDemoTranscript: () => void
  onUploadAudio: (file: File) => void
  onOpenDemoPicker: () => void
}

export function RecordingPanel({
  status,
  elapsedSeconds,
  errorMessage,
  onStart,
  onStop,
  onRetry,
  onUseDemoTranscript,
  onUploadAudio,
  onOpenDemoPicker,
}: RecordingPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (status === 'error') {
    return (
      <Card className="animate-fadeUp p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Microphone access needed</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
          {errorMessage || 'Microphone access is required to record an encounter.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onRetry}>Try Again</Button>
          <Button variant="outline" onClick={onUseDemoTranscript}>
            Use Demo Transcript
          </Button>
        </div>
      </Card>
    )
  }

  const isRecording = status === 'recording'

  return (
    <Card className={cn('animate-fadeUp p-10 text-center transition-colors', isRecording && 'border-brand-300/70 dark:border-brand-500/40')}>
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-red-400/50" />
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-red-400/50 [animation-delay:0.6s]" />
          </>
        )}
        <button
          onClick={isRecording ? onStop : onStart}
          disabled={status === 'requesting'}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className={cn(
            'relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40',
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : cn('bg-brand-600 hover:bg-brand-700 disabled:opacity-60', status === 'idle' && 'animate-breathe')
          )}
        >
          {isRecording ? <Square className="h-8 w-8 text-white" fill="white" /> : <Mic className="h-9 w-9 text-white" />}
        </button>
      </div>

      {isRecording ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Recording · Listening…
          </div>
          <p className="font-mono text-3xl font-bold tabular-nums text-ink-900 dark:text-white">
            {formatDuration(elapsedSeconds)}
          </p>
          <Waveform active className="mx-auto max-w-md" />
          <ECGLine speed={1.7} className="mx-auto max-w-xs" />
          <Button variant="danger" onClick={onStop}>
            <Square className="h-4 w-4" fill="currentColor" /> Stop Recording
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-ink-900 dark:text-white">
              {status === 'requesting' ? 'Requesting microphone access…' : 'Ready to capture'}
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              Record the patient encounter summary. Speak naturally — CliniNote will structure it automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={onStart} disabled={status === 'requesting'}>
              <Mic className="h-4 w-4" /> Start Recording
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Audio
            </Button>
            <Button variant="secondary" onClick={onOpenDemoPicker}>
              <Sparkles className="h-4 w-4" /> Use Demo Encounter
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUploadAudio(file)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
