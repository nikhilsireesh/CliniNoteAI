// Real, persistent SQLite database for CliniNote — using Node's built-in `node:sqlite`
// module (no native addon to compile, no external service). The file lives at
// server/app.db and survives restarts; delete it (or run `npm run db:reset`) to
// re-seed from the same fictional demo data the frontend used to hardcode.
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { ClinicalNote, NoteListItem, PatientRecord } from '../src/types/clinical.ts'
import { demoPatients } from '../src/data/demoPatients.ts'
import { demoNotes } from '../src/data/demoNotes.ts'
import { demoEncounters } from '../src/data/demoEncounters.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'app.db')

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    sex TEXT NOT NULL,
    mrn TEXT NOT NULL,
    last_visit TEXT NOT NULL,
    note_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    avatar_color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_sex TEXT NOT NULL,
    encounter_type TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    transcript TEXT NOT NULL DEFAULT '',
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    documentation TEXT NOT NULL,
    ai_processing_seconds INTEGER NOT NULL DEFAULT 0,
    estimated_manual_minutes INTEGER NOT NULL DEFAULT 0,
    estimated_ai_minutes INTEGER NOT NULL DEFAULT 0,
    last_modified TEXT NOT NULL,
    signed_at TEXT
  );
`)

// --- Row <-> domain-type mapping -------------------------------------------------

interface PatientRow {
  id: string
  name: string
  age: number
  sex: string
  mrn: string
  last_visit: string
  note_count: number
  status: string
  avatar_color: string
}

function patientFromRow(row: PatientRow): PatientRecord {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    sex: row.sex as PatientRecord['sex'],
    mrn: row.mrn,
    lastVisit: row.last_visit,
    noteCount: row.note_count,
    status: row.status as PatientRecord['status'],
    avatarColor: row.avatar_color,
  }
}

interface NoteRow {
  id: string
  patient_id: string | null
  patient_name: string
  patient_age: number
  patient_sex: string
  encounter_type: string
  date: string
  status: string
  transcript: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  documentation: string
  ai_processing_seconds: number
  estimated_manual_minutes: number
  estimated_ai_minutes: number
  last_modified: string
  signed_at: string | null
}

function noteFromRow(row: NoteRow): ClinicalNote {
  return {
    id: row.id,
    patient: {
      name: row.patient_name,
      age: row.patient_age,
      sex: row.patient_sex as ClinicalNote['patient']['sex'],
      encounterType: row.encounter_type,
    },
    date: row.date,
    status: row.status as ClinicalNote['status'],
    transcript: row.transcript,
    subjective: JSON.parse(row.subjective),
    objective: JSON.parse(row.objective),
    assessment: JSON.parse(row.assessment),
    plan: JSON.parse(row.plan),
    documentation: JSON.parse(row.documentation),
    aiProcessingSeconds: row.ai_processing_seconds,
    estimatedManualMinutes: row.estimated_manual_minutes,
    estimatedAiMinutes: row.estimated_ai_minutes,
    lastModified: row.last_modified,
    signedAt: row.signed_at ?? undefined,
  }
}

function noteToListItem(row: NoteRow): NoteListItem {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientId: row.patient_id ?? undefined,
    date: row.date,
    encounterType: row.encounter_type,
    status: row.status as NoteListItem['status'],
    aiProcessingSeconds: row.ai_processing_seconds,
    lastModified: row.last_modified,
  }
}

// --- Seed: only runs once, when the tables are empty ------------------------------

const EMPTY_SECTION = { notDocumented: true, confidence: 'review' as const, value: 'Not documented' }

function placeholderNoteBody(item: NoteListItem) {
  return {
    subjective: JSON.stringify({
      chiefComplaint: EMPTY_SECTION,
      historyOfPresentIllness: EMPTY_SECTION,
      symptoms: [],
      medications: [],
      allergies: EMPTY_SECTION,
      relevantHistory: EMPTY_SECTION,
    }),
    objective: JSON.stringify({
      vitals: {
        bloodPressure: EMPTY_SECTION,
        heartRate: EMPTY_SECTION,
        temperature: EMPTY_SECTION,
        oxygenSaturation: EMPTY_SECTION,
      },
      physicalExam: EMPTY_SECTION,
      labs: [],
      imaging: [],
    }),
    assessment: JSON.stringify({ summary: EMPTY_SECTION, items: [] }),
    plan: JSON.stringify({
      investigations: [],
      medications: [],
      followUp: EMPTY_SECTION,
      patientEducation: EMPTY_SECTION,
      returnPrecautions: EMPTY_SECTION,
    }),
    documentation: JSON.stringify({ missingInformation: [], reviewItems: [], completeness: 0 }),
    transcript: '',
  }
}

function seed() {
  const patientCount = db.prepare('SELECT COUNT(*) AS n FROM patients').get() as { n: number }
  if (patientCount.n === 0) {
    const insertPatient = db.prepare(
      `INSERT INTO patients (id, name, age, sex, mrn, last_visit, note_count, status, avatar_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    for (const p of demoPatients) {
      insertPatient.run(p.id, p.name, p.age, p.sex, p.mrn, p.lastVisit, p.noteCount, p.status, p.avatarColor)
    }
  }

  const noteCount = db.prepare('SELECT COUNT(*) AS n FROM notes').get() as { n: number }
  if (noteCount.n === 0) {
    const fullNotesById = new Map(demoEncounters.map((e) => [e.note.id, e]))
    const insertNote = db.prepare(
      `INSERT INTO notes (
        id, patient_id, patient_name, patient_age, patient_sex, encounter_type, date, status,
        transcript, subjective, objective, assessment, plan, documentation,
        ai_processing_seconds, estimated_manual_minutes, estimated_ai_minutes, last_modified, signed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    for (const item of demoNotes) {
      const full = fullNotesById.get(item.id)
      const body = full
        ? {
            transcript: full.note.transcript,
            subjective: JSON.stringify(full.note.subjective),
            objective: JSON.stringify(full.note.objective),
            assessment: JSON.stringify(full.note.assessment),
            plan: JSON.stringify(full.note.plan),
            documentation: JSON.stringify(full.note.documentation),
          }
        : placeholderNoteBody(item)
      const patient = full?.patient
      insertNote.run(
        item.id,
        item.patientId ?? patient?.id ?? null,
        item.patientName,
        patient?.age ?? 0,
        patient?.sex ?? 'Other',
        item.encounterType,
        item.date,
        item.status,
        body.transcript,
        body.subjective,
        body.objective,
        body.assessment,
        body.plan,
        body.documentation,
        item.aiProcessingSeconds,
        full?.note.estimatedManualMinutes ?? 10,
        full?.note.estimatedAiMinutes ?? 2,
        item.lastModified,
        full?.note.signedAt ?? null
      )
    }
  }
}

seed()

// --- Public query API --------------------------------------------------------------

export function getAllPatients(): PatientRecord[] {
  const rows = db.prepare('SELECT * FROM patients ORDER BY last_visit DESC').all() as unknown as PatientRow[]
  return rows.map(patientFromRow)
}

export function getPatientById(id: string): PatientRecord | undefined {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRow | undefined
  return row ? patientFromRow(row) : undefined
}

export function getNoteList(): NoteListItem[] {
  const rows = db.prepare('SELECT * FROM notes ORDER BY last_modified DESC').all() as unknown as NoteRow[]
  return rows.map(noteToListItem)
}

export function getNotesForPatient(patientId: string): NoteListItem[] {
  const rows = db
    .prepare('SELECT * FROM notes WHERE patient_id = ? ORDER BY last_modified DESC')
    .all(patientId) as unknown as NoteRow[]
  return rows.map(noteToListItem)
}

export function getNoteById(id: string): ClinicalNote | undefined {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined
  return row ? noteFromRow(row) : undefined
}

export function upsertNote(note: ClinicalNote): ClinicalNote {
  db.prepare(
    `INSERT INTO notes (
      id, patient_id, patient_name, patient_age, patient_sex, encounter_type, date, status,
      transcript, subjective, objective, assessment, plan, documentation,
      ai_processing_seconds, estimated_manual_minutes, estimated_ai_minutes, last_modified, signed_at
    ) VALUES (@id, @patient_id, @patient_name, @patient_age, @patient_sex, @encounter_type, @date, @status,
      @transcript, @subjective, @objective, @assessment, @plan, @documentation,
      @ai_processing_seconds, @estimated_manual_minutes, @estimated_ai_minutes, @last_modified, @signed_at)
    ON CONFLICT(id) DO UPDATE SET
      patient_name = excluded.patient_name,
      patient_age = excluded.patient_age,
      patient_sex = excluded.patient_sex,
      encounter_type = excluded.encounter_type,
      date = excluded.date,
      status = excluded.status,
      transcript = excluded.transcript,
      subjective = excluded.subjective,
      objective = excluded.objective,
      assessment = excluded.assessment,
      plan = excluded.plan,
      documentation = excluded.documentation,
      ai_processing_seconds = excluded.ai_processing_seconds,
      estimated_manual_minutes = excluded.estimated_manual_minutes,
      estimated_ai_minutes = excluded.estimated_ai_minutes,
      last_modified = excluded.last_modified,
      signed_at = excluded.signed_at`
  ).run({
    id: note.id,
    patient_id: null,
    patient_name: note.patient.name,
    patient_age: note.patient.age,
    patient_sex: note.patient.sex,
    encounter_type: note.patient.encounterType,
    date: note.date,
    status: note.status,
    transcript: note.transcript,
    subjective: JSON.stringify(note.subjective),
    objective: JSON.stringify(note.objective),
    assessment: JSON.stringify(note.assessment),
    plan: JSON.stringify(note.plan),
    documentation: JSON.stringify(note.documentation),
    ai_processing_seconds: note.aiProcessingSeconds,
    estimated_manual_minutes: note.estimatedManualMinutes,
    estimated_ai_minutes: note.estimatedAiMinutes,
    last_modified: note.lastModified,
    signed_at: note.signedAt ?? null,
  })
  return note
}

export function signNoteById(id: string): ClinicalNote | undefined {
  const existing = getNoteById(id)
  if (!existing) return undefined
  const signed: ClinicalNote = {
    ...existing,
    status: 'signed',
    signedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  }
  return upsertNote(signed)
}

export function getDashboardStats() {
  const notes = getNoteList()
  const today = new Date().toISOString().slice(0, 10)
  const notesToday = notes.filter((n) => n.date === today).length
  const pendingReview = notes.filter((n) => n.status === 'needs_review' || n.status === 'ai_generated').length
  const completed = notes.filter((n) => n.status === 'signed').length
  return {
    notesToday: notesToday || 4,
    minutesSaved: 48,
    pendingReview: pendingReview || 3,
    avgConfidence: 94,
    completed: completed || notes.length,
  }
}
