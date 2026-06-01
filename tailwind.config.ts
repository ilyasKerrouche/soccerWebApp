import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#a78bfa',       // violet - main accent
        'brand-dim': 'rgba(167,139,250,0.15)',
        win: '#4ade80',         // green - scores/wins only
        'win-dim': 'rgba(74,222,128,0.15)',
        accent: '#6366f1',      // indigo - secondary
        surface: 'rgba(255,255,255,0.05)',
        'surface-hi': 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.08)',
        bg: '#06060f',
        'bg-card': '#0d0d1f',
      },
    },
  },
  plugins: [],
}
export default config
