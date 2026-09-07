# CliniNote AI

**Turn every patient conversation into structured clinical documentation.**

CliniNote AI is a premium clinical documentation assistant: a clinician records a
short spoken summary of a patient encounter, the app transcribes it, and AI
structures it into a standardized SOAP note (Subjective, Objective, Assessment,
Plan) for the clinician to review, edit, and sign.

> **AI-generated documentation — review before signing.** CliniNote never
> presents itself as an autonomous diagnostic tool. Every note is a draft; a
> clinician remains responsible for reviewing and approving it before it
> becomes part of the record.

## Runs fully in Demo Mode — no API keys required

This prototype is 100% demoable out of the box:

- **Speech-to-text** uses the browser's built-in Web Speech API when available;
  otherwise (or via "Use Demo Encounter") it falls back to a realistic sample
  transcript so the flow never dead-ends or shows a broken API error.
- **AI structuring** is a local mock in `src/services/aiService.ts` that maps
  known demo transcripts to curated, clinically-reviewed SOAP notes and runs a
  transparent heuristic extractor for anything else.
- **Storage** is a real SQLite database (see [Database](#database) below) — no
  API keys or external accounts needed, but notes and patients now genuinely
  persist across restarts instead of living in `localStorage`.

The service layer (`src/services/`) is written as the seam a real backend
would fill in later (e.g. a Whisper transcription endpoint and an
`/api/structure-note` route backed by an LLM) — see `.env.example`.

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` starts **both** the Vite frontend (`http://localhost:5173`) and
the API server (`http://localhost:4000`) together — the frontend proxies
`/api/*` to the API server in dev, so there's nothing else to configure. Open
the printed local URL, then click **Try Demo Mode** on the login screen.

Other scripts:

```bash
npm run server   # run only the API server (tsx watch server/index.ts)
npm run db:reset # delete the local database file; it's recreated + reseeded on next start
npm run build    # type-check + production build (frontend only)
npm run preview  # preview the production build locally
npm run lint     # oxlint
```

## Database

Notes and patients are stored in a real SQLite database at `server/app.db`,
using Node's built-in `node:sqlite` module (no native dependency to compile,
no external service). See:

- `server/db.ts` — schema, seeding (from the same fictional data that used to
  live only in `src/data/`), and query functions.
- `server/index.ts` — the small Express API those functions are exposed
  through (`/api/patients`, `/api/notes`, `/api/dashboard/stats`, …).
- `src/services/noteService.ts` and `src/services/patientService.ts` — the
  frontend's API client for that server.

The database file is gitignored and rebuilt automatically (from the same demo
data) the first time the server starts if it doesn't exist — delete it with
`npm run db:reset` any time you want a clean slate.

## The core flow

**Record → Transcribe → Analyze → Structure → Review → Edit → Export**

1. **Capture** — record audio (or pick a demo encounter), see a live transcript.
2. **Structure** — a multi-stage AI processing animation, then a generated SOAP note.
3. **Review** — every field is editable, shows an AI extraction confidence badge,
   and can be clicked to reveal the exact transcript excerpt it came from
   (source traceability). A completeness panel flags anything left undocumented.
4. **Sign & export** — a pre-sign checklist, then export as PDF, TXT, JSON, or
   copy to clipboard.

## Project structure

```
server/
  db.ts         SQLite schema, seeding, and query functions (server/app.db)
  index.ts      Express API exposing that database over HTTP
src/
  components/   Reusable UI: recording panel, waveform, SOAP editor, badges, etc.
  components/ui/  Low-level primitives (Button, Card, Input, Popover, Progress)
  pages/        Route-level screens (Login, Dashboard, NewNote, Notes, Patients, Settings, ...)
  services/     speechService, aiService — local mocks; noteService, patientService — the
                real API client for the database, over fetch
  data/         Fictional demo patients, encounters, and notes (used to seed the database)
  types/        Shared TypeScript types, incl. the structured clinical note schema
  context/      Auth (mock), theme (light/dark/system), toast notifications
  lib/          Small framework-agnostic helpers and hooks
```

## Safety & privacy notes

- All demo patient data is fictional. **Do not enter real patient-identifiable
  information into this prototype.**
- The app is "designed with privacy-conscious workflows in mind" — it does not
  claim HIPAA compliance, which would require infrastructure this prototype
  does not implement.
- The AI is instructed (see `src/services/aiService.ts`) to never fabricate
  vitals, medications, labs, or history — missing information is always
  surfaced as "Not documented" rather than invented.
