'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import PlayerCard from './PlayerCard'
import FormDots from './FormDots'
import { holoSlots } from '@/lib/holoLayout'
import type { MatchWithPlayers, Player } from '@/lib/types'
import type { Result } from '@/lib/rating'

export type HoloStats = { goals: number; appearances: number; winRate: number | null; motm: number; form: Result[] }

type Props = {
  match: MatchWithPlayers
  motmIds: string[]
  stats: Record<string, HoloStats>
}

const TILT = 62
const PITCH_W = 230
const PITCH_H = 310
const CARD_W = 40
const ENTRY_S = 2.4
const DEG_PER_S = 12 // un giro completo ogni 30 secondi
const SEEN_KEY = 'holo-entry-seen'

export default function HoloPitch({ match, motmIds, stats }: Props) {
  const pitchRef = useRef<HTMLDivElement>(null)
  const [entry, setEntry] = useState<boolean | null>(null)
  const [zoomed, setZoomed] = useState<{ player: Player; team: 'a' | 'b' } | null>(null)

  // L'entrata si vede una volta per sessione; tornando in home il campo e' gia' pronto.
  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; sessionStorage.setItem(SEEN_KEY, '1') } catch {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEntry(!seen && !reduced)
  }, [])

  useEffect(() => {
    if (entry === null) return
    const pitch = pitchRef.current
    if (!pitch) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now() + (entry ? ENTRY_S * 1000 : 0)
    let raf = 0
    const frame = (now: number) => {
      const z = reduced ? 0 : Math.max(0, (now - start) / 1000) * DEG_PER_S
      pitch.style.transform = `rotateX(${TILT}deg) rotateZ(${z}deg)`
      // Card e scritte girano al contrario, cosi' restano sempre rivolte verso chi guarda
      const counter = `rotateZ(${-z}deg) rotateX(${-TILT}deg)`
      pitch.querySelectorAll<HTMLElement>('[data-upright]').forEach((el) => { el.style.transform = counter })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [entry])

  const teams = (['a', 'b'] as const).map((side) => {
    const mps = match.match_players.filter((mp) => mp.team === side)
    const slots = holoSlots(mps.map((mp) => mp.player.position), side)
    return mps.map((mp, i) => ({ mp, slot: slots[i], side }))
  })
  const placed = [...teams[0], ...teams[1]]

  const zs = zoomed ? stats[zoomed.player.id] : undefined

  return (
    <>
      <div className={`holo-scene ${entry ? 'holo-entry' : ''}`} style={{ visibility: entry === null ? 'hidden' : 'visible' }}>
        <div ref={pitchRef} className="holo-pitch" style={{ width: PITCH_W, height: PITCH_H, marginLeft: -PITCH_W / 2 }}>
          <div className="holo-field">
            <div className="holo-half-a" />
            <div className="holo-half-b" />
            <div className="holo-scan" />
          </div>
          <div className="holo-ln holo-ln-out" />
          <div className="holo-ln holo-ln-mid" />
          <div className="holo-ln holo-ln-circ" />
          <div className="holo-ln holo-ln-bt" />
          <div className="holo-ln holo-ln-bb" />

          <div data-upright className="holo-label holo-label-a">{match.team_a_name}</div>
          <div data-upright className="holo-label holo-label-b">{match.team_b_name}</div>

          {placed.map(({ mp, slot, side }, i) => {
            const motm = motmIds.includes(mp.player_id)
            return (
              <button
                key={mp.player_id}
                type="button"
                data-upright
                aria-label={`${mp.player.name}: apri le statistiche`}
                onClick={() => setZoomed({ player: mp.player, team: side })}
                className={`holo-card holo-card-${side} ${motm ? 'holo-card-motm' : ''}`}
                style={{
                  left: (slot.x / 100) * PITCH_W - CARD_W / 2,
                  top: (slot.y / 100) * PITCH_H - CARD_W / 0.72,
                  animationDelay: `${0.9 + i * 0.13}s`,
                }}
              >
                <span className="holo-ray" style={{ animationDelay: `${0.9 + i * 0.13}s` }} />
                <span className="holo-base" />
                <PlayerCard player={mp.player} width={CARD_W} className="holo-card-img" />
              </button>
            )
          })}
        </div>
      </div>

      {zoomed && (
        <div className="holo-zoom" onClick={() => setZoomed(null)} role="dialog" aria-label={zoomed.player.name}>
          <div className="holo-zoom-card">
            <PlayerCard player={zoomed.player} width={180} />
          </div>
          <div className="text-lg font-black">{zoomed.player.name}</div>
          {zs && (
            <div className="grid grid-cols-3 gap-x-5 gap-y-3 text-center">
              {[
                { v: zs.goals, l: 'gol' },
                { v: zs.appearances, l: 'presenze' },
                { v: zs.winRate === null ? '—' : `${Math.round(zs.winRate * 100)}%`, l: 'vittorie' },
                { v: zs.motm, l: 'MOTM' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-xl font-black leading-none">{v}</div>
                  <div className="text-[10px] text-white/45 mt-1">{l}</div>
                </div>
              ))}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <FormDots form={zs.form} size={8} />
                <div className="text-[10px] text-white/45 mt-1.5">forma</div>
              </div>
            </div>
          )}
          <Link
            href={`/players/${zoomed.player.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[12px] font-semibold px-4 py-2 rounded-full"
            style={{ background: 'rgba(198,255,58,0.15)', color: '#c6ff3a', border: '1px solid rgba(198,255,58,0.35)' }}
          >
            Vedi profilo →
          </Link>
          <div className="text-[11px] text-white/35">tocca per chiudere</div>
        </div>
      )}
    </>
  )
}
