import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

interface WaveformProps {
  active: boolean
  barCount?: number
  className?: string
}

/** A CSS/JS-driven audio waveform. Simulates amplitude when no real analyser is wired up —
 * swap the height source for an AnalyserNode's frequency data to reflect real mic input. */
export function Waveform({ active, barCount = 40, className }: WaveformProps) {
  const [heights, setHeights] = useState<number[]>(() => Array.from({ length: barCount }, () => 8))
  const frame = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      setHeights(Array.from({ length: barCount }, () => 6))
      return
    }
    let raf: number
    const tick = () => {
      frame.current += 1
      setHeights((prev) =>
        prev.map((_, i) => {
          const base = Math.sin(frame.current / 6 + i * 0.5) * 0.5 + 0.5
          const jitter = Math.random() * 0.5
          return 6 + Math.round((base * 0.6 + jitter * 0.4) * 34)
        })
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, barCount])

  return (
    <div className={cn('flex h-14 items-center justify-center gap-[3px]', className)} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] rounded-full transition-[height] duration-75 ease-out',
            active ? 'bg-brand-500' : 'bg-ink-200 dark:bg-ink-700'
          )}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}
