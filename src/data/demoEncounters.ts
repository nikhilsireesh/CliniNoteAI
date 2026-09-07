import type {
  ClinicalNote,
  ConfidenceLevel,
  DemoEncounter,
  ExtractedField,
  PatientRecord,
} from '../types/clinical'

/** Builds an ExtractedField, auto-locating the source excerpt inside a transcript when provided. */
function field<T>(
  value: T,
  confidence: ConfidenceLevel,
  excerpt?: string,
  notDocumented = false
): ExtractedField<T> {
  return {
    value,
    confidence,
    notDocumented,
    source: excerpt ? { excerpt } : undefined,
  }
}

// ---------------------------------------------------------------------------
// Encounter 1 — Michael Anderson, 45M, persistent cough
// ---------------------------------------------------------------------------

const cough_transcript =
  "Michael is a 45-year-old male who presents with a dry cough that has been going on for about two weeks. He says the cough is worse at night and has had intermittent low-grade fever. He denies chest pain or shortness of breath. He has no known drug allergies. His blood pressure today is 128 over 82, heart rate 84, temperature 37.8 Celsius, and oxygen saturation is 98 percent. On examination, there is mild pharyngeal erythema but no respiratory distress."

const michaelAnderson: PatientRecord = {
  id: 'pat-anderson',
  name: 'Michael Anderson',
  age: 45,
  sex: 'Male',
  mrn: 'MRN-48213',
  lastVisit: '2026-09-07',
  noteCount: 3,
  status: 'Follow-up',
  avatarColor: 'bg-brand-100 text-brand-700',
}

const coughNote: ClinicalNote = {
  id: 'note-anderson-01',
  patient: { name: 'Michael Anderson', age: 45, sex: 'Male', encounterType: 'Follow-up Visit' },
  date: '2026-09-07',
  status: 'ai_generated',
  transcript: cough_transcript,
  subjective: {
    chiefComplaint: field(
      'Persistent dry cough for approximately two weeks.',
      'high',
      'dry cough that has been going on for about two weeks'
    ),
    historyOfPresentIllness: field(
      '45-year-old male reports a dry cough for two weeks, worse at night, with intermittent low-grade fever. Denies chest pain or shortness of breath.',
      'high',
      'dry cough that has been going on for about two weeks. He says the cough is worse at night and has had intermittent low-grade fever. He denies chest pain or shortness of breath'
    ),
    symptoms: [
      field('Dry cough, 2 weeks duration', 'high', 'dry cough that has been going on for about two weeks'),
      field('Intermittent low-grade fever, worse at night', 'medium', 'worse at night and has had intermittent low-grade fever'),
      field('No chest pain', 'high', 'denies chest pain'),
      field('No shortness of breath', 'high', 'or shortness of breath'),
    ],
    medications: [field('Not documented', 'review', undefined, true)],
    allergies: field('No known drug allergies (NKDA)', 'high', 'no known drug allergies'),
    relevantHistory: field('Not documented', 'review', undefined, true),
  },
  objective: {
    vitals: {
      bloodPressure: field('128/82 mmHg', 'high', 'blood pressure today is 128 over 82'),
      heartRate: field('84 bpm', 'high', 'heart rate 84'),
      temperature: field('37.8°C', 'high', 'temperature 37.8 Celsius'),
      oxygenSaturation: field('98%', 'high', 'oxygen saturation is 98 percent'),
    },
    physicalExam: field(
      'Mild pharyngeal erythema. No respiratory distress noted.',
      'high',
      'mild pharyngeal erythema but no respiratory distress'
    ),
    labs: [field('Not documented', 'review', undefined, true)],
    imaging: [field('Not documented', 'review', undefined, true)],
  },
  assessment: {
    summary: field(
      'Presentation consistent with an uncomplicated upper respiratory tract infection, likely viral. No red-flag findings for pneumonia or lower airway involvement reported. Clinical correlation and clinician confirmation required.',
      'medium'
    ),
    items: [
      field('Acute upper respiratory infection, likely viral etiology', 'medium'),
      field('Subacute cough (2 weeks), improving risk profile without dyspnea', 'medium'),
    ],
  },
  plan: {
    investigations: [field('Not documented', 'review', undefined, true)],
    medications: [field('Not documented', 'review', undefined, true)],
    followUp: field('Not documented', 'review', undefined, true),
    patientEducation: field(
      'Advise rest, hydration, and monitoring of symptoms. Avoid irritants (smoke, strong odors) while cough resolves.',
      'medium'
    ),
    returnPrecautions: field(
      'Return or seek urgent care if fever persists beyond 3–5 days, or if shortness of breath, chest pain, or hemoptysis develop.',
      'medium'
    ),
  },
  documentation: {
    missingInformation: ['Medication history', 'Follow-up instructions', 'Investigations ordered'],
    reviewItems: ['Fever duration (approximate)', 'Assessment — clinician confirmation required'],
    completeness: 86,
  },
  aiProcessingSeconds: 8,
  estimatedManualMinutes: 12,
  estimatedAiMinutes: 2,
  lastModified: '2026-09-07T09:12:00Z',
}

