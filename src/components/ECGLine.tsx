import { useId } from 'react'
import { cn } from '../lib/utils'

// One heartbeat cycle: long flat baseline, a small P-wave bump, a sharp upward R spike,
// a deep downward S dip, then back to baseline for the rest of the cycle. Straight
// segments (not curves) read as a clean digital monitor trace rather than a cartoon squiggle.
const UNIT_WIDTH = 240
const UNIT_PATH = 'M0,46 L50,46 L56,42 L62,46 L82,46 L88,50 L94,6 L100,64 L106,46 L240,46'
const VIEW_WIDTH = 720
const VIEW_HEIGHT = 84
const TILE_COUNT = Math.ceil(VIEW_WIDTH / UNIT_WIDTH) + 2

interface ECGLineProps {
  className?: string
  /** Seconds per heartbeat cycle — lower feels more urgent/active. */
  speed?: number
  /** Glow/line color; defaults to the app's medical-red accent. */
  color?: string
  /**
   * 'subtle' (default): a thin red line with a soft red glow — used for small contained
   * UI accents (a card, a panel) where it sits directly on a white surface.
   * 'neon': a bright white-hot core inside a thick red glow, matching a clinical-monitor
   * reference look — used for the ambient page background, where the dense glow gives
   * the white core enough contrast to read against white.
   */
  variant?: 'subtle' | 'neon'
}

/**
 * A continuously left-scrolling ECG trace — a design element evoking a clinical monitor,
 * NOT a real physiological reading. Pure SVG + SMIL animation (no images, no heavy JS):
 * a single waveform unit is tiled and scrolled by exactly one unit-width on an infinite
 * loop, so the motion is perfectly seamless. A blurred glow copy sits under a crisp core
 * line, and both edges fade out so it blends into the surrounding white space.
 */
export function ECGLine({ className, speed = 2.6, color = '#e11d3c', variant = 'subtle' }: ECGLineProps) {
  const uid = useId()
  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => i)
  const isNeon = variant === 'neon'
  const coreColor = isNeon ? '#ffffff' : color

  return (
    <svg
      aria-hidden="true"
      className={cn('h-10 w-full', className)}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        <path id={`${uid}-unit`} d={UNIT_PATH} fill="none" />
        <filter id={`${uid}-glow`} x="-30%" y="-160%" width="160%" height="420%">
          <feGaussianBlur stdDeviation={isNeon ? 5.5 : 3} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            {isNeon && <feMergeNode in="blur" />}
          </feMerge>
        </filter>
        <linearGradient id={`${uid}-fade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="12%" stopColor="white" stopOpacity="1" />
          <stop offset="88%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-mask`}>
          <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={`url(#${uid}-fade)`} />
        </mask>
      </defs>

      <g mask={`url(#${uid}-mask)`}>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0 0"
            to={`-${UNIT_WIDTH} 0`}
            dur={`${speed}s`}
            repeatCount="indefinite"
          />
          {tiles.map((i) => (
            <use
              key={`glow-${i}`}
              href={`#${uid}-unit`}
              x={i * UNIT_WIDTH}
              stroke={color}
              strokeWidth={isNeon ? 7 : 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isNeon ? 0.85 : 0.3}
              filter={`url(#${uid}-glow)`}
            />
          ))}
          {tiles.map((i) => (
            <use
              key={`core-${i}`}
              href={`#${uid}-unit`}
              x={i * UNIT_WIDTH}
              stroke={coreColor}
              strokeWidth={isNeon ? 2 : 1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
