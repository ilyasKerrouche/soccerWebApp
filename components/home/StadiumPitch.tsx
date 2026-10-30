'use client'
import { useEffect, useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import CardZoom from './CardZoom'
import { holoSlots } from '@/lib/holoLayout'
import { SPONSORS } from '@/lib/sponsors'
import { STADIUM_SEEN_KEY } from '@/lib/stadiumSeen'
import type { MatchWithPlayers, Player, PlayerHomeStats } from '@/lib/types'

type Props = {
  match: MatchWithPlayers
  motmIds: string[]
  stats: Record<string, PlayerHomeStats>
  ledText: string
}

// Il campo e' disegnato a dimensione doppia e allontanato con translateZ: testo e linee restano nitidi.
const PW = 440
const PH = 580
const GAP = 40
const BOARD_H = 46
const CARD_W = 86
const SPONSOR_MS = 3500
// Durata dell'entrata (ritardi + animazione): dopo, il campo si segna come gia' visto
const ENTRY_MS = 2200

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return reduced
}

function SponsorBoard({ offset, reduced }: { offset: number; reduced: boolean }) {
  // cur entra con la tendina sopra prev, che resta visibile sotto finche' non e' coperto
  const [state, setState] = useState({ cur: offset % SPONSORS.length, prev: -1 })
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setState((s) => ({ prev: s.cur, cur: (s.cur + 1) % SPONSORS.length })), SPONSOR_MS)
    return () => clearInterval(id)
  }, [offset, reduced])
  return (
    <>
      {SPONSORS.map((s, i) => (
        <div
          key={s.name}
          className={`stadium-ad ${i === state.cur ? 'stadium-ad-on' : i === state.prev ? 'stadium-ad-prev' : ''}`}
          style={{ background: s.bg, color: s.fg, zIndex: i === state.cur ? 2 : i === state.prev ? 1 : 0, visibility: i === state.cur || i === state.prev ? 'visible' : 'hidden' }}
        >
          <span className="stadium-ad-emoji">{s.emoji}</span>
          {s.name}
          {s.tagline && <small>{s.tagline}</small>}
        </div>
      ))}
    </>
  )
}

export default function StadiumPitch({ match, motmIds, stats, ledText }: Props) {
  const reduced = useReducedMotion()
  const [zoomed, setZoomed] = useState<{ player: Player; origin: DOMRect } | null>(null)

  // Le card salgono dal prato una volta per sessione. L'animazione e' decisa dal CSS prima del primo disegno
  // (attributo data-stadium-seen sull'html, impostato dallo script in app/layout.tsx); qui la si segna come vista.
  useEffect(() => {
    if (document.documentElement.dataset.stadiumSeen) return
    const id = setTimeout(() => {
      document.documentElement.dataset.stadiumSeen = '1'
      try { sessionStorage.setItem(STADIUM_SEEN_KEY, '1') } catch {}
    }, ENTRY_MS)
    return () => clearTimeout(id)
  }, [])

  const placed = (['a', 'b'] as const).flatMap((side) => {
    const mps = match.match_players.filter((mp) => mp.team === side)
    const slots = holoSlots(mps.map((mp) => mp.player.position), side)
    // La prospettiva ingrandisce la meta' vicina e rimpicciolisce quella lontana: le file vicine si distanziano,
    // quelle lontane si stringono (cosi' il portiere in fondo non copre il tabellone).
    // Colonne sfalsate: le file vicine al centrocampo piu' strette, le altre piu' larghe, per non coprire le targhette.
    const y = (v: number) => (v < 50 ? 50 - (50 - v) * 0.8 : Math.min(93, 50 + (v - 50) * 1.15))
    const x = (v: number, row: number) => 50 + (v - 50) * (Math.abs(row - 50) < 15 ? 0.95 : 1.45)
    return mps.map((mp, i) => ({ mp, slot: { x: x(slots[i].x, slots[i].y), y: y(slots[i].y) } }))
  })
  // Prima i giocatori lontani: cosi' quelli vicini restano sopra
  placed.sort((x, y) => x.slot.y - y.slot.y)

  return (
    <>
      <div className="stadium-scene">
        <div className="stadium-pitch" style={{ width: PW, height: PH, marginLeft: -PW / 2 }}>
          <div className="stadium-apron" />
          <div className="stadium-grass" />
          <div className="stadium-ln stadium-ln-out" />
          <div className="stadium-ln stadium-ln-mid" />
          <div className="stadium-ln stadium-ln-circ" />
          <div className="stadium-ln stadium-ln-bt" />
          <div className="stadium-ln stadium-ln-bb" />
          <div className="stadium-ln stadium-ln-gt" />
          <div className="stadium-ln stadium-ln-gb" />

          {/* Cartelloni: in fondo il LED con i dati, ai lati gli sponsor. Il lato verso la camera non c'e'. */}
          {([[0, PH / 2 + GAP, PW], [90, PW / 2 + GAP, PH], [270, PW / 2 + GAP, PH]] as const).map(([angle, dist, len], i) => (
            <div key={angle} className="stadium-pivot" style={{ left: PW / 2, top: PH / 2, transform: `rotateZ(${angle}deg)` }}>
              <div className={`stadium-board ${i === 0 ? 'stadium-board-led' : ''}`} style={{ width: len, left: -len / 2, top: -dist - BOARD_H, height: BOARD_H }}>
                {i === 0 ? (
                  <span className="stadium-led-text" style={{ animationDuration: `${Math.max(12, ledText.length * 0.18)}s` }}>
                    {`${ledText}  ·  `.repeat(3)}
                  </span>
                ) : (
                  <SponsorBoard offset={i === 1 ? 0 : 3} reduced={reduced} />
                )}
              </div>
            </div>
          ))}

          {placed.map(({ mp, slot }, i) => {
            const motm = motmIds.includes(mp.player_id)
            return (
              <button
                key={mp.player_id}
                type="button"
                aria-label={`${mp.player.name}: apri le statistiche`}
                onClick={(e) => {
                  const img = e.currentTarget.querySelector('.stadium-card-img') ?? e.currentTarget
                  setZoomed({ player: mp.player, origin: img.getBoundingClientRect() })
                }}
                // Mentre e' ingrandita, la card sul campo si nasconde: sembra che si sollevi da li'
                className={`stadium-card ${motm ? 'stadium-card-motm' : ''} ${zoomed?.player.id === mp.player_id ? 'stadium-card-lifted' : ''}`}
                style={{ left: (slot.x / 100) * PW - CARD_W / 2, top: (slot.y / 100) * PH - CARD_W / 0.72 }}
              >
                {/* L'ombra resta a terra e si allarga mentre la card scende */}
                <span className="stadium-card-shadow" style={{ animationDelay: `${0.15 + i * 0.1}s` }} />
                <span className="stadium-card-rise" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                  <PlayerCard player={mp.player} width={CARD_W} className="stadium-card-img" />
                  <span className="stadium-plate">{motm ? '★ ' : ''}{mp.player.name}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {zoomed && (
        <CardZoom
          player={zoomed.player}
          stats={stats[zoomed.player.id]}
          origin={zoomed.origin}
          reduced={reduced}
          onClosed={() => setZoomed(null)}
        />
      )}
    </>
  )
}
