// CliniNote's database — libSQL (via @libsql/client), which speaks the same SQL as SQLite.
// Locally this defaults to a plain file (server/app.db) so `npm run dev` needs zero setup.
// In production (Vercel), set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to a real hosted Turso
// database — same code, same schema, same queries, just a network client instead of a file,
// which is what actually makes the data persist across serverless invocations.
import { createClient, type Client } from '@libsql/client'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { ClinicalNote, NoteListItem, PatientRecord } from '../src/types/clinical.js'
import { demoPatients } from '../src/data/demoPatients.js'
import { demoNotes } from '../src/data/demoNotes.js'
import { demoEncounters } from '../src/data/demoEncounters.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_DB_PATH = path.join(__dirname, 'app.db')

export const db: Client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${LOCAL_DB_PATH}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function migrate() {
  await db.execute(`
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
    )
  `)
  await db.execute(`
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
    )
  `)
}

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

// --- Seed: INSERT OR IGNORE, so it's safe to call on every cold start ------------

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

async function seed() {
  for (const p of demoPatients) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO patients (id, name, age, sex, mrn, last_visit, note_count, status, avatar_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.name, p.age, p.sex, p.mrn, p.lastVisit, p.noteCount, p.status, p.avatarColor],
    })
  }

  const fullNotesById = new Map(demoEncounters.map((e) => [e.note.id, e]))
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

    await db.execute({
      sql: `INSERT OR IGNORE INTO notes (
        id, patient_id, patient_name, patient_age, patient_sex, encounter_type, date, status,
        transcript, subjective, objective, assessment, plan, documentation,
        ai_processing_seconds, estimated_manual_minutes, estimated_ai_minutes, last_modified, signed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
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
        full?.note.signedAt ?? null,
      ],
    })
  }
}

// Runs once per cold start (module scope, so it's shared across requests on a warm
// serverless instance); INSERT OR IGNORE makes it safe even if two cold starts race.
let ready: Promise<void> | undefined
export function ensureReady(): Promise<void> {
  if (!ready) {
    ready = migrate().then(seed)
  }
  return ready
}

// --- Public query API --------------------------------------------------------------

export async function getAllPatients(): Promise<PatientRecord[]> {
  const { rows } = await db.execute('SELECT * FROM patients ORDER BY last_visit DESC')
  return (rows as unknown as PatientRow[]).map(patientFromRow)
}

export async function getPatientById(id: string): Promise<PatientRecord | undefined> {
  const { rows } = await db.execute({ sql: 'SELECT * FROM patients WHERE id = ?', args: [id] })
  const row = rows[0] as unknown as PatientRow | undefined
  return row ? patientFromRow(row) : undefined
}

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-mint-100 text-mint-600',
  'bg-amber-100 text-amber-600',
]

export interface NewPatientInput {
  name: string
  age: number
  sex: PatientRecord['sex']
  mrn: string
  status: PatientRecord['status']
}

export async function createPatient(input: NewPatientInput): Promise<PatientRecord> {
  const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const patient: PatientRecord = {
    id: `pat-${slug || 'patient'}-${Date.now()}`,
    name: input.name.trim(),
    age: input.age,
    sex: input.sex,
    mrn: input.mrn.trim(),
    lastVisit: new Date().toISOString().slice(0, 10),
    noteCount: 0,
    status: input.status,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  }
  await db.execute({
    sql: `INSERT INTO patients (id, name, age, sex, mrn, last_visit, note_count, status, avatar_color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      patient.id,
      patient.name,
      patient.age,
      patient.sex,
      patient.mrn,
      patient.lastVisit,
      patient.noteCount,
      patient.status,
      patient.avatarColor,
    ],
  })
  return patient
}

export async function getNoteList(): Promise<NoteListItem[]> {
  const { rows } = await db.execute('SELECT * FROM notes ORDER BY last_modified DESC')
  return (rows as unknown as NoteRow[]).map(noteToListItem)
}

export async function getNotesForPatient(patientId: string): Promise<NoteListItem[]> {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM notes WHERE patient_id = ? ORDER BY last_modified DESC',
    args: [patientId],
  })
  return (rows as unknown as NoteRow[]).map(noteToListItem)
}

export async function getNoteById(id: string): Promise<ClinicalNote | undefined> {
  const { rows } = await db.execute({ sql: 'SELECT * FROM notes WHERE id = ?', args: [id] })
  const row = rows[0] as unknown as NoteRow | undefined
  return row ? noteFromRow(row) : undefined
}

export async function upsertNote(note: ClinicalNote): Promise<ClinicalNote> {
  await db.execute({
    sql: `INSERT INTO notes (
      id, patient_id, patient_name, patient_age, patient_sex, encounter_type, date, status,
      transcript, subjective, objective, assessment, plan, documentation,
      ai_processing_seconds, estimated_manual_minutes, estimated_ai_minutes, last_modified, signed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      signed_at = excluded.signed_at`,
    args: [
      note.id,
      null,
      note.patient.name,
      note.patient.age,
      note.patient.sex,
      note.patient.encounterType,
      note.date,
      note.status,
      note.transcript,
      JSON.stringify(note.subjective),
      JSON.stringify(note.objective),
      JSON.stringify(note.assessment),
      JSON.stringify(note.plan),
      JSON.stringify(note.documentation),
      note.aiProcessingSeconds,
      note.estimatedManualMinutes,
      note.estimatedAiMinutes,
      note.lastModified,
      note.signedAt ?? null,
    ],
  })
  return note
}

export async function signNoteById(id: string): Promise<ClinicalNote | undefined> {
  const existing = await getNoteById(id)
  if (!existing) return undefined
  const signed: ClinicalNote = {
    ...existing,
    status: 'signed',
    signedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  }
  return upsertNote(signed)
}

export async function getDashboardStats() {
  const notes = await getNoteList()
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
