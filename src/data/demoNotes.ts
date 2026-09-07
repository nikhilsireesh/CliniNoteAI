import type { NoteListItem } from '../types/clinical'
import { demoEncounters } from './demoEncounters.js'

const fromEncounters: NoteListItem[] = demoEncounters.map((e) => ({
  id: e.note.id,
  patientName: e.patient.name,
  patientId: e.patient.id,
  date: e.note.date,
  encounterType: e.note.patient.encounterType,
  status: e.note.status,
  aiProcessingSeconds: e.note.aiProcessingSeconds,
  lastModified: e.note.lastModified,
}))

/** Extra rows to make the Recent Notes list feel like a real, busy practice. */
const extraNotes: NoteListItem[] = [
  {
    id: 'note-park-01',
    patientName: 'Grace Park',
    date: '2026-09-07',
    encounterType: 'Telehealth Visit',
    status: 'draft',
    aiProcessingSeconds: 0,
    lastModified: '2026-09-07T08:02:00Z',
  },
  {
    id: 'note-ibrahim-01',
    patientName: 'Omar Ibrahim',
    date: '2026-09-06',
    encounterType: 'Annual Physical',
    status: 'signed',
    aiProcessingSeconds: 6,
    lastModified: '2026-09-06T16:45:00Z',
  },
  {
    id: 'note-nguyen-01',
    patientName: 'Linh Nguyen',
    date: '2026-09-06',
    encounterType: 'Follow-up Visit',
    status: 'needs_review',
    aiProcessingSeconds: 11,
    lastModified: '2026-09-06T13:20:00Z',
  },
  {
    id: 'note-osei-01',
    patientName: 'Kwame Osei',
    date: '2026-09-04',
    encounterType: 'Urgent Care Visit',
    status: 'ai_generated',
    aiProcessingSeconds: 8,
    lastModified: '2026-09-04T10:11:00Z',
  },
  {
    id: 'note-fischer-01',
    patientName: 'Elena Fischer',
    date: '2026-09-01',
    encounterType: 'New Patient Visit',
    status: 'signed',
    aiProcessingSeconds: 9,
    lastModified: '2026-09-01T09:30:00Z',
  },
]

export const demoNotes: NoteListItem[] = [...fromEncounters, ...extraNotes].sort(
  (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
)
