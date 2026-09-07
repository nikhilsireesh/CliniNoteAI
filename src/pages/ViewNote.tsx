import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { NoteReviewPanel } from '../components/NoteReviewPanel'
import { Button } from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../lib/useAsync'
import { genericExtractionSummary } from '../lib/noteSummary'
import { debounce } from '../lib/utils'
import { getSavedNote, saveNote, signNote } from '../services/noteService'
import type { ClinicalNote } from '../types/clinical'

/** Opens an already-saved note from Recent Notes (or a patient's timeline) for review,
 *  editing, export, and signing — the same UI the create flow ends on, loaded by id
 *  instead of freshly generated. */
export function ViewNote() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: loadedNote, loading } = useAsync(
    () => (noteId ? getSavedNote(noteId) : Promise.resolve(undefined)),
    [noteId]
  )
  const [note, setNoteState] = useState<ClinicalNote | null>(null)
  const [showPreSign, setShowPreSign] = useState(false)

  // Seed local editable state once the fetch resolves (and again if the route's id changes).
  useEffect(() => {
    setNoteState(loadedNote ?? null)
    setShowPreSign(false)
  }, [loadedNote])

  const debouncedSave = useMemo(
    () =>
      debounce((n: ClinicalNote) => {
        saveNote(n).catch(() => showToast('Could not save your edit — try again.', 'warning'))
      }, 800),
    [showToast]
  )

  const handleNoteChange = useCallback(
    (updated: ClinicalNote) => {
      setNoteState(updated)
      debouncedSave(updated)
    },
    [debouncedSave]
  )

  async function handleSign() {
    if (!note) return
    const signed = await signNote(note)
    setNoteState(signed)
    setShowPreSign(false)
    showToast('Clinical note finalized successfully.', 'success')
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-ink-500">{loading ? 'Loading note…' : 'Note not found.'}</p>
        {!loading && (
          <Button variant="outline" className="mt-4" onClick={() => navigate('/app/notes')}>
            Back to Recent Notes
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/app/notes')}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Recent Notes
      </button>

      <NoteReviewPanel
        note={note}
        onNoteChange={handleNoteChange}
        extractionSummary={genericExtractionSummary(note)}
        showPreSign={showPreSign}
        onRequestSign={() => setShowPreSign(true)}
        onSign={handleSign}
      />
    </div>
  )
}
