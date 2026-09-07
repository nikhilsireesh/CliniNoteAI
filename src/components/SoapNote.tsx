import { useRef, useState } from 'react'
import { ClipboardList, FileHeart, ListChecks, Stethoscope } from 'lucide-react'
import { SoapSection, type SectionAiAction } from './SoapSection'
import { FieldBlock, FieldList } from './ExtractedFieldView'
import { SourceTracePanel } from './SourceTracePanel'
import { Badge } from './ui/Badge'
import { useToast } from '../context/ToastContext'
import { useSectionHistory } from '../lib/useSectionHistory'
import { regenerateSection } from '../services/aiService'
import { formatDate } from '../lib/utils'
import type {
  AssessmentSection,
  ClinicalNote,
  ExtractedField,
  ObjectiveSection,
  PlanSection,
  SoapSectionKey,
  SubjectiveSection,
} from '../types/clinical'

type AnySection = SubjectiveSection | ObjectiveSection | AssessmentSection | PlanSection

interface SoapNoteProps {
  note: ClinicalNote
  onChange: (note: ClinicalNote) => void
}

/** Maps each section to the single narrative field AI "regenerate / concise / expand" actions apply to.
 *  Structured facts (vitals, meds, labs) are extraction-only and are never rewritten by AI actions. */
const NARRATIVE_FIELD: Record<SoapSectionKey, string> = {
  subjective: 'historyOfPresentIllness',
  objective: 'physicalExam',
  assessment: 'summary',
  plan: 'patientEducation',
}

