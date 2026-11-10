'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { seasonLabel, seasonQuery, type SeasonKey } from '@/lib/season'
import { C } from './ui'

type Props = {
  /** Stagioni dalla piu' recente; la prima e' quella in corso. */
  seasons: number[]
  current: number
  active: SeasonKey
}

/** Bottone "2027 ▾" accanto al titolo: apre l'elenco delle stagioni e "Sempre". */
export default function SeasonPicker({ seasons, current, active }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (key: SeasonKey) => {
    setOpen(false)
    if (key !== active) router.push(pathname + seasonQuery(key, new Date()))
  }

  const items: { key: SeasonKey; label: string }[] = [
    ...seasons.map((s) => ({ key: s as SeasonKey, label: s === current ? `${s} · in corso` : String(s) })),
    { key: 'all', label: 'Sempre' },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Stagione: ${seasonLabel(active)}`}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
        style={{ background: C.surf, border: `1px solid ${C.line}`, color: C.text }}
      >
        {seasonLabel(active)} ▾
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-40 min-w-[150px] rounded-[14px] p-1.5 shadow-lg animate-section"
          style={{ background: C.surf2, border: `1px solid ${C.line}` }}
        >
          {items.map(({ key, label }) => (
            <button
              key={String(key)}
              type="button"
              role="menuitemradio"
              aria-checked={key === active}
              onClick={() => choose(key)}
              className="block w-full text-left rounded-[9px] px-2.5 py-2 text-[13px] whitespace-nowrap"
              style={key === active ? { background: C.surf, color: C.acc, fontWeight: 600 } : { color: C.text }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
