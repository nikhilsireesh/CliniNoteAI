import { Check } from 'lucide-react'
import { SoapNote } from './SoapNote'
import { CompletenessPanel } from './CompletenessPanel'
import { AiTransparencyPanel } from './AiTransparencyPanel'
import { PreSignReview } from './PreSignReview'
import { ExportMenu } from './ExportMenu'
import { PrintableNote } from './PrintableNote'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import type { AiExtractionSummary, ClinicalNote, SoapSectionKey } from '../types/clinical'

interface NoteReviewPanelProps {
  note: ClinicalNote
  onNoteChange: (note: ClinicalNote) => void
  extractionSummary: AiExtractionSummary[]
  showPreSign: boolean
  onRequestSign: () => void
  onSign: () => void
}

/**
 * The full "review a structured note" layout: the editable SOAP sections plus a sidebar
 * (export, AI transparency, completeness, sign controls) and the hidden print-only note.
 * Shared between the note-creation flow (NewNote, step 3) and opening an already-saved
 * note from Recent Notes (ViewNote) — one place to keep them behaving identically.
 */
export function NoteReviewPanel({
  note,
  onNoteChange,
  extractionSummary,
  showPreSign,
  onRequestSign,
  onSign,
}: NoteReviewPanelProps) {
  const jumpToSection = (section: SoapSectionKey) => {
    document.getElementById(`soap-section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SoapNote note={note} onChange={onNoteChange} />
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <ExportMenu note={note} />
          </div>
          <AiTransparencyPanel items={extractionSummary} />
          <CompletenessPanel documentation={note.documentation} onJumpToSection={jumpToSection} />
          {note.status === 'signed' ? (
            <Card className="border-mint-300/60 p-5 text-center dark:border-mint-500/30">
              <Check className="mx-auto h-6 w-6 text-mint-600" />
              <p className="mt-2 text-sm font-semibold text-mint-700 dark:text-mint-400">Clinical note finalized successfully.</p>
              <p className="mt-1 text-[11px] text-mint-600/80 dark:text-mint-400/70">
                Signed {note.signedAt && new Date(note.signedAt).toLocaleString()}
              </p>
            </Card>
          ) : showPreSign ? (
            <PreSignReview onSign={onSign} completeness={note.documentation.completeness} />
          ) : (
            <Card>
              <CardContent>
                <Button className="w-full" size="lg" onClick={onRequestSign}>
                  Continue to Sign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PrintableNote note={note} />
    </>
  )
}
