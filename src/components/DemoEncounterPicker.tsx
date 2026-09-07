import { X } from 'lucide-react'
import { demoEncounters } from '../data/demoEncounters'
import { initials } from '../lib/utils'

interface DemoEncounterPickerProps {
  onSelect: (encounterId: string) => void
  onClose: () => void
}

export function DemoEncounterPicker({ onSelect, onClose }: DemoEncounterPickerProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fadeUp rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900 dark:text-white">Choose a demo encounter</h3>
            <p className="text-xs text-ink-400">Loads a realistic transcript instantly — no microphone needed.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2.5">
          {demoEncounters.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className="flex w-full items-center gap-3.5 rounded-xl border border-ink-100 p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-ink-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${e.patient.avatarColor}`}>
                {initials(e.patient.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">
                  {e.patient.name} · {e.patient.age}{e.patient.sex[0]}
                </p>
                <p className="truncate text-xs text-ink-500">{e.note.subjective.chiefComplaint.value}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
