import { useState } from 'react'
import { ChevronDown, FileDown, Printer } from 'lucide-react'
import { Button } from './ui/Button'
import { useToast } from '../context/ToastContext'
import { downloadNoteAsPdf } from '../lib/exportNote'
import type { ClinicalNote } from '../types/clinical'

export function ExportMenu({ note }: { note: ClinicalNote }) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { showToast } = useToast()

  const items = [
    {
      label: 'Export PDF',
      icon: FileDown,
      action: async () => {
        setOpen(false)
        setExporting(true)
        try {
          await downloadNoteAsPdf(note)
          showToast('Note downloaded as PDF.', 'success')
        } catch {
          showToast('Could not generate the PDF — try again.', 'warning')
        } finally {
          setExporting(false)
        }
      },
    },
    {
      label: 'Print',
      icon: Printer,
      action: () => {
        setOpen(false)
        window.print()
      },
    },
  ]

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={open} disabled={exporting}>
        <FileDown className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'} <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 animate-fadeUp overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-soft dark:border-ink-800 dark:bg-ink-800">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-700"
              >
                <item.icon className="h-4 w-4 text-ink-400" /> {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
