import { Badge } from './ui/Badge'
import type { NoteStatus } from '../types/clinical'

const CONFIG: Record<NoteStatus, { label: string; variant: 'neutral' | 'brand' | 'mint' | 'amber' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  ai_generated: { label: 'AI Generated', variant: 'brand' },
  needs_review: { label: 'Needs Review', variant: 'amber' },
  signed: { label: 'Signed', variant: 'mint' },
}

export function StatusBadge({ status }: { status: NoteStatus }) {
  const { label, variant } = CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
