'use client'
import { useEffect, useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { celebrationKey, shouldCelebrate } from '@/lib/motmCelebration'
import { overlayOpened } from '@/lib/overlay'
import { plural } from '@/lib/plural'
import type { Player } from '@/lib/types'

type Props = {
  matchId: string
  closesAt: string | null
  winner: Player
  /** Voti presi dal vincitore. */
  votes: number
  /** Es. "Team A 2 – 6 Team B · venerdì 30 ottobre" */
  matchLabel: string
}

// Parte dopo che la home si e' disegnata, cosi' non si accavalla al caricamento
const START_DELAY_MS = 500
const CARD_W = 190
// Scintille al momento del lampo: direzione e distanza fisse, cosi' il disegno e' sempre lo stesso
const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.12
  const dist = 130 + ((i * 37) % 90)
  return { dx: Math.round(Math.cos(angle) * dist), dy: Math.round(Math.sin(angle) * dist), ms: 900 + ((i * 53) % 400) }
})

/**
 * "Momento MOTM": a voto chiuso, la prima volta che si apre la home. La card arriva come sagoma nera con un
 * punto di domanda, poi un lampo dorato la svela; nome e voti compaiono solo dopo. I tempi sono nel CSS (.motm-cel-*).
 * Una volta sola per partita e per telefono; tocco ovunque per chiudere.
 * Deciso nel client: la home e' in cache uguale per tutti.
 */
export default function MotmCelebration({ matchId, closesAt, winner, votes, matchLabel }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(celebrationKey(matchId)) !== null } catch { /* senza storage: si mostra */ }
    if (!shouldCelebrate({ winnerCount: 1, closesAt, now: new Date(), seen })) return
    const id = setTimeout(() => {
      setOpen(true)
      // Segnata subito: anche chi chiude l'app a meta' non la rivede
      try { localStorage.setItem(celebrationKey(matchId), '1') } catch {}
    }, START_DELAY_MS)
    return () => clearTimeout(id)
  }, [matchId, closesAt])

  // Finche' e' aperto lo segnala: annuncio formazioni e avviso record aspettano la chiusura
  useEffect(() => {
    if (open) return overlayOpened()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div className="motm-cel" role="dialog" aria-label={`Man of the Match: ${winner.name}`} onClick={() => setOpen(false)}>
      <div className="motm-cel-rays" aria-hidden />
      <div className="motm-cel-glow" aria-hidden />
      <div className="motm-cel-title">★ MAN OF THE MATCH</div>
      <div className="motm-cel-stage" style={{ width: CARD_W, height: Math.round(CARD_W / 0.72) }}>
        <div className="motm-cel-card card-shield"><PlayerCard player={winner} width={CARD_W} eager /></div>
        <div className="motm-cel-q numeric" aria-hidden>?</div>
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="motm-cel-spark"
            aria-hidden
            style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, animationDuration: `${s.ms}ms` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="motm-cel-text">
        <div className="numeric text-[46px] font-bold uppercase leading-none">{winner.name}</div>
        {votes > 0 && (
          <div className="mt-2.5">
            <span className="bg-gold/15 text-gold text-[12px] font-bold px-3 py-1 rounded-full">{plural(votes, 'voto', 'voti')}</span>
          </div>
        )}
        <div className="text-[12px] mt-2.5 capitalize" style={{ color: '#8a96a8' }}>{matchLabel}</div>
        <div className="text-[11px] mt-6" style={{ color: '#8a96a8' }}>Tocca per chiudere</div>
      </div>
      <div className="motm-cel-flash" aria-hidden />
    </div>
  )
}
