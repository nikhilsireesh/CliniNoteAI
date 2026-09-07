import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

interface PopoverProps {
  trigger: (open: boolean) => ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  panelClassName?: string
}

/**
 * Minimal click-to-toggle popover — closes on outside click or Escape.
 * Renders its panel in a portal so it's never clipped or covered by an
 * ancestor's stacking context (e.g. a sibling `position: sticky` sidebar).
 */
export function Popover({ trigger, children, align = 'left', panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const panelWidth = 288 // matches w-72
    const left = align === 'left' ? rect.left : rect.right - panelWidth
    const clampedLeft = Math.min(Math.max(8, left), window.innerWidth - panelWidth - 8)
    setCoords({ top: rect.bottom + 8, left: clampedLeft })
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const handleReposition = () => setOpen(false)
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [open])

  return (
    <>
      <span className="relative inline-block" ref={anchorRef} onClick={() => setOpen((o) => !o)}>
        {trigger(open)}
      </span>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className={cn(
              'z-[200] w-72 animate-fadeUp rounded-xl border border-ink-200 bg-white p-3.5 text-sm shadow-soft dark:border-ink-700 dark:bg-ink-800',
              panelClassName
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  )
}
