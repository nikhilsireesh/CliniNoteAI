import { ConfidenceBadge } from './ConfidenceBadge'
import { Textarea } from './ui/Input'
import type { ExtractedField } from '../types/clinical'
import { cn } from '../lib/utils'

interface FieldBlockProps {
  label: string
  field: ExtractedField<string>
  onViewSource?: (field: ExtractedField<string>, label: string) => void
  editing?: boolean
  onChangeValue?: (value: string) => void
  className?: string
}

/** A labeled block field (Chief Complaint, HPI, Assessment summary, etc.) with confidence + source trace. */
export function FieldBlock({ label, field, onViewSource, editing, onChangeValue, className }: FieldBlockProps) {
  const clickable = !!field.source?.excerpt && !!onViewSource && !editing

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</span>
        {!editing && <ConfidenceBadge field={field} />}
      </div>
      {editing ? (
        <Textarea
          rows={label === 'History of Present Illness' || label === 'Assessment Summary' ? 4 : 2}
          value={field.value === 'Not documented' ? '' : field.value}
          placeholder="Not documented"
          onChange={(e) => onChangeValue?.(e.target.value)}
          className="rounded-lg border border-brand-200 bg-brand-50/30 px-2.5 py-2 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-brand-500/30 dark:bg-brand-500/5"
        />
      ) : (
        <button
          type="button"
          disabled={!clickable}
          onClick={() => clickable && onViewSource?.(field, label)}
          className={cn(
            '-mx-1.5 block w-[calc(100%+12px)] rounded-lg px-1.5 py-0.5 text-left text-[15px] leading-relaxed text-ink-800 dark:text-ink-100',
            clickable && 'transition hover:bg-brand-50/70 dark:hover:bg-brand-500/10 cursor-pointer',
            field.notDocumented && 'italic text-ink-400 dark:text-ink-500'
          )}
        >
          {field.value || 'Not documented'}
        </button>
      )}
    </div>
  )
}

interface FieldListProps {
  label: string
  fields: ExtractedField<string>[]
  onViewSource?: (field: ExtractedField<string>, label: string) => void
  editing?: boolean
  onChangeValue?: (index: number, value: string) => void
  className?: string
}

/** A compact list of short extracted items (symptoms, medications, labs, plan items). */
export function FieldList({ label, fields, onViewSource, editing, onChangeValue, className }: FieldListProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <ul className="space-y-1.5">
        {fields.map((f, i) => {
          const clickable = !!f.source?.excerpt && !!onViewSource && !editing
          return (
            <li key={i}>
              {editing ? (
                <input
                  value={f.value === 'Not documented' ? '' : f.value}
                  placeholder="Not documented"
                  onChange={(e) => onChangeValue?.(i, e.target.value)}
                  className="w-full rounded-lg border border-brand-200 bg-brand-50/30 px-2.5 py-1.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-brand-500/30 dark:bg-brand-500/5 dark:text-ink-100"
                />
              ) : (
                <div
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-sm',
                    f.notDocumented ? 'italic text-ink-400' : 'text-ink-700 dark:text-ink-200'
                  )}
                >
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && onViewSource?.(f, label)}
                    className={cn(
                      '-mx-1.5 flex flex-1 items-center gap-2 rounded-lg px-1.5 py-0.5 text-left',
                      clickable && 'transition hover:bg-brand-50/70 dark:hover:bg-brand-500/10 cursor-pointer'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', f.notDocumented ? 'bg-ink-300' : 'bg-brand-400')} />
                    {f.value}
                  </button>
                  <ConfidenceBadge field={f} className="shrink-0" />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
