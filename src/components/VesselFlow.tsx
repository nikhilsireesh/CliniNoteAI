import { useId } from 'react'
import { cn } from '../lib/utils'

// Organic, branching curves across an 800x600 canvas — abstract enough to read as
// "vessels" without looking anatomical/graphic. Kept faint and thin so white stays the
// dominant surface; only the moving highlight and cells draw the eye.
const PATHS = [
  'M -20 110 C 150 50, 250 170, 400 120 S 650 30, 820 100',
  'M -20 300 C 120 250, 220 380, 380 310 S 600 240, 820 320',
  'M -20 490 C 160 420, 260 520, 420 460 S 680 390, 820 470',
  'M 90 -20 C 60 130, 160 170, 130 290 S 60 480, 110 620',
  'M 520 -20 C 540 110, 470 190, 510 310 S 580 470, 530 620',
]

interface VesselFlowProps {
  className?: string
}

/**
 * A quiet ambient backdrop of thin red "vessel" lines with a brighter pulse of color and
 * small blood-cell dots continuously flowing along each one — evoking circulation without
 * competing with the white, minimal interface on top of it. Purely decorative: aria-hidden
 * and non-interactive.
 */
export function VesselFlow({ className }: VesselFlowProps) {
  const uid = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn('h-full w-full', className)}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {PATHS.map((d, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke="rgba(225,29,60,0.12)" strokeWidth={1.5} strokeLinecap="round" />
          <path
            d={d}
            fill="none"
            stroke="#e11d3c"
            strokeWidth={1.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.05 1"
            style={{
              opacity: 0.55,
              animation: `${uid}-flow ${4.5 + i * 0.6}s linear infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
          <circle r={2.5} fill="#c0122f" opacity={0.55}>
            <animateMotion dur={`${5.5 + i * 0.5}s`} repeatCount="indefinite" path={d} rotate="auto" />
          </circle>
          <circle r={2.5} fill="#c0122f" opacity={0.55}>
            <animateMotion
              dur={`${5.5 + i * 0.5}s`}
              begin={`${(5.5 + i * 0.5) / 2}s`}
              repeatCount="indefinite"
              path={d}
              rotate="auto"
            />
          </circle>
        </g>
      ))}
      <style>{`@keyframes ${uid}-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -2; } }`}</style>
    </svg>
  )
}
