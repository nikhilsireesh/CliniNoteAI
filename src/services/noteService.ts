import type { ClinicalNote, NoteListItem } from '../types/clinical'

// Real persistence: these call the CliniNote API (server/index.ts), backed by a SQLite
// database (server/db.ts) — no more localStorage. In dev, Vite proxies /api/* to the
// Express server (see vite.config.ts) so this works with no extra setup.

const API_BASE = '/api'

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function saveNote(note: ClinicalNote): Promise<ClinicalNote> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  })
  return asJson<ClinicalNote>(res)
}

export async function getSavedNote(id: string): Promise<ClinicalNote | undefined> {
  const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(id)}`)
  if (res.status === 404) return undefined
  return asJson<ClinicalNote>(res)
}

export async function getRecentNotes(): Promise<NoteListItem[]> {
  const res = await fetch(`${API_BASE}/notes`)
  return asJson<NoteListItem[]>(res)
}

export async function signNote(note: ClinicalNote): Promise<ClinicalNote> {
  const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(note.id)}/sign`, { method: 'PATCH' })
  return asJson<ClinicalNote>(res)
}

// --- Dashboard-style aggregate stats, computed server-side from the notes table. ---
export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`)
  return asJson<{
    notesToday: number
    minutesSaved: number
    pendingReview: number
    avgConfidence: number
    completed: number
  }>(res)
}
