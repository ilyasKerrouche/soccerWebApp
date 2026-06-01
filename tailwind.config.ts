import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#4ade80',
        'brand-dim': 'rgba(74,222,128,0.15)',
        accent: '#a78bfa',
        'accent-dim': 'rgba(139,92,246,0.15)',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.07)',
        bg: '#0a0f0a',
        'bg-indigo': '#0d0d1a',
      },
    },
  },
  plugins: [],
}
export default config
