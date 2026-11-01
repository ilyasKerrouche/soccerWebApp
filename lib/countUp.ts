// lib/countUp.ts
// Modulo puro: i numeri che "salgono" quando una pagina si apre (components/CountUp.tsx).

export type Count = { value: number; decimals: number; suffix: string }

/** Numero, "10,2" o "54%"; tutto il resto (trattini, simboli) non si anima. */
export function parseCount(v: unknown): Count | null {
  if (typeof v === 'number' && Number.isFinite(v)) return { value: v, decimals: Number.isInteger(v) ? 0 : String(v).split('.')[1].length, suffix: '' }
  if (typeof v !== 'string') return null
  const m = /^(\d+)(?:,(\d+))?(%?)$/.exec(v.trim())
  if (!m) return null
  return { value: Number(`${m[1]}.${m[2] ?? '0'}`), decimals: m[2]?.length ?? 0, suffix: m[3] }
}

/** Valore a una frazione (0–1) del percorso, scritto all'italiana. */
export function formatCount(c: Count, t: number): string {
  const n = c.value * Math.min(1, Math.max(0, t))
  const s = c.decimals > 0 ? n.toFixed(c.decimals).replace('.', ',') : String(Math.round(n))
  return s + c.suffix
}
