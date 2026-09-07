import { demoEncounters } from '../data/demoEncounters'
import type {
  ClinicalNote,
  ConfidenceLevel,
  ExtractedField,
  ProcessingStage,
  SoapSectionKey,
} from '../types/clinical'

// ---------------------------------------------------------------------------
// This module is the single seam between the UI and "the LLM."
// structureClinicalNote() and regenerateSection() are the two calls a real
// backend (e.g. POST /api/structure-note backed by an LLM with a clinical
// extraction prompt) would fulfill. Until an API key is configured, both
// resolve locally: exact demo transcripts return their curated note, and any
// other transcript is run through a small heuristic extractor so the app
// never depends on an external service to demo well.
// ---------------------------------------------------------------------------

export const PROCESSING_STAGES: Omit<ProcessingStage, 'status'>[] = [
  { id: 'read', label: 'Reading transcript' },
  { id: 'identify', label: 'Identifying clinical information' },
  { id: 'separate', label: 'Separating subjective and objective findings' },
  { id: 'assessment', label: 'Building assessment' },
  { id: 'plan', label: 'Generating care plan' },
  { id: 'validate', label: 'Validating clinical structure' },
  { id: 'prepare', label: 'Preparing note' },
]

function field<T>(value: T, confidence: ConfidenceLevel, excerpt?: string, notDocumented = false): ExtractedField<T> {
  return { value, confidence, notDocumented, source: excerpt ? { excerpt } : undefined }
}

const notDocumented = () => field('Not documented', 'review' as ConfidenceLevel, undefined, true)

function findExcerpt(transcript: string, regex: RegExp): string | undefined {
  const match = transcript.match(regex)
  return match?.[0]
}

/** Naive, transparent heuristic extraction used when a transcript isn't one of the curated demos. */
function heuristicStructure(transcript: string): Omit<ClinicalNote, 'id' | 'date' | 'status' | 'lastModified'> {
  const sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const bp = findExcerpt(transcript, /\b\d{2,3}\s*(?:\/|over)\s*\d{2,3}\b/i)
  const hr = findExcerpt(transcript, /heart rate[^.,;]{0,20}?(\d{2,3})/i)
  const temp = findExcerpt(transcript, /temperature[^.,;]{0,25}?(\d{2,3}(?:\.\d)?)/i)
  const spo2 = findExcerpt(transcript, /(oxygen saturation|spo2|sp02)[^.,;]{0,20}?(\d{2,3})/i)

  const ageMatch = transcript.match(/(\d{1,3})[- ]year[- ]old/i)
  const sexMatch = transcript.match(/\b(male|female)\b/i)

  const cc = sentences[0] || 'Not documented'

  const symptomsWords = ['pain', 'cough', 'fever', 'nausea', 'headache', 'dizziness', 'fatigue', 'rash', 'vomiting', 'swelling']
  const foundSymptoms = symptomsWords.filter((w) => transcript.toLowerCase().includes(w))

  return {
    patient: {
      name: 'Unnamed Patient',
      age: ageMatch ? Number(ageMatch[1]) : 0,
      sex: (sexMatch?.[1]?.toLowerCase() === 'female' ? 'Female' : sexMatch ? 'Male' : 'Other') as 'Male' | 'Female' | 'Other',
      encounterType: 'General Visit',
    },
    transcript,
    subjective: {
      chiefComplaint: field(cc, 'medium', cc),
      historyOfPresentIllness: field(
        sentences.slice(0, 3).join(' ') || 'Not documented',
        'medium',
        sentences.slice(0, 3).join(' ') || undefined
      ),
      symptoms: foundSymptoms.length
        ? foundSymptoms.map((s) => field(s[0].toUpperCase() + s.slice(1), 'review' as ConfidenceLevel, s))
        : [notDocumented()],
      medications: [notDocumented()],
      allergies: notDocumented(),
      relevantHistory: notDocumented(),
    },
    objective: {
      vitals: {
        bloodPressure: bp ? field(bp.replace(/over/i, '/').replace(/\s+/g, ' '), 'medium', bp) : notDocumented(),
        heartRate: hr ? field(`${hr.match(/\d{2,3}/)?.[0]} bpm`, 'medium', hr) : notDocumented(),
        temperature: temp ? field(`${temp.match(/\d{2,3}(?:\.\d)?/)?.[0]}°`, 'medium', temp) : notDocumented(),
        oxygenSaturation: spo2 ? field(`${spo2.match(/\d{2,3}/)?.[0]}%`, 'medium', spo2) : notDocumented(),
      },
      physicalExam: notDocumented(),
      labs: [notDocumented()],
      imaging: [notDocumented()],
    },
    assessment: {
      summary: field(
        'Insufficient structured detail to draft a confident assessment from this transcript. Clinician input required.',
        'review'
      ),
      items: [field('Assessment pending clinician review', 'review')],
    },
    plan: {
      investigations: [notDocumented()],
      medications: [notDocumented()],
      followUp: notDocumented(),
      patientEducation: notDocumented(),
      returnPrecautions: notDocumented(),
    },
    documentation: {
      missingInformation: ['Medication history', 'Allergies', 'Physical exam findings', 'Assessment', 'Plan'],
      reviewItems: ['All AI-extracted fields — limited source transcript'],
      completeness: 38,
    },
    aiProcessingSeconds: 6,
    estimatedManualMinutes: 10,
    estimatedAiMinutes: 2,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Sends a transcript to be structured into a SOAP note.
 * Real implementation: POST /api/structure-note { transcript } -> validated ClinicalNote JSON.
 */
export async function structureClinicalNote(transcript: string): Promise<ClinicalNote> {
  await delay(600)

  const matched = demoEncounters.find((e) => e.transcript.trim() === transcript.trim())
  if (matched) {
    return { ...matched.note, id: `${matched.note.id}-${Date.now()}`, lastModified: new Date().toISOString() }
  }

  const structured = heuristicStructure(transcript)
  return {
    ...structured,
    id: `note-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    status: 'ai_generated',
    lastModified: new Date().toISOString(),
  }
}

type RegenerateAction = 'regenerate' | 'concise' | 'expand' | 'clarity' | 'undo'

/**
 * Applies a controlled AI edit to a single block of note text.
 * Real implementation: POST /api/regenerate-section { section, action, text } -> revised text.
 */
export async function regenerateSection(
  _section: SoapSectionKey,
  action: RegenerateAction,
  currentText: string,
  originalText?: string
): Promise<string> {
  await delay(500)

  switch (action) {
    case 'concise': {
      const sentences = currentText.split(/(?<=[.!?])\s+/).filter(Boolean)
      return sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(' ')
    }
    case 'expand':
      return `${currentText} Additional clinical context may be added here based on further clinician input.`
    case 'clarity':
      return currentText
        .replace(/\bpt\b/gi, 'patient')
        .replace(/\s+/g, ' ')
        .trim()
    case 'undo':
      return originalText ?? currentText
    case 'regenerate':
    default:
      return currentText
  }
}

export async function validateClinicalNote(note: ClinicalNote): Promise<{ valid: boolean; issues: string[] }> {
  await delay(200)
  const issues: string[] = []
  if (!note.subjective.chiefComplaint.value || note.subjective.chiefComplaint.notDocumented) {
    issues.push('Chief complaint is not documented.')
  }
  if (note.documentation.completeness < 50) {
    issues.push('Documentation completeness is below recommended threshold.')
  }
  return { valid: issues.length === 0, issues }
}
