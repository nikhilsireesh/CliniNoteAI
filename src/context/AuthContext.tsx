import { createContext, useContext, useState, type ReactNode } from 'react'

export interface ClinicianProfile {
  name: string
  role: string
  specialty: string
  email: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  isDemoMode: boolean
  clinician: ClinicianProfile
  loginWithCredentials: (email: string) => void
  loginWithGoogle: () => void
  enterDemoMode: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'clininote.session'

const defaultClinician: ClinicianProfile = {
  name: 'Dr. Anika Sharma',
  role: 'Attending Physician',
  specialty: 'Internal Medicine',
  email: 'a.sharma@clininote.demo',
}

interface StoredSession {
  isAuthenticated: boolean
  isDemoMode: boolean
  clinician: ClinicianProfile
}

function readSession(): StoredSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoredSession
  } catch {
    // ignore corrupt storage
  }
  return { isAuthenticated: false, isDemoMode: false, clinician: defaultClinician }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(readSession)

  const persist = (next: StoredSession) => {
    setSession(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const loginWithCredentials = (email: string) => {
    persist({ isAuthenticated: true, isDemoMode: false, clinician: { ...defaultClinician, email } })
  }

  const loginWithGoogle = () => {
    persist({ isAuthenticated: true, isDemoMode: false, clinician: defaultClinician })
  }

  const enterDemoMode = () => {
    persist({ isAuthenticated: true, isDemoMode: true, clinician: defaultClinician })
  }

  const logout = () => {
    persist({ isAuthenticated: false, isDemoMode: false, clinician: defaultClinician })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session.isAuthenticated,
        isDemoMode: session.isDemoMode,
        clinician: session.clinician,
        loginWithCredentials,
        loginWithGoogle,
        enterDemoMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
