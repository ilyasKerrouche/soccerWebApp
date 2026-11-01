'use client'
import { useEffect, useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { celebrationKey, shouldCelebrate } from '@/lib/motmCelebration'
import type { Player } from '@/lib/types'

type Props = {
  matchId: string
  closesAt: string | null
  winners: Player[]
  /** Es. "Team A 2 – 6 Team B · venerdì 30 ottobre" */
  matchLabel: string
}

// Parte dopo che la home si e' disegnata, cosi' non si accavalla al caricamento
const START_DELAY_MS = 500

/**
 * "Momento MOTM": a voto chiuso, la prima volta che si apre la home, la card del vincitore entra girandosi
 * e si illumina d'oro. Una volta sola per partita e per telefono; tocco ovunque per chiudere.
 * Deciso nel client: la home e' in cache uguale per tutti.
 */
export default function MotmCelebration({ matchId, closesAt, winners, matchLabel }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(celebrationKey(matchId)) !== null } catch { /* senza storage: si mostra */ }
    if (!shouldCelebrate({ winnerCount: winners.length, closesAt, now: new Date(), seen })) return
    const id = setTimeout(() => {
      setOpen(true)
      // Segnata subito: anche chi chiude l'app a meta' non la rivede
      try { localStorage.setItem(celebrationKey(matchId), '1') } catch {}
    }, START_DELAY_MS)
    return () => clearTimeout(id)
  }, [matchId, closesAt, winners.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null
  const width = winners.length === 1 ? 170 : winners.length === 2 ? 128 : 96

  return (
    <div className="motm-cel" role="dialog" aria-label={`Man of the Match: ${winners.map((p) => p.name).join(' e ')}`} onClick={() => setOpen(false)}>
      <div className="motm-cel-glow" aria-hidden />
      <div className="motm-cel-title">★ MAN OF THE MATCH</div>
      <div className="flex justify-center gap-4">
        {winners.map((p, i) => (
          <div key={p.id} className="motm-cel-flip" style={{ width, animationDelay: `${0.15 + i * 0.15}s` }}>
            <div className="motm-cel-face card-shield"><PlayerCard player={p} width={width} eager /></div>
            <div className="motm-cel-face motm-cel-back" aria-hidden>★</div>
          </div>
        ))}
      </div>
      <div className="motm-cel-text">
        <div className="text-[22px] font-bold tracking-[-0.02em]">{winners.map((p) => p.name).join(' & ')}</div>
        <div className="text-[12px] mt-1 capitalize" style={{ color: '#8a96a8' }}>{matchLabel}</div>
        <div className="text-[11px] mt-6" style={{ color: '#8a96a8' }}>Tocca per chiudere</div>
      </div>
    </div>
  )
}
