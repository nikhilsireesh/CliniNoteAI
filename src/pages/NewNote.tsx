import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, ChevronRight, Sparkles } from 'lucide-react'
import { RecordingPanel, type RecordingStatus } from '../components/RecordingPanel'
import { TranscriptPanel } from '../components/TranscriptPanel'
import { DemoEncounterPicker } from '../components/DemoEncounterPicker'
import { ProcessingTimeline } from '../components/ProcessingTimeline'
import { ECGLine } from '../components/ECGLine'
import { NoteReviewPanel } from '../components/NoteReviewPanel'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useToast } from '../context/ToastContext'
import { useTypewriter } from '../lib/useTypewriter'
import { genericExtractionSummary } from '../lib/noteSummary'
import { cn } from '../lib/utils'
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  requestMicrophonePermission,
  type SpeechRecognizerController,
} from '../services/speechService'
import { PROCESSING_STAGES, structureClinicalNote } from '../services/aiService'
import { saveNote, signNote } from '../services/noteService'
import { demoEncounters, getEncounterById } from '../data/demoEncounters'
import type { AiExtractionSummary, ClinicalNote, ProcessingStage } from '../types/clinical'

const STEPS = [
  { id: 1, label: 'Capture' },
  { id: 2, label: 'Structure' },
  { id: 3, label: 'Review' },
]

