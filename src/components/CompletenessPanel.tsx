import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Progress } from './ui/Progress'
import type { DocumentationMeta, SoapSectionKey } from '../types/clinical'

const COMPLETE_ITEMS = ['Chief complaint', 'Duration', 'Symptoms', 'Vital signs']

interface CompletenessPanelProps {
  documentation: DocumentationMeta
  onJumpToSection?: (section: SoapSectionKey) => void
}

function guessSection(item: string): SoapSectionKey {
  const lower = item.toLowerCase()
  if (/(medication|allerg|history|complaint|symptom|duration)/.test(lower)) return 'subjective'
  if (/(vital|exam|lab|imaging)/.test(lower)) return 'objective'
  if (/(assessment)/.test(lower)) return 'assessment'
  return 'plan'
}

export function CompletenessPanel({ documentation, onJumpToSection }: CompletenessPanelProps) {
  const present = COMPLETE_ITEMS.filter((i) => !documentation.missingInformation.some((m) => m.toLowerCase().includes(i.toLowerCase())))

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink-900 dark:text-white">Documentation completeness</h3>
            <span className="text-lg font-bold text-ink-900 dark:text-white">{documentation.completeness}%</span>
          </div>
          <Progress value={documentation.completeness} className="mt-2.5" />
        </div>

        <ul className="space-y-2">
          {present.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-500" /> {item}
            </li>
          ))}
          {documentation.missingInformation.map((item) => (
            <li key={item}>
              <button
                onClick={() => onJumpToSection?.(guessSection(item))}
                className="flex w-full items-center gap-2 rounded-lg text-left text-sm text-amber-700 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
              >
                <TriangleAlert className="h-4 w-4 shrink-0" /> {item}
              </button>
            </li>
          ))}
        </ul>

        {documentation.missingInformation.length > 0 && (
          <p className="rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Some information wasn't documented. Review highlighted fields before signing.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
