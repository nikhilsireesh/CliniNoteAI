import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarClock, ClipboardList, Clock3, Gauge, Mic, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { StatCard } from '../components/StatCard'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/StatusBadge'
import { getDashboardStats, getRecentNotes } from '../services/noteService'
import { useAsync } from '../lib/useAsync'
import { formatDateShort } from '../lib/utils'

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const lastName = name.split(' ').slice(-1)[0]
  return `${time}, Dr. ${lastName}`
}

const EMPTY_STATS = { notesToday: 0, minutesSaved: 0, pendingReview: 0, avgConfidence: 0, completed: 0 }

export function Dashboard() {
  const { clinician } = useAuth()
  const navigate = useNavigate()
  const { data: stats = EMPTY_STATS } = useAsync(getDashboardStats, [])
  const { data: recentAll = [] } = useAsync(getRecentNotes, [])
  const recent = recentAll.slice(0, 5)

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
            {getGreeting(clinician.name)}
          </h1>
          <p className="mt-1 text-sm text-ink-500">Ready to document your next patient encounter?</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2"
        >
          <Button variant="outline" onClick={() => navigate('/app/new-note?demo=1')}>
            <Sparkles className="h-4 w-4" /> Try Demo Encounter
          </Button>
          <Button onClick={() => navigate('/app/new-note')} className="group">
            <Mic className="h-4 w-4 transition-transform group-hover:scale-110" /> New Note
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Notes Today" value={String(stats.notesToday)} icon={ClipboardList} tone="brand" delay={0} />
        <StatCard label="Time Saved" value={`${stats.minutesSaved} min`} hint="Estimated, not measured" icon={Clock3} tone="mint" delay={60} />
        <StatCard label="Pending Review" value={String(stats.pendingReview)} icon={CalendarClock} tone="amber" delay={120} />
        <StatCard label="Avg. AI Confidence" value={`${stats.avgConfidence}%`} hint="Extraction confidence" icon={Gauge} tone="brand" delay={180} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Recent notes</h2>
            <button
              onClick={() => navigate('/app/notes')}
              className="group flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
            >
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {recent.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                whileHover={{ x: 2 }}
                className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-800/40"
                onClick={() => navigate(`/app/notes/${note.id}`)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{note.patientName}</p>
                  <p className="truncate text-xs text-ink-400">
                    {note.encounterType} · {formatDateShort(note.date)}
                  </p>
                </div>
                <StatusBadge status={note.status} />
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="hover-lift">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-[15px] font-semibold text-ink-900 dark:text-white">Documentation ROI</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-ink-200/70 px-3.5 py-3 dark:border-ink-800">
                <span className="text-xs text-ink-500">Manual documentation</span>
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">~12 min</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-mint-300/60 px-3.5 py-3 dark:border-mint-500/30">
                <span className="text-xs text-mint-700 dark:text-mint-400">With CliniNote AI</span>
                <span className="text-sm font-semibold text-mint-700 dark:text-mint-400">~2 min</span>
              </div>
            </div>
            <p className="text-xs text-ink-400">
              You've saved approximately <span className="font-semibold text-ink-600 dark:text-ink-300">{stats.minutesSaved} minutes</span> today — an estimate based on typical documentation time, not a measured clinical outcome.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/app/new-note')}>
              Document a new encounter
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-brand-500">
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">AI-generated documentation — review before signing.</p>
            <p className="mt-1 text-xs text-ink-500">
              CliniNote AI drafts structured notes from your spoken encounter summary. You remain responsible for
              reviewing, editing, and approving every note before it becomes part of the record.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
