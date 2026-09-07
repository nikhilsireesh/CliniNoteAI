import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards /api/* to the Express + SQLite backend (see server/index.ts, started
    // alongside this dev server by `npm run dev`) so the frontend can just call
    // relative /api/... URLs with no CORS setup needed.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
