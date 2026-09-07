// A cheap, deterministic "live summary" — no network call, so it can safely re-run on
// every transcript update while the clinician is still speaking. It's intentionally
// simple and transparent (extractive, not generative): it surfaces the opening context
// sentence, the most recently spoken sentence, and any clinical keywords heard so far,
// rather than fabricating a paraphrase. Swap for a real streaming LLM summary later.

const KEYWORDS = [
  'pain',
  'cough',
  'fever',
  'nausea',
  'headache',
  'dizziness',
  'fatigue',
  'rash',
  'vomiting',
  'swelling',
  'shortness of breath',
  'chest pain',
  'sore throat',
  'diarrhea',
  'chills',
  'numbness',
  'bleeding',
  'allergy',
  'allergies',
]

export interface LiveSummary {
  headline: string
  keywords: string[]
  wordCount: number
}

/** Returns null until there's enough speech to say anything meaningful about. */
export function summarizeLive(transcript: string): LiveSummary | null {
  const clean = transcript.trim()
  if (!clean) return null

  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length < 6) return null

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const first = sentences[0] ?? clean
  const latest = sentences.length > 1 ? sentences[sentences.length - 1] : ''

  let headline = latest && latest !== first ? `${first} ${latest}` : first
  if (headline.length > 200) headline = `${headline.slice(0, 197)}…`

  const lower = clean.toLowerCase()
  const keywords = KEYWORDS.filter((k) => lower.includes(k))

  return { headline, keywords, wordCount: words.length }
}
