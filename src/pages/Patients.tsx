import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { getPatients } from '../services/patientService'
import { useAsync } from '../lib/useAsync'
import { cn, formatDateShort, initials } from '../lib/utils'

const STATUS_VARIANT = {
  Active: 'mint',
  'Follow-up': 'amber',
  New: 'brand',
} as const

export function Patients() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: patients = [] } = useAsync(getPatients, [])

  const filtered = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [patients, query]
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Patients</h1>
        <p className="mt-1 text-sm text-ink-500">Fictional demo patients for this prototype.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search patients..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <Users className="h-8 w-8 text-ink-300" />
          <h3 className="mt-3 text-sm font-semibold text-ink-700 dark:text-ink-200">No patients found</h3>
          <p className="mt-1 text-xs text-ink-400">Try a different search term.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/app/patients/${p.id}`)}
              className="text-left"
            >
              <Card className="h-full p-5 transition hover:border-brand-300 hover:shadow-soft dark:hover:border-brand-500/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold', p.avatarColor)}>
                      {initials(p.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-ink-400">
                        {p.age} · {p.sex} · {p.mrn}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                  <span>Last visit {formatDateShort(p.lastVisit)}</span>
                  <span>{p.noteCount} note{p.noteCount === 1 ? '' : 's'}</span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
