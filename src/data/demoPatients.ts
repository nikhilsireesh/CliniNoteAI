import type { PatientRecord } from '../types/clinical'
import { demoEncounters } from './demoEncounters'

const fromEncounters = demoEncounters.map((e) => e.patient)

/** A few extra fictional patients so the Patients list feels like a real panel, not a 3-row demo. */
const extraPatients: PatientRecord[] = [
  {
    id: 'pat-park',
    name: 'Grace Park',
    age: 29,
    sex: 'Female',
    mrn: 'MRN-55021',
    lastVisit: '2026-09-07',
    noteCount: 1,
    status: 'New',
    avatarColor: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'pat-ibrahim',
    name: 'Omar Ibrahim',
    age: 52,
    sex: 'Male',
    mrn: 'MRN-40118',
    lastVisit: '2026-09-06',
    noteCount: 4,
    status: 'Active',
    avatarColor: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'pat-nguyen',
    name: 'Linh Nguyen',
    age: 38,
    sex: 'Female',
    mrn: 'MRN-33876',
    lastVisit: '2026-09-06',
    noteCount: 2,
    status: 'Follow-up',
    avatarColor: 'bg-mint-100 text-mint-600',
  },
  {
    id: 'pat-osei',
    name: 'Kwame Osei',
    age: 27,
    sex: 'Male',
    mrn: 'MRN-60234',
    lastVisit: '2026-09-04',
    noteCount: 1,
    status: 'New',
    avatarColor: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'pat-fischer',
    name: 'Elena Fischer',
    age: 55,
    sex: 'Female',
    mrn: 'MRN-71542',
    lastVisit: '2026-09-01',
    noteCount: 3,
    status: 'Active',
    avatarColor: 'bg-mint-100 text-mint-600',
  },
]

export const demoPatients: PatientRecord[] = [...fromEncounters, ...extraPatients]

export const getDemoPatient = (id: string) => demoPatients.find((p) => p.id === id)
