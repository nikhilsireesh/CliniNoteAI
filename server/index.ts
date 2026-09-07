// Local dev entry point — runs the shared Express app (./app.ts) with a real listening
// port. In production on Vercel, api/index.ts exports the same app as a serverless
// function instead; this file is never used there.
import { app } from './app.js'
import * as db from './db.js'

const PORT = Number(process.env.API_PORT) || 4000

await db.ensureReady()
app.listen(PORT, () => {
  console.log(`[api] CliniNote database API listening on http://localhost:${PORT}`)
})