// ---------------------------------------------------------------------------
// Encounter 2 — Sarah Chen, 32F, migraine / headache
// ---------------------------------------------------------------------------

const migraine_transcript =
  "Sarah is a 32-year-old female presenting today with recurrent headaches over the past month, occurring about twice a week. She describes the pain as throbbing, on the right side, associated with nausea and sensitivity to light. Episodes last anywhere from a few hours up to a full day. She mentions taking over-the-counter ibuprofen with only partial relief. No known drug allergies reported. She denies any visual aura before the headaches. Family history is notable for migraines in her mother. Blood pressure is 118 over 76, heart rate 78, temperature 36.9 Celsius. Neurological exam is grossly normal, no focal deficits, cranial nerves intact."

const sarahChen: PatientRecord = {
  id: 'pat-chen',
  name: 'Sarah Chen',
  age: 32,
  sex: 'Female',
  mrn: 'MRN-31890',
  lastVisit: '2026-09-05',
  noteCount: 2,
  status: 'New',
  avatarColor: 'bg-mint-100 text-mint-600',
}

const migraineNote: ClinicalNote = {
  id: 'note-chen-01',
  patient: { name: 'Sarah Chen', age: 32, sex: 'Female', encounterType: 'New Patient Visit' },
  date: '2026-09-05',
  status: 'needs_review',
  transcript: migraine_transcript,
  subjective: {
    chiefComplaint: field(
      'Recurrent headaches over the past month.',
      'high',
      'recurrent headaches over the past month'
    ),
    historyOfPresentIllness: field(
      '32-year-old female with headaches roughly twice weekly over the past month, throbbing and right-sided, associated with nausea and photophobia. Episodes last hours to a full day. Partial relief with OTC ibuprofen. No visual aura.',
      'high',
      'throbbing, on the right side, associated with nausea and sensitivity to light. Episodes last anywhere from a few hours up to a full day'
    ),
    symptoms: [
      field('Throbbing, right-sided headache', 'high', 'throbbing, on the right side'),
      field('Nausea', 'high', 'associated with nausea'),
      field('Photophobia (light sensitivity)', 'high', 'sensitivity to light'),
      field('No visual aura', 'high', 'denies any visual aura before the headaches'),
      field('Frequency: ~2x per week for 1 month', 'medium', 'past month, occurring about twice a week'),
    ],
    medications: [field('OTC ibuprofen (partial relief)', 'medium', 'taking over-the-counter ibuprofen with only partial relief')],
    allergies: field('No known drug allergies (NKDA)', 'high', 'No known drug allergies reported'),
    relevantHistory: field('Family history of migraine (mother)', 'medium', 'Family history is notable for migraines in her mother'),
  },
  objective: {
    vitals: {
      bloodPressure: field('118/76 mmHg', 'high', 'Blood pressure is 118 over 76'),
      heartRate: field('78 bpm', 'high', 'heart rate 78'),
      temperature: field('36.9°C', 'high', 'temperature 36.9 Celsius'),
      oxygenSaturation: field('Not documented', 'review', undefined, true),
    },
    physicalExam: field(
      'Neurological exam grossly normal. No focal deficits. Cranial nerves II–XII intact.',
      'high',
      'Neurological exam is grossly normal, no focal deficits, cranial nerves intact'
    ),
    labs: [field('Not documented', 'review', undefined, true)],
    imaging: [field('Not documented', 'review', undefined, true)],
  },
  assessment: {
    summary: field(
      'Clinical picture consistent with migraine without aura, given episodic throbbing unilateral headache with nausea and photophobia and a normal neurological exam. No red-flag features (no aura, no focal deficits) reported. Clinician correlation required before finalizing diagnosis.',
      'medium'
    ),
    items: [
      field('Migraine without aura, recurrent', 'medium'),
      field('Suboptimal response to OTC analgesia', 'medium'),
    ],
  },
  plan: {
    investigations: [field('Not documented — consider if red-flag features emerge', 'review')],
    medications: [
      field('Not documented — prescription abortive therapy not discussed in encounter', 'review', undefined, true),
    ],
    followUp: field('Not documented', 'review', undefined, true),
    patientEducation: field(
      'Discuss headache trigger diary, sleep hygiene, and hydration. Review appropriate use of OTC analgesics to avoid medication-overuse headache.',
      'medium'
    ),
    returnPrecautions: field(
      'Seek urgent evaluation for sudden "worst headache of life," fever with neck stiffness, new neurological deficits, or headache after head trauma.',
      'medium'
    ),
  },
  documentation: {
    missingInformation: ['Oxygen saturation', 'Prescription medication plan', 'Follow-up timeframe', 'Imaging (if indicated)'],
    reviewItems: ['Headache frequency (approximate)', 'Assessment — clinician confirmation required', 'Family history detail'],
    completeness: 71,
  },
  aiProcessingSeconds: 9,
  estimatedManualMinutes: 14,
  estimatedAiMinutes: 3,
  lastModified: '2026-09-05T14:40:00Z',
}

