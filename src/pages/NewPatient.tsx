import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { createPatient } from '../services/patientService'
import { cn } from '../lib/utils'
import type { PatientRecord } from '../types/clinical'

const SEX_OPTIONS: PatientRecord['sex'][] = ['Female', 'Male', 'Other']
const STATUS_OPTIONS: PatientRecord['status'][] = ['New', 'Active', 'Follow-up']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">{label}</label>
      {children}
    </div>
  )
}

export function NewPatient() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<PatientRecord['sex']>('Female')
  const [mrn, setMrn] = useState('')
  const [status, setStatus] = useState<PatientRecord['status']>('New')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = name.trim().length > 0 && mrn.trim().length > 0 && !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const patient = await createPatient({ name, age: Number(age) || 0, sex, mrn, status })
      showToast(`${patient.name} added to Patients.`, 'success')
      navigate(`/app/patients/${patient.id}`)
    } catch {
      showToast('Could not add patient — try again.', 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New Patient</h1>
        <p className="mt-1 text-sm text-ink-500">Add a patient's basic details to start their record.</p>
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Patient details</h2>
              <p className="text-xs text-ink-400">You can document their first encounter afterward.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <Input
                placeholder="e.g. Jordan Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Age">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  placeholder="e.g. 34"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>
              <Field label="MRN">
                <Input placeholder="e.g. MRN-10234" value={mrn} onChange={(e) => setMrn(e.target.value)} />
              </Field>
            </div>

            <Field label="Sex">
              <div className="flex gap-2">
                {SEX_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={cn(
                      'flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                      sex === s ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Status">
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      'flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                      status === s ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/app/patients')}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? 'Adding…' : 'Add Patient'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
