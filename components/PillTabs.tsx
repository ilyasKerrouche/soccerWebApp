'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { C } from './ui'

type Props<K extends string> = {
  tabs: readonly { key: K; label: string }[]
  active: K
  onChange: (key: K) => void
  className?: string
}

/** Selettore a pillola: l'evidenziatore scorre sotto la scheda scelta invece di saltare. */
export default function PillTabs<K extends string>({ tabs, active, onChange, className = '' }: Props<K>) {
  const refs = useRef<Partial<Record<K, HTMLButtonElement | null>>>({})
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active]
      if (!el) return
      const next = { left: el.offsetLeft, width: el.offsetWidth }
      // tabs puo' essere un array nuovo a ogni render: si aggiorna solo se la misura cambia davvero
      setPill((p) => (p && p.left === next.left && p.width === next.width ? p : next))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, tabs])

  return (
    <div className={`relative flex rounded-xl p-[3px] overflow-x-auto [scrollbar-width:none] ${className}`} style={{ background: C.surf, border: `1px solid ${C.line}` }}>
      {pill && (
        <span
          aria-hidden
          className="pill-slider absolute top-[3px] bottom-[3px] rounded-[9px]"
          style={{ left: 0, width: pill.width, transform: `translateX(${pill.left}px)`, background: C.surf2 }}
        />
      )}
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          ref={(el) => { refs.current[key] = el }}
          onClick={() => onChange(key)}
          aria-pressed={key === active}
          className="relative flex-1 py-[7px] px-2.5 rounded-[9px] text-[12.5px] whitespace-nowrap transition-colors"
          style={key === active ? { color: '#fff', fontWeight: 600, background: pill ? undefined : C.surf2 } : { color: C.muted }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
