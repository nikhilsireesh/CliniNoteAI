import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, FileStack, Sparkles } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/StatusBadge'
import { getPatientDetail } from '../services/patientService'
import { useAsync } from '../lib/useAsync'
import { cn, formatDate, initials } from '../lib/utils'

const STATUS_VARIANT = { Active: 'mint', 'Follow-up': 'amber', New: 'brand' } as const

export function PatientProfile() {
  const { patientId } = useParams()
  const navigate = useNavigate()

  const { data, loading } = useAsync(
    () => (patientId ? getPatientDetail(patientId) : Promise.resolve(undefined)),
    [patientId]
  )
  const patient = data?.patient
  const notes = data?.notes ?? []
  const latestNote = data?.latestNote ?? null

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-ink-500">{loading ? 'Loading patient…' : 'Patient not found.'}</p>
        {!loading && (
          <Button variant="outline" className="mt-4" onClick={() => navigate('/app/patients')}>
            Back to Patients
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/app/patients')}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </button>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold', patient.avatarColor)}>
              {initials(patient.name)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink-900 dark:text-white">{patient.name}</h1>
              <p className="mt-0.5 text-sm text-ink-500">
                {patient.age} y/o · {patient.sex} · {patient.mrn}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[patient.status]}>{patient.status}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
              <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Recent encounters</h2>
              <Button size="sm" variant="outline" onClick={() => navigate('/app/new-note')}>
                <Sparkles className="h-3.5 w-3.5" /> New Note
              </Button>
            </div>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <FileStack className="h-7 w-7 text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">No documented encounters yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100 dark:divide-ink-800">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => navigate(`/app/notes/${n.id}`)}
                    className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-400 dark:bg-ink-800">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.encounterType}</p>
                        <p className="text-xs text-ink-400">{formatDate(n.date)}</p>
                      </div>
                    </div>
                    <StatusBadge status={n.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {latestNote && (
            <Card>
              <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
                <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Latest clinical note</h2>
              </div>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Chief Complaint</p>
                  <p className="mt-1 text-sm text-ink-800 dark:text-ink-100">{latestNote.subjective.chiefComplaint.value}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Assessment</p>
                  <p className="mt-1 text-sm text-ink-800 dark:text-ink-100">{latestNote.assessment.summary.value}</p>
                </div>
                {latestNote.transcript && (
                  <div className="rounded-lg bg-ink-50 p-3 text-xs italic text-ink-500 dark:bg-ink-800/60">
                    "{latestNote.transcript.slice(0, 160)}…"
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate(`/app/notes/${latestNote.id}`)}>
                  Open full note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Timeline</h2>
            <ol className="space-y-4 border-l-2 border-ink-100 pl-4 dark:border-ink-800">
              {notes.map((n) => (
                <li key={n.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{formatDate(n.date)}</p>
                  <p className="text-xs text-ink-400">{n.encounterType}</p>
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-ink-300 dark:bg-ink-600" />
                <p className="text-xs text-ink-400">Patient record created</p>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
