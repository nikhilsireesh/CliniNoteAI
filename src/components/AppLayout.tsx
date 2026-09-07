import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { VesselFlow } from './VesselFlow'
import { PulseRings } from './PulseRings'
import { cn } from '../lib/utils'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="relative min-h-screen bg-white dark:bg-ink-950">
      {/* Faint red lines flowing behind the whole app shell, plus soft heartbeat-style
          rings rippling outward at a few points — visible in the white space around
          cards/panels, never covering or dimming the content itself. */}
      <VesselFlow className="pointer-events-none fixed inset-0 z-0 dark:opacity-25" />
      <PulseRings className="pointer-events-none fixed inset-0 z-0 dark:opacity-40" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink-100 dark:border-ink-800 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink-950/40 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[80%] transform bg-white shadow-xl transition-transform duration-200 dark:bg-ink-900',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} variant="mobile" />
        </div>
      </div>

      <div className="relative z-10 lg:pl-64">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
