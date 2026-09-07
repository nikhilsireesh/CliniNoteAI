import { useEffect, useState } from 'react'

/** Animates a numeric value from 0 up to `target` over `duration` ms using an
 *  ease-out curve. Used for stat tiles so numbers feel alive on first paint
 *  rather than appearing as static text. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(target)
      return
    }
    let raf: number
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(from + (target - from) * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
