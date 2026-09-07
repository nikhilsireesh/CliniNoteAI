// The CliniNote Express app — routes only, no .listen() here, so this same app can be
// used both by the local dev server (server/index.ts) and by the Vercel serverless
// function (api/index.ts).
import express from 'express'
import cors from 'cors'
import * as db from './db.js'
import type { ClinicalNote } from '../src/types/clinical.js'

export const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// Runs the (idempotent, cached) migrate+seed before every request — cheap after the
// first call, and safer than a bare top-level await for a serverless cold start.
app.use(async (_req, _res, next) => {
  await db.ensureReady()
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/patients', async (_req, res) => {
  res.json(await db.getAllPatients())
})

app.get('/api/patients/:id', async (req, res) => {
  const patient = await db.getPatientById(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  const notes = await db.getNotesForPatient(req.params.id)
  const latestNote = notes[0] ? ((await db.getNoteById(notes[0].id)) ?? null) : null
  res.json({ patient, notes, latestNote })
})

app.post('/api/patients', async (req, res) => {
  const { name, age, sex, mrn, status } = req.body ?? {}
  if (!name || !mrn) return res.status(400).json({ error: 'Name and MRN are required' })
  const patient = await db.createPatient({
    name,
    age: Number(age) || 0,
    sex: sex || 'Other',
    mrn,
    status: status || 'New',
  })
  res.status(201).json(patient)
})

app.get('/api/notes', async (_req, res) => {
  res.json(await db.getNoteList())
})

app.get('/api/notes/:id', async (req, res) => {
  const note = await db.getNoteById(req.params.id)
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json(note)
})

app.post('/api/notes', async (req, res) => {
  const note = req.body as ClinicalNote
  if (!note?.id) return res.status(400).json({ error: 'Note must have an id' })
  res.json(await db.upsertNote(note))
})

app.patch('/api/notes/:id/sign', async (req, res) => {
  const signed = await db.signNoteById(req.params.id)
  if (!signed) return res.status(404).json({ error: 'Note not found' })
  res.json(signed)
})

app.get('/api/dashboard/stats', async (_req, res) => {
  res.json(await db.getDashboardStats())
})
