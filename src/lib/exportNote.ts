import type { ClinicalNote } from '../types/clinical'
import { formatDate } from './utils'

const val = (v: { value: string; notDocumented?: boolean }) => (v.notDocumented ? 'Not documented' : v.value)
const listItems = (items: { value: string; notDocumented?: boolean }[]) =>
  items.length ? items.map(val) : ['Not documented']

/** Builds and downloads a real PDF file (selectable text, not a screenshot) from a
 *  ClinicalNote, mirroring the structure of PrintableNote. jsPDF is imported dynamically
 *  so it's only pulled into the bundle when someone actually exports. */
export async function downloadNoteAsPdf(note: ClinicalNote) {
  const { jsPDF } = await import('jspdf')
  const { patient, subjective, objective, assessment, plan } = note

  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const marginX = 54
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - marginX * 2
  const bottomLimit = pageHeight - 54
  let y = 56

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage()
      y = 56
    }
  }

  const sectionTitle = (title: string) => {
    ensureSpace(24)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title.toUpperCase(), marginX, y)
    y += 6
    doc.setDrawColor(60)
    doc.setLineWidth(1)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 16
  }

  const field = (label: string, value: string) => {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    const labelWidth = doc.getTextWidth(`${label}: `)
    const lines: string[] = doc.splitTextToSize(value || 'Not documented', contentWidth - labelWidth)
    ensureSpace(lines.length * 13 + 6)
    doc.text(`${label}:`, marginX, y)
    doc.setFont('helvetica', 'normal')
    doc.text(lines[0] ?? '', marginX + labelWidth, y)
    for (let i = 1; i < lines.length; i++) {
      y += 13
      doc.text(lines[i], marginX, y)
    }
    y += 15
  }

  const bulletList = (label: string, items: string[]) => {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    ensureSpace(14)
    doc.text(`${label}:`, marginX, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    for (const item of items) {
      const lines: string[] = doc.splitTextToSize(`•  ${item}`, contentWidth - 10)
      ensureSpace(lines.length * 13)
      for (const line of lines) {
        doc.text(line, marginX + 8, y)
        y += 13
      }
    }
    y += 4
  }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('CliniNote AI — Clinical Note', marginX, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('AI-assisted documentation, reviewed by clinician of record', marginX, y)
  y += 4
  doc.setDrawColor(0)
  doc.setLineWidth(1.5)
  y += 10
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 20

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient:', marginX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(patient.name, marginX + 60, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Encounter:', marginX + 280, y)
  doc.setFont('helvetica', 'normal')
  doc.text(patient.encounterType, marginX + 350, y)
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.text('Age / Sex:', marginX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${patient.age} / ${patient.sex}`, marginX + 60, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Status:', marginX + 280, y)
  doc.setFont('helvetica', 'normal')
  doc.text(note.status.replace('_', ' ').toUpperCase(), marginX + 350, y)
  y += 24

  sectionTitle('Subjective')
  field('Chief Complaint', val(subjective.chiefComplaint))
  field('History of Present Illness', val(subjective.historyOfPresentIllness))
  bulletList('Symptoms', listItems(subjective.symptoms))
  bulletList('Medications', listItems(subjective.medications))
  field('Allergies', val(subjective.allergies))
  field('Relevant History', val(subjective.relevantHistory))

  sectionTitle('Objective')
  field(
    'Vitals',
    `BP ${val(objective.vitals.bloodPressure)}  ·  HR ${val(objective.vitals.heartRate)}  ·  Temp ${val(objective.vitals.temperature)}  ·  SpO2 ${val(objective.vitals.oxygenSaturation)}`
  )
  field('Physical Exam', val(objective.physicalExam))
  bulletList('Labs', listItems(objective.labs))
  bulletList('Imaging', listItems(objective.imaging))

  sectionTitle('Assessment (AI-generated draft — clinician review required)')
  field('Summary', val(assessment.summary))
  bulletList('Items', listItems(assessment.items))

  sectionTitle('Plan')
  bulletList('Investigations', listItems(plan.investigations))
  bulletList('Medications', listItems(plan.medications))
  field('Follow-up', val(plan.followUp))
  field('Patient Education', val(plan.patientEducation))
  field('Return Precautions', val(plan.returnPrecautions))

  ensureSpace(40)
  doc.setDrawColor(180)
  doc.setLineWidth(0.75)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 14
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Documentation completeness: ${note.documentation.completeness}%   ·   ${note.signedAt ? `Signed ${formatDate(note.signedAt)}` : 'AI Draft — Needs Review'}`,
    marginX,
    y
  )
  y += 12
  const disclaimer = doc.splitTextToSize(
    'Generated with CliniNote AI. This is an AI-assisted draft; the clinician of record is responsible for its accuracy and content, and it is not a substitute for clinical judgment. Demo patient data — fictional.',
    contentWidth
  )
  doc.text(disclaimer, marginX, y)

  doc.save(`${note.patient.name.replace(/\s+/g, '_')}_${note.date}.pdf`)
}
