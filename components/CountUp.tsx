'use client'
import { useEffect, useRef } from 'react'
import { formatCount, parseCount } from '@/lib/countUp'

const DURATION_MS = 700

/** Numero che sale da zero quando la pagina si apre; valori non numerici restano come sono. */
export default function CountUp({ value }: { value: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = parseCount(value)

  useEffect(() => {
    const el = ref.current
    if (!count || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = formatCount(count, 1); return }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS)
      el.textContent = formatCount(count, 1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // Riparte solo se cambia il valore mostrato
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count?.value, count?.decimals, count?.suffix])

  if (!count) return <>{value}</>
  return <span ref={ref}>{formatCount(count, 0)}</span>
}
