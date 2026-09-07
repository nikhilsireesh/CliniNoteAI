// Thin abstraction around browser speech recognition.
// Swap this implementation for a server-side Whisper call later without touching UI code —
// callers only depend on start/stop/callbacks, never on SpeechRecognition directly.

export interface SpeechRecognizerCallbacks {
  onInterimResult?: (text: string) => void
  onFinalResult?: (text: string) => void
  onEnd?: () => void
  onError?: (message: string) => void
}

export interface SpeechRecognizerController {
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!getRecognitionCtor()
}

/**
 * Creates a live speech-to-text recognizer backed by the Web Speech API.
 * Returns undefined when the browser doesn't support it — callers should fall back
 * to demo mode or manual transcript entry rather than crashing.
 */
export function createSpeechRecognizer(
  callbacks: SpeechRecognizerCallbacks
): SpeechRecognizerController | undefined {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return undefined

  const recognition = new Ctor()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'

  let finalTranscript = ''

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcriptPiece = result[0]?.transcript ?? ''
      if (result.isFinal) {
        finalTranscript += transcriptPiece + ' '
        callbacks.onFinalResult?.(finalTranscript.trim())
      } else {
        interim += transcriptPiece
      }
    }
    if (interim) callbacks.onInterimResult?.(interim)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    callbacks.onError?.(event.error || 'Speech recognition error')
  }

  recognition.onend = () => {
    callbacks.onEnd?.()
  }

  return {
    start: () => {
      finalTranscript = ''
      try {
        recognition.start()
      } catch {
        // starting twice throws in some browsers; safe to ignore
      }
    },
    stop: () => {
      try {
        recognition.stop()
      } catch {
        // no-op
      }
    },
  }
}

export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { granted: false, error: 'This browser does not support microphone access.' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return { granted: true }
  } catch {
    return { granted: false, error: 'Microphone access is required to record an encounter.' }
  }
}
