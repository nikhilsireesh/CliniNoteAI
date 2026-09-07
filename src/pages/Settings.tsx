import { useState } from 'react'
import { Database, Monitor, Moon, Palette, ShieldCheck, Sparkles, Sun, User } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/utils'

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">{title}</h2>
            <p className="text-xs text-ink-400">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">{label}</label>
      {children}
    </div>
  )
}

export function Settings() {
  const { clinician, isDemoMode } = useAuth()
  const { mode, setMode } = useTheme()
  const { showToast } = useToast()

  const [name, setName] = useState(clinician.name)
  const [specialty, setSpecialty] = useState(clinician.specialty)
  const [conciseness, setConciseness] = useState(50)
  const [detail, setDetail] = useState('Standard')

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your profile, documentation defaults, and preferences.</p>
      </div>

      <SettingsSection icon={User} title="Profile" description="Your clinician identity across CliniNote.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={clinician.role} disabled />
          </Field>
          <Field label="Specialty">
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={clinician.email} disabled />
          </Field>
        </div>
        <Button size="sm" onClick={() => showToast('Profile updated.', 'success')}>
          Save changes
        </Button>
      </SettingsSection>

      <SettingsSection icon={Sparkles} title="Documentation" description="Defaults applied to every new note.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default note format">
            <select className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900">
              <option>Standard SOAP Note</option>
              <option>New Patient Intake</option>
              <option>Telehealth Visit</option>
            </select>
          </Field>
          <Field label="Default encounter type">
            <select className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900">
              <option>Follow-up Visit</option>
              <option>New Patient Visit</option>
              <option>Urgent Care Visit</option>
            </select>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection icon={Sparkles} title="AI Preferences" description="Tune how CliniNote drafts your notes.">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-600 dark:text-ink-300">
            <span>Conciseness</span>
            <span className="text-ink-400">{conciseness < 40 ? 'Detailed' : conciseness > 65 ? 'Concise' : 'Balanced'}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={conciseness}
            onChange={(e) => setConciseness(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>
        <Field label="Clinical detail level">
          <div className="flex gap-2">
            {['Minimal', 'Standard', 'Comprehensive'].map((d) => (
              <button
                key={d}
                onClick={() => setDetail(d)}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                  detail === d ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Appearance" description="Choose how CliniNote looks on this device.">
        <div className="flex gap-2">
          {(
            [
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                mode === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'border-ink-200 text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800'
              )}
            >
              <opt.icon className="h-4 w-4" /> {opt.label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={ShieldCheck} title="Privacy" description="How this prototype handles data.">
        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 dark:bg-ink-800/60">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
            <Database className="h-4 w-4 text-ink-400" /> Demo Mode
          </div>
          <span className={cn('text-xs font-semibold', isDemoMode ? 'text-amber-600' : 'text-ink-400')}>
            {isDemoMode ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-ink-500">
          Data retention: notes and settings in this prototype are stored only in your browser's local storage —
          nothing is sent to a server unless a real speech-to-text or AI provider is configured. Demo data is
          fictional. This prototype is designed with privacy-conscious workflows in mind and is not intended for
          real patient-identifiable information.
        </p>
      </SettingsSection>
    </div>
  )
}
