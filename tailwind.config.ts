import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#5b9cff',       // blu - unico accento (palette della home)
        'brand-dim': 'rgba(91,156,255,0.15)',
        win: '#4ade80',         // green - scores/wins only
        'win-dim': 'rgba(74,222,128,0.15)',
        accent: '#5b9cff',
        gold: '#f5c451',        // solo MOTM
        muted: '#8a96a8',
        loss: '#f87171',
        surface: '#141d2b',
        'surface-hi': '#1a2536',
        border: 'rgba(255,255,255,0.08)',
        bg: '#0d1420',
        'bg-card': '#141d2b',
      },
    },
  },
  plugins: [],
}
export default config
