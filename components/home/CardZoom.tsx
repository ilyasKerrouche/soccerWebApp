'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import PlayerCard from '@/components/PlayerCard'
import FormDots from '@/components/FormDots'
import type { Player, PlayerHomeStats } from '@/lib/types'

type Props = {
  player: Player
  stats: PlayerHomeStats | undefined
  /** Dove si trova la card sul campo: l'apertura parte da li' e la chiusura ci torna. */
  origin: DOMRect
  reduced: boolean
  onClosed: () => void
}

const OPEN_MS = 420
const CLOSE_MS = 320
const EASE = 'cubic-bezier(.2,.9,.3,1)'

/** Trasformazione che porta la card grande (rect) sopra la card del campo (origin). */
function fromOrigin(rect: DOMRect, origin: DOMRect) {
  const dx = origin.left + origin.width / 2 - (rect.left + rect.width / 2)
  const dy = origin.top + origin.height / 2 - (rect.top + rect.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${origin.width / rect.width})`
}

export default function CardZoom({ player, stats, origin, reduced, onClosed }: Props) {
  const backdrop = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const details = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)

  // Apertura: la card parte dalla sua posizione sul campo e arriva al centro
  useLayoutEffect(() => {
    if (reduced || !card.current) return
    const start = fromOrigin(card.current.getBoundingClientRect(), origin)
    card.current.animate([{ transform: start }, { transform: 'none' }], { duration: OPEN_MS, easing: EASE })
    backdrop.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OPEN_MS * 0.7, easing: 'ease-out' })
    details.current?.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: OPEN_MS * 0.6, easing: 'ease-out', fill: 'backwards' })
  }, [origin, reduced])

  // Chiusura: il percorso inverso, poi si smonta
  function close() {
    if (closing) return
    if (reduced || !card.current) { onClosed(); return }
    setClosing(true)
    const end = fromOrigin(card.current.getBoundingClientRect(), origin)
    details.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
    backdrop.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS, easing: 'ease-in', fill: 'forwards' })
    card.current.animate([{ transform: 'none' }, { transform: end }], { duration: CLOSE_MS, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' })
      .finished.then(onClosed, onClosed)
  }

  return (
    <div ref={backdrop} className="stadium-zoom" onClick={close} role="dialog" aria-label={player.name}>
      <div ref={card}>
        <PlayerCard player={player} width={180} className="stadium-card-img" />
      </div>
      <div ref={details} className="flex flex-col items-center gap-4">
        {stats && (
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-center">
            {[
              { v: stats.goals, l: 'gol' },
              { v: stats.appearances, l: 'presenze' },
              { v: stats.winRate === null ? '—' : `${Math.round(stats.winRate * 100)}%`, l: 'vittorie' },
              { v: stats.motm, l: 'MOTM' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="text-xl font-semibold leading-none tabular-nums">{v}</div>
                <div className="text-[11px] mt-1" style={{ color: '#8a96a8' }}>{l}</div>
              </div>
            ))}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <FormDots form={stats.form} size={8} />
              <div className="text-[11px] mt-1.5" style={{ color: '#8a96a8' }}>forma</div>
            </div>
          </div>
        )}
        <Link
          href={`/players/${player.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(91,156,255,0.15)', color: '#5b9cff', border: '1px solid rgba(91,156,255,0.35)' }}
        >
          Vedi profilo
        </Link>
        <div className="text-[11px]" style={{ color: '#8a96a8' }}>tocca per chiudere</div>
      </div>
    </div>
  )
}