// ---------------------------------------------------------------------------
// Encounter 3 — Robert Delgado, 61M, hypertension follow-up
// ---------------------------------------------------------------------------

const htn_transcript =
  "Robert is a 61-year-old male here for a routine hypertension follow-up. He reports good adherence to his lisinopril 10 milligrams once daily and says he's been checking his blood pressure at home, averaging around 134 over 85. He denies chest pain, palpitations, shortness of breath, or swelling in his legs. He says he's cut back on sodium and has been walking most days. No new medication allergies. Today's blood pressure is 132 over 84, heart rate 72, temperature 36.7 Celsius, oxygen saturation 99 percent. Cardiovascular exam reveals a regular rate and rhythm, no murmurs, no peripheral edema. Recent labs from last week show a basic metabolic panel within normal limits and a lipid panel with LDL slightly elevated at 138."

const robertDelgado: PatientRecord = {
  id: 'pat-delgado',
  name: 'Robert Delgado',
  age: 61,
  sex: 'Male',
  mrn: 'MRN-20745',
  lastVisit: '2026-09-02',
  noteCount: 6,
  status: 'Active',
  avatarColor: 'bg-amber-100 text-amber-600',
}

const htnNote: ClinicalNote = {
  id: 'note-delgado-01',
  patient: { name: 'Robert Delgado', age: 61, sex: 'Male', encounterType: 'Chronic Disease Follow-up' },
  date: '2026-09-02',
  status: 'signed',
  transcript: htn_transcript,
  subjective: {
    chiefComplaint: field(
      'Routine hypertension follow-up.',
      'high',
      'here for a routine hypertension follow-up'
    ),
    historyOfPresentIllness: field(
      '61-year-old male on lisinopril 10 mg daily for hypertension, reporting good medication adherence. Home blood pressure readings average 134/85. Denies chest pain, palpitations, dyspnea, or lower extremity edema. Reports dietary sodium reduction and regular walking.',
      'high',
      'good adherence to his lisinopril 10 milligrams once daily and says he\'s been checking his blood pressure at home, averaging around 134 over 85'
    ),
    symptoms: [
      field('No chest pain', 'high', 'denies chest pain'),
      field('No palpitations', 'high', 'palpitations'),
      field('No shortness of breath', 'high', 'shortness of breath'),
      field('No leg swelling', 'high', 'swelling in his legs'),
    ],
    medications: [field('Lisinopril 10 mg, once daily (good adherence reported)', 'high', 'lisinopril 10 milligrams once daily')],
    allergies: field('No new medication allergies reported', 'high', 'No new medication allergies'),
    relevantHistory: field(
      'Home BP monitoring averaging 134/85. Lifestyle modification: reduced sodium intake, regular walking most days.',
      'high',
      'cut back on sodium and has been walking most days'
    ),
  },
  objective: {
    vitals: {
      bloodPressure: field('132/84 mmHg', 'high', "Today's blood pressure is 132 over 84"),
      heartRate: field('72 bpm', 'high', 'heart rate 72'),
      temperature: field('36.7°C', 'high', 'temperature 36.7 Celsius'),
      oxygenSaturation: field('99%', 'high', 'oxygen saturation 99 percent'),
    },
    physicalExam: field(
      'Cardiovascular exam: regular rate and rhythm, no murmurs, no peripheral edema.',
      'high',
      'regular rate and rhythm, no murmurs, no peripheral edema'
    ),
    labs: [
      field('Basic metabolic panel (last week): within normal limits', 'high', 'basic metabolic panel within normal limits'),
      field('Lipid panel (last week): LDL mildly elevated at 138 mg/dL', 'high', 'lipid panel with LDL slightly elevated at 138'),
    ],
    imaging: [field('Not documented', 'review', undefined, true)],
  },
  assessment: {
    summary: field(
      'Hypertension, currently well-controlled on lisinopril with favorable home readings and reported lifestyle adherence. Mild LDL elevation noted on recent lipid panel. No evidence of end-organ complications on today\'s exam. Clinician confirmation required before finalizing.',
      'high'
    ),
    items: [
      field('Essential hypertension, well-controlled', 'high'),
      field('Mild hyperlipidemia (LDL 138 mg/dL)', 'high'),
    ],
  },
  plan: {
    investigations: [field('Continue routine home blood pressure monitoring log', 'medium')],
    medications: [field('Continue lisinopril 10 mg once daily', 'high', 'lisinopril 10 milligrams once daily')],
    followUp: field('Routine follow-up in 3 months, or sooner if home readings trend upward', 'medium'),
    patientEducation: field(
      'Reinforce low-sodium diet and continued walking regimen. Discuss dietary approaches for LDL reduction.',
      'medium'
    ),
    returnPrecautions: field(
      'Seek care sooner for home BP readings persistently above 150/95, chest pain, severe headache, or new visual changes.',
      'medium'
    ),
  },
  documentation: {
    missingInformation: ['Imaging'],
    reviewItems: [],
    completeness: 95,
  },
  aiProcessingSeconds: 7,
  estimatedManualMinutes: 11,
  estimatedAiMinutes: 2,
  lastModified: '2026-09-02T11:05:00Z',
  signedAt: '2026-09-02T11:22:00Z',
}

