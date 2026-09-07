import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AudioLines, FileCheck2, Lock, ShieldCheck, Sparkles, Waypoints } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ECGLine } from '../components/ECGLine'
import { VesselFlow } from '../components/VesselFlow'
import { PulseRings } from '../components/PulseRings'
import { cn } from '../lib/utils'

const HIGHLIGHTS = [
  { icon: AudioLines, text: 'Speak the encounter naturally — no forms mid-conversation' },
  { icon: Sparkles, text: 'AI structures a SOAP-ready draft in seconds' },
  { icon: Waypoints, text: 'Every field traces back to what was actually said' },
  { icon: FileCheck2, text: 'You review, edit, and sign — always the final word' },
]

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

// Mocked Google account for the "Sign up with Google" demo flow — there's no real OAuth
// backend here, so this stands in for "the Google account the browser is signed into."
const GOOGLE_ACCOUNT_EMAIL = 'nikhilthalakola@gmail.com'

export function Login() {
  const navigate = useNavigate()
  const { loginWithCredentials, loginWithGoogle, enterDemoMode } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const goApp = () => navigate('/app', { replace: true })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      loginWithCredentials(email || 'a.sharma@clininote.demo')
      setLoading(false)
      goApp()
    }, 500)
  }

  const handleGoogle = (email?: string) => {
    loginWithGoogle(email)
    goApp()
  }

  const handleDemo = () => {
    enterDemoMode()
    goApp()
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white dark:bg-ink-950 lg:grid-cols-2">
      {/* Hero panel — white/off-white only, no colored background. Red is used purely as a
          sparing accent: the logo mark, small icon chips, faint flowing vessel lines, and
          the ECG line. */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-ink-100 bg-ink-50/60 p-12 dark:border-ink-800 dark:bg-ink-900/30 lg:flex">
        <VesselFlow className="pointer-events-none absolute inset-0" />
        <PulseRings className="pointer-events-none absolute inset-0" />
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-ink-900 dark:text-white">CliniNote AI</span>
        </motion.div>

        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-serif-clinical text-4xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-white"
          >
            From conversation to clinical note — in seconds.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-4 text-[15px] leading-relaxed text-ink-500"
          >
            CliniNote AI transforms spoken patient encounters into structured SOAP documentation, giving
            clinicians more time to focus on patient care.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 rounded-2xl border border-ink-100 bg-white p-4 shadow-card dark:border-ink-800 dark:bg-ink-900"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Always listening, always precise</p>
            <ECGLine />
          </motion.div>

          <div className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <h.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-300">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-400">AI-assisted · Human-reviewed · Privacy-conscious</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-ink-950 sm:px-10">
        <div className="w-full max-w-sm animate-fadeUp">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-ink-900 dark:text-white">CliniNote AI</span>
          </div>
          <div className="mb-8 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-card dark:border-ink-800 dark:bg-ink-900 lg:hidden">
            <ECGLine className="h-8" />
          </div>

          <div className="mb-6 flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
            {(
              [
                { id: 'signin', label: 'Sign in' },
                { id: 'register', label: 'Register' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAuthMode(opt.id)}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                  authMode === opt.id
                    ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white'
                    : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {authMode === 'signin' ? (
            <>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Welcome back</h2>
              <p className="mt-1.5 text-sm text-ink-500">Secure clinical documentation workspace.</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
                <span className="text-xs text-ink-400">or</span>
                <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
              </div>

              <Button variant="outline" size="lg" className="w-full" onClick={() => handleGoogle()}>
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </Button>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-3">
                <Button variant="primary" size="lg" className="w-full" onClick={handleDemo}>
                  <Sparkles className="h-4 w-4" />
                  Try Demo Mode
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Create your account</h2>
              <p className="mt-1.5 text-sm text-ink-500">Set up your clinical documentation workspace in seconds.</p>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mt-7"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button variant="outline" size="lg" className="w-full" onClick={() => handleGoogle(GOOGLE_ACCOUNT_EMAIL)}>
                  <GoogleIcon className="h-4 w-4" />
                  Sign up with Google
                </Button>
              </motion.div>
              <p className="mt-2 text-center text-[11px] text-ink-400">
                We only use this to create your clinician profile — no calendar or inbox access.
              </p>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
                <span className="text-xs text-ink-400">or</span>
                <div className="h-px flex-1 bg-ink-100 dark:bg-ink-800" />
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button variant="primary" size="lg" className="w-full" onClick={handleDemo}>
                  <Sparkles className="h-4 w-4" />
                  Try Demo Mode
                </Button>
              </motion.div>
            </>
          )}

          <div className="mt-8 flex items-start gap-2 rounded-xl bg-ink-50 p-3.5 text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-400">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Secure clinical documentation workspace. This prototype uses fictional demo data — please don't
              enter real patient-identifiable information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
