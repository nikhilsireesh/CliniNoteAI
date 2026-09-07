import type { ClinicalNote } from '../types/clinical'
import { formatDate } from '../lib/utils'

const val = (v: { value: string; notDocumented?: boolean }) => (v.notDocumented ? 'Not documented' : v.value)

/** Hidden off-screen; made visible only by the print stylesheet (see index.css @media print). */
export function PrintableNote({ note }: { note: ClinicalNote }) {
  const { patient, subjective, objective, assessment, plan } = note

  return (
    <div id="printable-note" className="hidden font-serif-clinical text-[13px] text-black print:block">
      <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-lg font-bold">CliniNote AI — Clinical Note</p>
          <p className="text-xs">AI-assisted documentation, reviewed by clinician of record</p>
        </div>
        <p className="text-xs">{formatDate(note.date)}</p>
      </div>

      <table className="mb-4 w-full text-xs">
        <tbody>
          <tr>
            <td className="w-1/4 py-0.5 font-semibold">Patient</td>
            <td className="w-1/4">{patient.name}</td>
            <td className="w-1/4 font-semibold">Encounter</td>
            <td className="w-1/4">{patient.encounterType}</td>
          </tr>
          <tr>
            <td className="py-0.5 font-semibold">Age / Sex</td>
            <td>{patient.age} / {patient.sex}</td>
            <td className="font-semibold">Status</td>
            <td className="uppercase">{note.status.replace('_', ' ')}</td>
          </tr>
        </tbody>
      </table>

      <Section title="Subjective">
        <Line label="Chief Complaint" value={val(subjective.chiefComplaint)} />
        <Line label="History of Present Illness" value={val(subjective.historyOfPresentIllness)} block />
        <Line label="Symptoms" value={subjective.symptoms.map(val).join('; ')} />
        <Line label="Medications" value={subjective.medications.map(val).join('; ')} />
        <Line label="Allergies" value={val(subjective.allergies)} />
        <Line label="Relevant History" value={val(subjective.relevantHistory)} />
      </Section>

      <Section title="Objective">
        <Line
          label="Vitals"
          value={`BP ${val(objective.vitals.bloodPressure)} · HR ${val(objective.vitals.heartRate)} · Temp ${val(objective.vitals.temperature)} · SpO2 ${val(objective.vitals.oxygenSaturation)}`}
        />
        <Line label="Physical Exam" value={val(objective.physicalExam)} block />
        <Line label="Labs" value={objective.labs.map(val).join('; ')} />
        <Line label="Imaging" value={objective.imaging.map(val).join('; ')} />
      </Section>

      <Section title="Assessment (AI-generated draft — clinician review required)">
        <Line label="Summary" value={val(assessment.summary)} block />
        <Line label="Items" value={assessment.items.map(val).join('; ')} />
      </Section>

      <Section title="Plan">
        <Line label="Investigations" value={plan.investigations.map(val).join('; ')} />
        <Line label="Medications" value={plan.medications.map(val).join('; ')} />
        <Line label="Follow-up" value={val(plan.followUp)} />
        <Line label="Patient Education" value={val(plan.patientEducation)} />
        <Line label="Return Precautions" value={val(plan.returnPrecautions)} />
      </Section>

      <div className="mt-6 border-t border-black pt-2 text-[10px]">
        <p>Documentation completeness: {note.documentation.completeness}% · {note.signedAt ? `Signed ${formatDate(note.signedAt)}` : 'AI Draft — Needs Review'}</p>
        <p className="mt-1">
          Generated with CliniNote AI. This is an AI-assisted draft; the clinician of record is responsible for its
          accuracy and content, and it is not a substitute for clinical judgment. Demo patient data — fictional.
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 break-inside-avoid">
      <p className="mb-1 border-b border-black/40 pb-0.5 text-[12px] font-bold uppercase tracking-wide">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Line({ label, value, block }: { label: string; value: string; block?: boolean }) {
  return (
    <div className={block ? '' : 'flex gap-2'}>
      <span className="shrink-0 font-semibold">{label}:</span>
      <span className={block ? 'block' : ''}>{value || 'Not documented'}</span>
    </div>
  )
}
