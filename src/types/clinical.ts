// Core clinical data types shared across the app.
// Kept deliberately close to the structured JSON contract the LLM must return,
// so a real API response can be dropped in without reshaping the UI layer.

export type ConfidenceLevel = 'high' | 'medium' | 'review'

export type NoteStatus = 'draft' | 'ai_generated' | 'needs_review' | 'signed'

export interface ExtractionSource {
  /** Verbatim (or lightly trimmed) excerpt from the transcript that supports this field. */
  excerpt: string
  /** Character offset range into the transcript, used to highlight the excerpt in place. */
  start?: number
  end?: number
}

/** A single piece of extracted clinical data, with provenance and confidence attached. */
export interface ExtractedField<T = string> {
  value: T
  confidence: ConfidenceLevel
  source?: ExtractionSource
  /** Present when the AI could not find this information in the transcript. */
  notDocumented?: boolean
}

export interface PatientRecord {
  id: string
  name: string
  age: number
  sex: 'Male' | 'Female' | 'Other'
  mrn: string
  lastVisit: string
  noteCount: number
  status: 'Active' | 'Follow-up' | 'New'
  avatarColor: string
}

export interface Vitals {
  bloodPressure: ExtractedField<string>
  heartRate: ExtractedField<string>
  temperature: ExtractedField<string>
  oxygenSaturation: ExtractedField<string>
  respiratoryRate?: ExtractedField<string>
}

export interface SubjectiveSection {
  chiefComplaint: ExtractedField<string>
  historyOfPresentIllness: ExtractedField<string>
  symptoms: ExtractedField<string>[]
  medications: ExtractedField<string>[]
  allergies: ExtractedField<string>
  relevantHistory: ExtractedField<string>
}

export interface ObjectiveSection {
  vitals: Vitals
  physicalExam: ExtractedField<string>
  labs: ExtractedField<string>[]
  imaging: ExtractedField<string>[]
}

export interface AssessmentSection {
  summary: ExtractedField<string>
  items: ExtractedField<string>[]
}

export interface PlanSection {
  investigations: ExtractedField<string>[]
  medications: ExtractedField<string>[]
  followUp: ExtractedField<string>
  patientEducation: ExtractedField<string>
  returnPrecautions: ExtractedField<string>
}

export interface DocumentationMeta {
  missingInformation: string[]
  reviewItems: string[]
  completeness: number // 0-100
}

export interface ClinicalNote {
  id: string
  patient: {
    name: string
    age: number
    sex: 'Male' | 'Female' | 'Other'
    encounterType: string
  }
  date: string
  status: NoteStatus
  transcript: string
  subjective: SubjectiveSection
  objective: ObjectiveSection
  assessment: AssessmentSection
  plan: PlanSection
  documentation: DocumentationMeta
  aiProcessingSeconds: number
  estimatedManualMinutes: number
  estimatedAiMinutes: number
  lastModified: string
  signedAt?: string
}

export type SoapSectionKey = 'subjective' | 'objective' | 'assessment' | 'plan'

export interface ProcessingStage {
  id: string
  label: string
  status: 'pending' | 'processing' | 'complete'
}

export interface AiExtractionSummary {
  label: string
  detail: string
}

export interface DemoEncounter {
  id: string
  patient: PatientRecord
  transcript: string
  note: ClinicalNote
  extractionSummary: AiExtractionSummary[]
}

/** Lightweight row shape for the Recent Notes table — avoids carrying full SOAP payloads. */
export interface NoteListItem {
  id: string
  patientName: string
  patientId?: string
  date: string
  encounterType: string
  status: NoteStatus
  aiProcessingSeconds: number
  lastModified: string
}
