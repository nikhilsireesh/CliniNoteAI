import type { AiExtractionSummary, ClinicalNote } from '../types/clinical'

/** A generic "what the AI found" summary for notes that don't have a curated,
 *  demo-specific extractionSummary attached (i.e. anything not freshly generated from
 *  one of the canned demo encounters — including every note reopened later from
 *  Recent Notes). */
export function genericExtractionSummary(note: ClinicalNote): AiExtractionSummary[] {
  return [
    { label: 'Chief complaint detected', detail: note.subjective.chiefComplaint.value },
    { label: 'Vital signs detected', detail: 'Extracted where explicitly stated in the transcript' },
    { label: 'Assessment generated', detail: 'Drafted from reported symptoms and findings, pending clinician review' },
    { label: 'Plan generated', detail: 'Drafted where the transcript supported a recommendation' },
    { label: 'Missing information flagged', detail: `${note.documentation.missingInformation.length} field(s) need clinician input` },
  ]
}
