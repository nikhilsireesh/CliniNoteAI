import { FileText, Sparkles, Stethoscope, UserPlus, Video } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const TEMPLATES = [
  {
    icon: Stethoscope,
    name: 'Standard SOAP Note',
    description: 'The default structure used across CliniNote — Subjective, Objective, Assessment, Plan.',
    active: true,
  },
  {
    icon: UserPlus,
    name: 'New Patient Intake',
    description: 'Adds intake-specific fields: social history, family history, and review of systems.',
    active: false,
  },
  {
    icon: Video,
    name: 'Telehealth Visit',
    description: 'Optimized for virtual encounters — omits in-person physical exam fields by default.',
    active: false,
  },
  {
    icon: FileText,
    name: 'Chronic Disease Follow-up',
    description: 'Emphasizes medication adherence, home monitoring, and trend tracking.',
    active: false,
  },
]

export function Templates() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Templates</h1>
        <p className="mt-1 text-sm text-ink-500">Choose how CliniNote structures your notes by encounter type.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <Card key={t.name} className={t.active ? 'border-brand-300 dark:border-brand-500/40' : ''}>
            <CardContent className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{t.name}</p>
                  {t.active && <Badge variant="brand">Default</Badge>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{t.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-500" />
          <p className="text-sm text-ink-500">
            Custom templates are coming soon — you'll be able to define your own section structure and defaults.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
