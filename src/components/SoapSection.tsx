import { useState, type ReactNode } from 'react'
import {
  Check,
  Copy,
  Loader2,
  MoreHorizontal,
  Pencil,
  Redo2,
  Sparkles,
  Undo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/utils'
import { useToast } from '../context/ToastContext'

export type SectionAiAction = 'regenerate' | 'concise' | 'expand' | 'clarity' | 'undo'

interface SoapSectionProps {
  title: string
  icon: LucideIcon
  id?: string
  isEditing: boolean
  onToggleEdit: () => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onCopy: () => void
  onAiAction: (action: SectionAiAction) => Promise<void> | void
  children: ReactNode
  className?: string
}

const AI_ACTIONS: { key: SectionAiAction; label: string; description: string }[] = [
  { key: 'regenerate', label: 'Regenerate', description: 'Draft this section again from the transcript.' },
  { key: 'concise', label: 'Make concise', description: 'Shorten while preserving clinical meaning.' },
  { key: 'expand', label: 'Expand', description: 'Add more clinical detail and context.' },
  { key: 'clarity', label: 'Improve clarity', description: 'Tidy phrasing and terminology.' },
  { key: 'undo', label: 'Undo AI changes', description: 'Revert to the original AI draft.' },
]

export function SoapSection({
  title,
  icon: Icon,
  id,
  isEditing,
  onToggleEdit,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopy,
  onAiAction,
  children,
  className,
}: SoapSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [busyAction, setBusyAction] = useState<SectionAiAction | null>(null)
  const { showToast } = useToast()

  const runAction = async (action: SectionAiAction) => {
    setMenuOpen(false)
    setBusyAction(action)
    try {
      await onAiAction(action)
      showToast(
        action === 'undo' ? 'Reverted to original AI draft.' : `${title} updated.`,
        'success'
      )
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <Card id={id} className={cn('animate-fadeUp overflow-visible scroll-mt-24', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-[15px] font-semibold text-ink-900 dark:text-white">{title}</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-400">
            <Sparkles className="h-2.5 w-2.5" /> AI Generated
          </span>
          {busyAction && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-300">
              <Loader2 className="h-3 w-3 animate-spin" /> Applying…
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            aria-label="Undo"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCopy}
            title="Copy section"
            aria-label="Copy section"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={isEditing ? onSave : onToggleEdit}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
          >
            {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {isEditing ? 'Save' : 'Edit'}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title="AI actions"
              aria-label="More AI actions"
              aria-expanded={menuOpen}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-64 animate-fadeUp overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-soft dark:border-ink-800 dark:bg-ink-800">
                  <p className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Improve {title}
                  </p>
                  {AI_ACTIONS.map((a) => (
                    <button
                      key={a.key}
                      onClick={() => runAction(a.key)}
                      className="flex w-full flex-col items-start px-3.5 py-2 text-left hover:bg-ink-50 dark:hover:bg-ink-700"
                    >
                      <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{a.label}</span>
                      <span className="text-[11px] text-ink-400">{a.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  )
}
