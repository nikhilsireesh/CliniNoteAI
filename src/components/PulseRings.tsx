import { useId } from 'react'
import { cn } from '../lib/utils'

// A handful of fixed points where soft rings periodically ripple outward and fade —
// scattered and staggered so it reads as ambient "heartbeat" activity, not one obvious
// spot. Sizes/positions are picked to stay mostly in open background space.
const POINTS = [
  { top: '6%', left: '97%', size: 200, delay: 0 },
  { top: '50%', left: '99%', size: 180, delay: 2.4 },
  { top: '98%', left: '92%', size: 220, delay: 1.2 },
]

const RING_DURATION = 4.4

interface PulseRingsProps {
  className?: string
}

/**
 * Soft concentric red rings that expand outward from a few fixed points and fade — a
 * heartbeat-like ripple animating quietly behind the interface. Pure CSS, aria-hidden,
 * non-interactive; meant to be layered with VesselFlow, not replace it.
 */
export function PulseRings({ className }: PulseRingsProps) {
  const uid = useId()

  return (
    <div aria-hidden="true" className={cn('overflow-hidden', className)}>
      {POINTS.map((p, i) => (
        <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
          {[0, 1].map((ring) => (
            <span
              key={ring}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: p.size,
                height: p.size,
                borderRadius: '9999px',
                border: '1px solid rgba(225,29,60,0.35)',
                animation: `${uid}-pulse ${RING_DURATION}s ease-out infinite`,
                animationDelay: `${p.delay + ring * (RING_DURATION / 2)}s`,
              }}
            />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes ${uid}-pulse {
          0% { transform: translate(-50%, -50%) scale(0.35); opacity: 0.55; }
          75% { opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
