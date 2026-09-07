// CliniNote API server — Express + the SQLite database in ./db.ts.
// Runs alongside the Vite dev server (see `npm run dev`); Vite proxies /api/* here in dev
// (see vite.config.ts), so the frontend just calls relative /api/... URLs.
import express from 'express'
import cors from 'cors'
import * as db from './db.ts'
import type { ClinicalNote } from '../src/types/clinical.ts'

const PORT = Number(process.env.API_PORT) || 4000

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/patients', (_req, res) => {
  res.json(db.getAllPatients())
})

app.get('/api/patients/:id', (req, res) => {
  const patient = db.getPatientById(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  const notes = db.getNotesForPatient(req.params.id)
  const latestNote = notes[0] ? (db.getNoteById(notes[0].id) ?? null) : null
  res.json({ patient, notes, latestNote })
})

app.get('/api/notes', (_req, res) => {
  res.json(db.getNoteList())
})

app.get('/api/notes/:id', (req, res) => {
  const note = db.getNoteById(req.params.id)
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json(note)
})

app.post('/api/notes', (req, res) => {
  const note = req.body as ClinicalNote
  if (!note?.id) return res.status(400).json({ error: 'Note must have an id' })
  res.json(db.upsertNote(note))
})

app.patch('/api/notes/:id/sign', (req, res) => {
  const signed = db.signNoteById(req.params.id)
  if (!signed) return res.status(404).json({ error: 'Note not found' })
  res.json(signed)
})

app.get('/api/dashboard/stats', (_req, res) => {
  res.json(db.getDashboardStats())
})

app.listen(PORT, () => {
  console.log(`[api] CliniNote database API listening on http://localhost:${PORT}`)
})
