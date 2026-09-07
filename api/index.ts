// Vercel serverless entry point. vercel.json rewrites every /api/* request here (a
// rewrite, not a redirect, so the function still sees the original full path — e.g.
// /api/notes/123 — which Express's own internal routing in ../server/app.ts then
// matches normally). Vercel's Node runtime treats a default-exported Express app as a
// plain (req, res) handler, so no adapter/wrapper is needed; this is the same app
// instance server/index.ts runs locally with app.listen().
import { app } from '../server/app.js'

export default app