export function SoapNote({ note, onChange }: SoapNoteProps) {
  const [editing, setEditing] = useState<Set<SoapSectionKey>>(new Set())
  const [sourceTrace, setSourceTrace] = useState<{ excerpt: string; label: string } | null>(null)
  const history = useSectionHistory<SoapSectionKey, AnySection>()
  const originalNote = useRef<ClinicalNote>(structuredClone(note))
  const { showToast } = useToast()
  const initialized = useRef(false)

  if (!initialized.current) {
    history.init('subjective', structuredClone(note.subjective))
    history.init('objective', structuredClone(note.objective))
    history.init('assessment', structuredClone(note.assessment))
    history.init('plan', structuredClone(note.plan))
    initialized.current = true
  }

  function patchSection<K extends SoapSectionKey>(section: K, updater: (draft: ClinicalNote[K]) => void) {
    const draft = structuredClone(note)
    updater(draft[section] as ClinicalNote[K])
    onChange({ ...draft, lastModified: new Date().toISOString() })
  }

  function toggleEdit(section: SoapSectionKey) {
    setEditing((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
        history.push(section, structuredClone(note[section]) as AnySection)
      } else {
        next.add(section)
      }
      return next
    })
  }

  function handleUndo(section: SoapSectionKey) {
    const prev = history.undo(section)
    if (prev) onChange({ ...note, [section]: prev, lastModified: new Date().toISOString() })
  }

  function handleRedo(section: SoapSectionKey) {
    const next = history.redo(section)
    if (next) onChange({ ...note, [section]: next, lastModified: new Date().toISOString() })
  }

  function handleCopy(section: SoapSectionKey) {
    const text = sectionToText(section, note)
    navigator.clipboard.writeText(text).then(
      () => showToast(`${labelFor(section)} copied to clipboard.`, 'success'),
      () => showToast('Could not copy — clipboard unavailable.', 'warning')
    )
  }

  async function handleAiAction(section: SoapSectionKey, action: SectionAiAction) {
    const fieldKey = NARRATIVE_FIELD[section] as keyof AnySection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (note[section] as any)[fieldKey] as ExtractedField<string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = (originalNote.current[section] as any)[fieldKey] as ExtractedField<string>

    const newText = await regenerateSection(section, action, current.value, original.value)

    const draft = structuredClone(note)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(draft[section] as any)[fieldKey].value = newText
    onChange({ ...draft, lastModified: new Date().toISOString() })
    history.push(section, structuredClone(draft[section]) as AnySection)
  }

  const openSource = (field: ExtractedField<string>, label: string) => {
    if (field.source?.excerpt) setSourceTrace({ excerpt: field.source.excerpt, label })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Clinical Note</p>
            <h2 className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{note.patient.name}</h2>
            <p className="mt-1 text-sm text-ink-500">
              {note.patient.age} y/o {note.patient.sex} · {note.patient.encounterType} · {formatDate(note.date)}
            </p>
          </div>
          <Badge variant={note.status === 'signed' ? 'mint' : 'amber'} className="text-[11px]">
            {note.status === 'signed' ? 'Signed' : 'AI Draft — Needs Review'}
          </Badge>
        </div>
      </div>

      <SoapSection
        title="Subjective"
        icon={FileHeart}
        id="soap-section-subjective"
        isEditing={editing.has('subjective')}
        onToggleEdit={() => toggleEdit('subjective')}
        onSave={() => toggleEdit('subjective')}
        onUndo={() => handleUndo('subjective')}
        onRedo={() => handleRedo('subjective')}
        canUndo={history.canUndo('subjective')}
        canRedo={history.canRedo('subjective')}
        onCopy={() => handleCopy('subjective')}
        onAiAction={(a) => handleAiAction('subjective', a)}
      >
        <div className="space-y-5">
          <FieldBlock
            label="Chief Complaint"
            field={note.subjective.chiefComplaint}
            editing={editing.has('subjective')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('subjective', (d) => (d.chiefComplaint.value = v))}
          />
          <FieldBlock
            label="History of Present Illness"
            field={note.subjective.historyOfPresentIllness}
            editing={editing.has('subjective')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('subjective', (d) => (d.historyOfPresentIllness.value = v))}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldList
              label="Symptoms"
              fields={note.subjective.symptoms}
              editing={editing.has('subjective')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('subjective', (d) => (d.symptoms[i].value = v))}
            />
            <FieldList
              label="Medications"
              fields={note.subjective.medications}
              editing={editing.has('subjective')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('subjective', (d) => (d.medications[i].value = v))}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldBlock
              label="Allergies"
              field={note.subjective.allergies}
              editing={editing.has('subjective')}
              onViewSource={openSource}
              onChangeValue={(v) => patchSection('subjective', (d) => (d.allergies.value = v))}
            />
            <FieldBlock
              label="Relevant History"
              field={note.subjective.relevantHistory}
              editing={editing.has('subjective')}
              onViewSource={openSource}
              onChangeValue={(v) => patchSection('subjective', (d) => (d.relevantHistory.value = v))}
            />
          </div>
        </div>
      </SoapSection>

      <SoapSection
        title="Objective"
        icon={Stethoscope}
        id="soap-section-objective"
        isEditing={editing.has('objective')}
        onToggleEdit={() => toggleEdit('objective')}
        onSave={() => toggleEdit('objective')}
        onUndo={() => handleUndo('objective')}
        onRedo={() => handleRedo('objective')}
        canUndo={history.canUndo('objective')}
        canRedo={history.canRedo('objective')}
        onCopy={() => handleCopy('objective')}
        onAiAction={(a) => handleAiAction('objective', a)}
      >
        <div className="space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Vital Signs</span>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-5">
              <FieldBlock
                label="Blood Pressure"
                field={note.objective.vitals.bloodPressure}
                editing={editing.has('objective')}
                onViewSource={openSource}
                onChangeValue={(v) => patchSection('objective', (d) => (d.vitals.bloodPressure.value = v))}
              />
              <FieldBlock
                label="Heart Rate"
                field={note.objective.vitals.heartRate}
                editing={editing.has('objective')}
                onViewSource={openSource}
                onChangeValue={(v) => patchSection('objective', (d) => (d.vitals.heartRate.value = v))}
              />
              <FieldBlock
                label="Temperature"
                field={note.objective.vitals.temperature}
                editing={editing.has('objective')}
                onViewSource={openSource}
                onChangeValue={(v) => patchSection('objective', (d) => (d.vitals.temperature.value = v))}
              />
              <FieldBlock
                label="SpO₂"
                field={note.objective.vitals.oxygenSaturation}
                editing={editing.has('objective')}
                onViewSource={openSource}
                onChangeValue={(v) => patchSection('objective', (d) => (d.vitals.oxygenSaturation.value = v))}
              />
            </div>
          </div>
          <FieldBlock
            label="Physical Examination"
            field={note.objective.physicalExam}
            editing={editing.has('objective')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('objective', (d) => (d.physicalExam.value = v))}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldList
              label="Laboratory Results"
              fields={note.objective.labs}
              editing={editing.has('objective')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('objective', (d) => (d.labs[i].value = v))}
            />
            <FieldList
              label="Imaging"
              fields={note.objective.imaging}
              editing={editing.has('objective')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('objective', (d) => (d.imaging[i].value = v))}
            />
          </div>
        </div>
      </SoapSection>

      <SoapSection
        title="Assessment"
        icon={ListChecks}
        id="soap-section-assessment"
        isEditing={editing.has('assessment')}
        onToggleEdit={() => toggleEdit('assessment')}
        onSave={() => toggleEdit('assessment')}
        onUndo={() => handleUndo('assessment')}
        onRedo={() => handleRedo('assessment')}
        canUndo={history.canUndo('assessment')}
        canRedo={history.canRedo('assessment')}
        onCopy={() => handleCopy('assessment')}
        onAiAction={(a) => handleAiAction('assessment', a)}
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            AI-generated draft — clinician review required
          </div>
          <FieldBlock
            label="Assessment Summary"
            field={note.assessment.summary}
            editing={editing.has('assessment')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('assessment', (d) => (d.summary.value = v))}
          />
          <FieldList
            label="Assessment Items"
            fields={note.assessment.items}
            editing={editing.has('assessment')}
            onViewSource={openSource}
            onChangeValue={(i, v) => patchSection('assessment', (d) => (d.items[i].value = v))}
          />
        </div>
      </SoapSection>

      <SoapSection
        title="Plan"
        icon={ClipboardList}
        id="soap-section-plan"
        isEditing={editing.has('plan')}
        onToggleEdit={() => toggleEdit('plan')}
        onSave={() => toggleEdit('plan')}
        onUndo={() => handleUndo('plan')}
        onRedo={() => handleRedo('plan')}
        canUndo={history.canUndo('plan')}
        canRedo={history.canRedo('plan')}
        onCopy={() => handleCopy('plan')}
        onAiAction={(a) => handleAiAction('plan', a)}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldList
              label="Investigations"
              fields={note.plan.investigations}
              editing={editing.has('plan')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('plan', (d) => (d.investigations[i].value = v))}
            />
            <FieldList
              label="Medications"
              fields={note.plan.medications}
              editing={editing.has('plan')}
              onViewSource={openSource}
              onChangeValue={(i, v) => patchSection('plan', (d) => (d.medications[i].value = v))}
            />
          </div>
          <FieldBlock
            label="Follow-up"
            field={note.plan.followUp}
            editing={editing.has('plan')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('plan', (d) => (d.followUp.value = v))}
          />
          <FieldBlock
            label="Patient Education"
            field={note.plan.patientEducation}
            editing={editing.has('plan')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('plan', (d) => (d.patientEducation.value = v))}
          />
          <FieldBlock
            label="Return Precautions"
            field={note.plan.returnPrecautions}
            editing={editing.has('plan')}
            onViewSource={openSource}
            onChangeValue={(v) => patchSection('plan', (d) => (d.returnPrecautions.value = v))}
          />
        </div>
      </SoapSection>

      {sourceTrace && (
        <SourceTracePanel
          transcript={note.transcript}
          excerpt={sourceTrace.excerpt}
          fieldLabel={sourceTrace.label}
          onClose={() => setSourceTrace(null)}
        />
      )}
    </div>
  )
}