const FALLBACK_DEMO_TRANSCRIPT = demoEncounters[0].transcript

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function NewNote() {
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(1)

  // --- Capture state ---
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isLive, setIsLive] = useState(false)
  const [showDemoPicker, setShowDemoPicker] = useState(false)
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [demoRevealTarget, setDemoRevealTarget] = useState('')

  const recognizerRef = useRef<SpeechRecognizerController | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // --- Structuring state ---
  const [stages, setStages] = useState<ProcessingStage[]>(
    PROCESSING_STAGES.map((s) => ({ ...s, status: 'pending' as const }))
  )
  const [isProcessing, setIsProcessing] = useState(false)

  // --- Review state ---
  const [note, setNote] = useState<ClinicalNote | null>(null)
  const [extractionSummary, setExtractionSummary] = useState<AiExtractionSummary[]>([])
  const [showPreSign, setShowPreSign] = useState(false)

  const { revealed, done: revealDone } = useTypewriter(demoRevealTarget, isLive, 3, 35)

  useEffect(() => {
    if (isLive && demoRevealTarget) setTranscript(revealed)
  }, [revealed, isLive, demoRevealTarget])

  useEffect(() => {
    if (isLive && demoRevealTarget && revealDone) {
      setIsLive(false)
    }
  }, [revealDone, isLive, demoRevealTarget])

  // Auto-load the first demo encounter when arriving from "Try Demo Encounter"
  useEffect(() => {
    if (searchParams.get('demo') === '1') {
      loadDemoEncounter(demoEncounters[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      recognizerRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function loadDemoEncounter(id: string) {
    const encounter = getEncounterById(id)
    if (!encounter) return
    setShowDemoPicker(false)
    setSelectedEncounterId(id)
    setTranscript('')
    setDemoRevealTarget(encounter.transcript)
    setIsLive(true)
    setErrorMessage(undefined)
    setRecordingStatus('idle')
    showToast(`Demo encounter loaded: ${encounter.patient.name}`, 'info')
  }

  async function handleStartRecording() {
    setErrorMessage(undefined)
    setRecordingStatus('requesting')
    const perm = await requestMicrophonePermission()
    if (!perm.granted) {
      setRecordingStatus('error')
      setErrorMessage(perm.error)
      return
    }

    setRecordingStatus('recording')
    setElapsed(0)
    setTranscript('')
    setSelectedEncounterId(null)
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)

    if (isSpeechRecognitionSupported()) {
      const recognizer = createSpeechRecognizer({
        onInterimResult: () => {
          /* interim text is transient; final results drive the transcript state */
        },
        onFinalResult: (text) => setTranscript(text),
        onError: () => {
          // Recognition hiccup mid-recording — keep the session going; user can still stop and review.
        },
      })
      recognizerRef.current = recognizer
      recognizer?.start()
    }
  }

  function handleStopRecording() {
    recognizerRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecordingStatus('idle')

    if (!transcript.trim()) {
      // No live transcript captured (unsupported browser, or recognizer produced nothing) —
      // fall back to a sample transcript so the demo never dead-ends.
      showToast("Live transcription wasn't available — showing a sample transcript to continue.", 'info')
      setTranscript(FALLBACK_DEMO_TRANSCRIPT)
    }
  }

  function handleUploadAudio(_file: File) {
    setRecordingStatus('requesting')
    setSelectedEncounterId(null)
    setTimeout(() => {
      setRecordingStatus('idle')
      setTranscript(FALLBACK_DEMO_TRANSCRIPT)
      showToast('Audio uploaded and transcribed (demo simulation).', 'success')
    }, 1200)
  }

  function handleRetryPermission() {
    setRecordingStatus('idle')
    setErrorMessage(undefined)
  }

  function handleUseDemoTranscriptFallback() {
    setRecordingStatus('idle')
    setErrorMessage(undefined)
    setTranscript(FALLBACK_DEMO_TRANSCRIPT)
  }

  const transcriptReady = !isLive && transcript.trim().length > 0

  async function runProcessing() {
    setIsProcessing(true)
    setStep(2)
    const freshStages = PROCESSING_STAGES.map((s) => ({ ...s, status: 'pending' as const }))
    setStages(freshStages)

    const notePromise = structureClinicalNote(transcript)

    for (let i = 0; i < freshStages.length; i++) {
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'processing' } : s)))
      await delay(420 + Math.random() * 220)
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'complete' } : s)))
    }

    const generated = await notePromise
    const matched = selectedEncounterId ? getEncounterById(selectedEncounterId) : undefined
    setExtractionSummary(matched?.extractionSummary ?? genericExtractionSummary(generated))
    setNote(generated)
    await saveNote(generated)
    setIsProcessing(false)
    setStep(3)
  }

  async function handleSign() {
    if (!note) return
    const signed = await signNote(note)
    setNote(signed)
    setShowPreSign(false)
    showToast('Clinical note finalized successfully.', 'success')
  }

  return (
    <div className="space-y-6">
      <StepHeader step={step} />

      {step === 1 && (
        <div className="space-y-5">
          <RecordingPanel
            status={recordingStatus}
            elapsedSeconds={elapsed}
            errorMessage={errorMessage}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onRetry={handleRetryPermission}
            onUseDemoTranscript={handleUseDemoTranscriptFallback}
            onUploadAudio={handleUploadAudio}
            onOpenDemoPicker={() => setShowDemoPicker(true)}
          />

          {(transcript || isLive) && (
            <TranscriptPanel
              text={transcript}
              isLive={isLive}
              isComplete={transcriptReady}
              onChange={setTranscript}
              onClear={() => {
                setTranscript('')
                setSelectedEncounterId(null)
              }}
              onReRecord={() => {
                setTranscript('')
                setSelectedEncounterId(null)
                handleStartRecording()
              }}
            />
          )}

          {transcriptReady && (
            <div className="flex justify-end">
              <Button size="lg" onClick={() => setStep(2)}>
                Continue to Structure <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showDemoPicker && (
            <DemoEncounterPicker onSelect={loadDemoEncounter} onClose={() => setShowDemoPicker(false)} />
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mx-auto max-w-2xl space-y-5">
          {!isProcessing && !note && (
            <Card className="animate-fadeUp p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-white">Analyze with AI</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
                CliniNote will read the transcript and draft a structured SOAP note for your review.
              </p>
              <Button size="lg" className="mt-6" onClick={runProcessing}>
                <Sparkles className="h-4 w-4" /> Generate SOAP Note
              </Button>
              <button onClick={() => setStep(1)} className="mt-4 block w-full text-xs font-medium text-ink-400 hover:text-ink-600">
                ← Back to transcript
              </button>
            </Card>
          )}

          {isProcessing && (
            <Card className="animate-fadeUp p-6 sm:p-8">
              <h3 className="mb-1 text-center text-lg font-semibold text-ink-900 dark:text-white">Structuring your note</h3>
              <p className="text-center text-sm text-ink-500">This usually takes just a few seconds.</p>
              <ECGLine speed={2.2} className="mx-auto -mt-1 mb-4 max-w-xs" />
              <ProcessingTimeline stages={stages} />
            </Card>
          )}
        </div>
      )}

      {step === 3 && note && (
        <NoteReviewPanel
          note={note}
          onNoteChange={setNote}
          extractionSummary={extractionSummary}
          showPreSign={showPreSign}
          onRequestSign={() => setShowPreSign(true)}
          onSign={handleSign}
        />
      )}
    </div>
  )
}

function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                step === s.id && 'bg-brand-600 text-white',
                step > s.id && 'bg-mint-500 text-white',
                step < s.id && 'bg-ink-100 text-ink-400 dark:bg-ink-800'
              )}
            >
              {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
            </span>
            <span className={cn('text-sm font-medium', step === s.id ? 'text-ink-900 dark:text-white' : 'text-ink-400')}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-ink-300" />}
        </div>
      ))}
    </div>
  )
}
