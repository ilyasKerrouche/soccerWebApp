// lib/sponsors.ts
// Sponsor inventati per i cartelloni laterali del campo in home. Nessun marchio reale.

export type Sponsor = { name: string; emoji: string; tagline?: string; bg: string; fg: string }

export const SPONSORS: Sponsor[] = [
  { name: 'PIZZERIA IL RIGORE', emoji: '🍕', bg: 'linear-gradient(90deg,#b91c1c,#dc2626)', fg: '#ffffff' },
  { name: 'BAR SPORT DA PINO', emoji: '☕', bg: 'linear-gradient(90deg,#f8fafc,#e2e8f0)', fg: '#0f172a' },
  { name: 'PALESTRA FUORIGIOCO', emoji: '💪', bg: 'linear-gradient(90deg,#065f46,#059669)', fg: '#ecfdf5' },
  { name: 'OTTICA VAR', emoji: '👓', tagline: 'VEDIAMOCI CHIARO', bg: 'linear-gradient(90deg,#111827,#1f2937)', fg: '#facc15' },
  { name: 'GELATERIA IL PALLONETTO', emoji: '🍦', bg: 'linear-gradient(90deg,#fbcfe8,#f9a8d4)', fg: '#831843' },
  { name: 'AUTOFFICINA TRIPLETTA', emoji: '🔧', bg: 'linear-gradient(90deg,#1e3a8a,#2563eb)', fg: '#ffffff' },
]
