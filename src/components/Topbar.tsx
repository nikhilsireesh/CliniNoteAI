import { Menu, Moon, Sun, Monitor, Lock } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Popover } from './ui/Popover'
import { cn } from '../lib/utils'

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { mode, setMode, resolvedTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80 sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-1.5 text-[11px] font-medium text-ink-400">
        <Lock className="h-3 w-3" />
        Secure session · Designed with privacy-conscious workflows in mind
      </div>

      <Popover
        align="right"
        trigger={() => (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="Change theme"
            title="Change theme"
          >
            {resolvedTheme === 'dark' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>
        )}
      >
        <div className="space-y-1">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm capitalize hover:bg-ink-50 dark:hover:bg-ink-700',
                mode === m && 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
              )}
            >
              {m === 'light' && <Sun className="h-4 w-4" />}
              {m === 'dark' && <Moon className="h-4 w-4" />}
              {m === 'system' && <Monitor className="h-4 w-4" />}
              {m}
            </button>
          ))}
        </div>
      </Popover>
    </header>
  )
}
