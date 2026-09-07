import type { ClinicalNote, NoteListItem, PatientRecord } from '../types/clinical'

// Patients, backed by the same SQLite database as notes (see server/db.ts).

const API_BASE = '/api'

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function getPatients(): Promise<PatientRecord[]> {
  const res = await fetch(`${API_BASE}/patients`)
  return asJson<PatientRecord[]>(res)
}

export interface PatientDetail {
  patient: PatientRecord
  notes: NoteListItem[]
  latestNote: ClinicalNote | null
}

export async function getPatientDetail(id: string): Promise<PatientDetail | undefined> {
  const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(id)}`)
  if (res.status === 404) return undefined
  return asJson<PatientDetail>(res)
}
