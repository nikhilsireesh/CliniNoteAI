/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // "Blood red" primary — deliberately a shade off Tailwind's default red so
        // danger/alert states (bg-red-*) stay visually distinct from primary actions.
        brand: {
          50: '#fef2f3',
          100: '#fde3e5',
          200: '#fbc9cd',
          300: '#f6a1a9',
          400: '#ee6c7a',
          500: '#e11d3c',
          600: '#c0122f',
          700: '#9c1029',
          800: '#7c1027',
          900: '#5c0f21',
        },
        // Neutral scale for a clean, premium healthcare-SaaS surface: a standard cool
        // slate scale (not warm/reddish, not black) — pure white stays the dominant
        // background, this only supplies text, borders, and subtle off-white fills.
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        mint: {
          50: '#eafff5',
          100: '#c8ffe3',
          400: '#2ee696',
          500: '#0dcc7f',
          600: '#049e63',
        },
        amber: {
          50: '#fffaeb',
          100: '#fef0c7',
          500: '#ffab0d',
          600: '#e08600',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        glow: '0 0 0 4px rgba(225, 29, 60, 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(2%, -4%) scale(1.05)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-3%, 3%) scale(1.08)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(225,29,60,0.35)' },
          '50%': { transform: 'scale(1.04)', boxShadow: '0 0 0 14px rgba(225,29,60,0)' },
        },
        vesselFlow: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-2' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.22)' },
          '28%': { transform: 'scale(0.96)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        fadeUp: 'fadeUp 0.35s ease-out both',
        fadeIn: 'fadeIn 0.25s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
        float: 'float 9s ease-in-out infinite',
        floatSlow: 'floatSlow 13s ease-in-out infinite',
        breathe: 'breathe 2.6s cubic-bezier(0.4,0,0.6,1) infinite',
        popIn: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        gradientPan: 'gradientPan 8s ease infinite',
        slideInRight: 'slideInRight 0.3s ease-out both',
        spinSlow: 'spinSlow 12s linear infinite',
        vesselFlow: 'vesselFlow 5s linear infinite',
        heartbeat: 'heartbeat 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