export const demoEncounters: DemoEncounter[] = [
  {
    id: 'enc-cough',
    patient: michaelAnderson,
    transcript: cough_transcript,
    note: coughNote,
    extractionSummary: [
      { label: 'Symptoms detected', detail: 'Dry cough, low-grade fever, absence of chest pain or dyspnea' },
      { label: 'Duration detected', detail: 'Approximately two weeks, worse at night' },
      { label: 'Relevant history detected', detail: 'No known drug allergies' },
      { label: 'Vital signs detected', detail: 'BP, heart rate, temperature, and SpO₂ all captured' },
      { label: 'Clinical findings detected', detail: 'Mild pharyngeal erythema, no respiratory distress' },
      { label: 'Assessment generated', detail: 'Likely viral upper respiratory infection, drafted for review' },
      { label: 'Plan generated', detail: 'Supportive care and return precautions drafted; follow-up not specified' },
    ],
  },
  {
    id: 'enc-migraine',
    patient: sarahChen,
    transcript: migraine_transcript,
    note: migraineNote,
    extractionSummary: [
      { label: 'Symptoms detected', detail: 'Throbbing unilateral headache, nausea, photophobia' },
      { label: 'Duration detected', detail: 'One month history, ~2 episodes per week' },
      { label: 'Relevant history detected', detail: 'Family history of migraine, OTC ibuprofen use' },
      { label: 'Vital signs detected', detail: 'BP, heart rate, and temperature captured; SpO₂ not mentioned' },
      { label: 'Clinical findings detected', detail: 'Normal neurological exam, no focal deficits' },
      { label: 'Assessment generated', detail: 'Migraine without aura, drafted for review' },
      { label: 'Plan generated', detail: 'Lifestyle guidance drafted; prescription plan not discussed in audio' },
    ],
  },
  {
    id: 'enc-htn',
    patient: robertDelgado,
    transcript: htn_transcript,
    note: htnNote,
    extractionSummary: [
      { label: 'Symptoms detected', detail: 'No chest pain, palpitations, dyspnea, or edema reported' },
      { label: 'Relevant history detected', detail: 'Lisinopril adherence, home BP log, lifestyle changes' },
      { label: 'Vital signs detected', detail: 'BP, heart rate, temperature, and SpO₂ all captured' },
      { label: 'Clinical findings detected', detail: 'Regular cardiac rhythm, no murmurs or edema' },
      { label: 'Lab values detected', detail: 'Basic metabolic panel and lipid panel referenced from last week' },
      { label: 'Assessment generated', detail: 'Well-controlled hypertension with mild hyperlipidemia' },
      { label: 'Plan generated', detail: 'Medication continuation, 3-month follow-up, and diet guidance drafted' },
    ],
  },
]

export const getEncounterById = (id: string) => demoEncounters.find((e) => e.id === id)
export const getPatientById = (id: string) => demoEncounters.find((e) => e.patient.id === id)?.patient
