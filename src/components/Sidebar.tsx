import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileStack,
  LayoutGrid,
  LogOut,
  Mic,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  FileText,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn, initials } from '../lib/utils'

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/app/new-note', label: 'New Note', icon: Mic },
  { to: '/app/notes', label: 'Recent Notes', icon: FileStack },
  { to: '/app/patients', label: 'Patients', icon: Users },
  { to: '/app/templates', label: 'Templates', icon: FileText },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

interface SidebarProps {
  onNavigate?: () => void
  /** Distinguishes the desktop vs. mobile-drawer instance so their layout-animated
   *  active pills don't share a layoutId — both can be mounted at once. */
  variant?: 'desktop' | 'mobile'
}

export function Sidebar({ onNavigate, variant = 'desktop' }: SidebarProps) {
  const { clinician, isDemoMode, logout } = useAuth()
  const location = useLocation()

  return (
    <div
      className={cn(
        'flex h-full flex-col backdrop-blur-md',
        // Desktop sidebar is persistent chrome, so it can stay translucent and let the
        // background animation show through. The mobile drawer briefly overlays page
        // content like a modal, so it stays closer to opaque for legibility while open.
        variant === 'desktop' ? 'bg-white/85 dark:bg-ink-900/70' : 'bg-white/95 dark:bg-ink-900/90'
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-600/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-bold leading-tight text-ink-900 dark:text-white">CliniNote AI</p>
          <p className="text-[11px] leading-tight text-ink-400">Clinical documentation</p>
        </div>
        <button
          onClick={onNavigate}
          className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isDemoMode && (
        <div className="mx-4 mb-1 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          Demo Mode
        </div>
      )}

      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Main navigation">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={`sidebar-active-pill-${variant}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/10"
                  />
                )}
                <item.icon
                  className={cn(
                    'relative z-10 h-[18px] w-[18px] transition-transform duration-200',
                    !isActive && 'group-hover:scale-110'
                  )}
                />
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="mx-3 mb-2 rounded-xl border border-ink-100 bg-ink-50 p-3 text-[11px] text-ink-500 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-400">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-ink-600 dark:text-ink-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Privacy-first documentation
        </div>
        Demo data is fictional. Do not enter real patient-identifiable information in this prototype.
      </div>

      <div className="flex items-center gap-2.5 border-t border-ink-100 px-4 py-4 dark:border-ink-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
          {initials(clinician.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink-800 dark:text-ink-100">{clinician.name}</p>
          <p className="truncate text-[11px] text-ink-400">{clinician.role}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
