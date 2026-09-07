import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileStack, Search, Sparkles } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/StatusBadge'
import { getRecentNotes } from '../services/noteService'
import { useAsync } from '../lib/useAsync'
import { cn, formatDate, formatTime } from '../lib/utils'
import type { NoteStatus } from '../types/clinical'

type Filter = 'all' | 'today' | 'needs_review' | 'signed'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'needs_review', label: 'Needs Review' },
  { id: 'signed', label: 'Signed' },
]

export function Notes() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const { data: notes = [] } = useAsync(getRecentNotes, [])
  const today = new Date().toISOString().slice(0, 10)

  const filtered = notes.filter((n) => {
    const matchesQuery =
      !query ||
      n.patientName.toLowerCase().includes(query.toLowerCase()) ||
      n.encounterType.toLowerCase().includes(query.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'today' && n.date === today) ||
      (filter === 'needs_review' && (n.status === 'needs_review' || n.status === 'ai_generated')) ||
      (filter === 'signed' && n.status === 'signed')
    return matchesQuery && matchesFilter
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Recent Notes</h1>
          <p className="mt-1 text-sm text-ink-500">All clinical documentation, drafted and signed.</p>
        </div>
        <Button onClick={() => navigate('/app/new-note')}>
          <Sparkles className="h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search patient or note..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                filter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Encounter Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">AI Processing</th>
                  <th className="px-5 py-3 font-medium">Last Modified</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((n) => (
                  <tr
                    key={n.id}
                    className="cursor-pointer transition hover:bg-ink-50 dark:hover:bg-ink-800/50"
                    onClick={() => navigate(`/app/notes/${n.id}`)}
                  >
                    <td className="px-5 py-3.5 font-medium text-ink-800 dark:text-ink-100">{n.patientName}</td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(n.date)}</td>
                    <td className="px-5 py-3.5 text-ink-500">{n.encounterType}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={n.status as NoteStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{n.aiProcessingSeconds ? `${n.aiProcessingSeconds}s` : '—'}</td>
                    <td className="px-5 py-3.5 text-ink-500">{formatTime(n.lastModified)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/app/notes/${n.id}`)
                        }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800">
        <FileStack className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink-700 dark:text-ink-200">
        {query ? 'No matching notes' : 'No notes yet'}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-ink-400">
        {query
          ? `Nothing matches "${query}". Try a different search term or filter.`
          : 'Notes you document will show up here.'}
      </p>
    </div>
  )
}