function labelFor(section: SoapSectionKey) {
  return section[0].toUpperCase() + section.slice(1)
}

function sectionToText(section: SoapSectionKey, note: ClinicalNote): string {
  const v = (f: ExtractedField<string>) => (f.notDocumented ? 'Not documented' : f.value)
  const list = (fs: ExtractedField<string>[]) => fs.map(v).join(', ')

  switch (section) {
    case 'subjective':
      return `Chief Complaint: ${v(note.subjective.chiefComplaint)}\nHPI: ${v(note.subjective.historyOfPresentIllness)}\nSymptoms: ${list(note.subjective.symptoms)}\nMedications: ${list(note.subjective.medications)}\nAllergies: ${v(note.subjective.allergies)}\nRelevant History: ${v(note.subjective.relevantHistory)}`
    case 'objective':
      return `BP: ${v(note.objective.vitals.bloodPressure)}\nHR: ${v(note.objective.vitals.heartRate)}\nTemp: ${v(note.objective.vitals.temperature)}\nSpO2: ${v(note.objective.vitals.oxygenSaturation)}\nPhysical Exam: ${v(note.objective.physicalExam)}\nLabs: ${list(note.objective.labs)}\nImaging: ${list(note.objective.imaging)}`
    case 'assessment':
      return `${v(note.assessment.summary)}\n${list(note.assessment.items)}`
    case 'plan':
      return `Investigations: ${list(note.plan.investigations)}\nMedications: ${list(note.plan.medications)}\nFollow-up: ${v(note.plan.followUp)}\nPatient Education: ${v(note.plan.patientEducation)}\nReturn Precautions: ${v(note.plan.returnPrecautions)}`
  }
}
