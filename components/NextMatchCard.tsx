'use client'
import { useEffect, useState } from 'react'
import SeasonLink from './SeasonLink'
import { countdownParts, formatRomeDay, formatRomeTime, matchPhase, romeInstant, type MatchPhase } from '@/lib/homeText'
import AddToCalendar from './AddToCalendar'
import { C, Card } from './ui'

type Clock = { phase: MatchPhase | null; parts: ReturnType<typeof countdownParts>; minutesIn: number }

/** Pallino rosso che pulsa con la scritta (stile in globals.css). */
function Live({ label = 'LIVE' }: { label?: string }) {
  return <span className="live-badge"><i aria-hidden />{label}</span>
}

/** Conto alla rovescia in giorni / ore / minuti verso la partita (ora italiana). */
function Countdown({ parts }: { parts: NonNullable<Clock['parts']> }) {
  return (
    <div className="flex gap-2 mt-3">
      {[{ v: parts.d, l: 'giorni' }, { v: parts.h, l: 'ore' }, { v: parts.m, l: 'min' }].map(({ v, l }) => (
        <div key={l} className="flex-1 rounded-[10px] py-2 text-center" style={{ background: C.surf2 }}>
          <div className="numeric text-[22px] font-semibold leading-none">{l === 'giorni' ? v : String(v).padStart(2, '0')}</div>
          <div className="text-[10px] mt-1" style={{ color: C.muted }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

type CardMatch = { played_at: string; match_time: string | null; match_end_time?: string | null }

/**
 * Riquadro "Prossima partita": uguale in home e nella pagina Partite. Con href, giorno e ora portano al dettaglio.
 * Tra orario di inizio e di fine il conto alla rovescia lascia il posto al simbolo LIVE.
 */
export default function NextMatchCard({ match, href }: { match: CardMatch; href?: string }) {
  const { played_at: date, match_time: start } = match
  const end = match.match_end_time ?? null
  // Calcolato solo nel client: l'HTML in cache puo' essere vecchio
  const [clock, setClock] = useState<Clock | undefined>(undefined)
  useEffect(() => {
    if (!start) return
    const startAt = romeInstant(date, start).getTime()
    const tick = () => {
      const now = Date.now()
      setClock({
        phase: matchPhase({ date, start, end }, new Date(now)),
        parts: countdownParts(startAt - now),
        minutesIn: Math.max(0, Math.floor((now - startAt) / 60_000)),
      })
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [date, start, end])

  const live = clock?.phase === 'live'
  const from = formatRomeTime(start)
  const to = formatRomeTime(end)
  const head = (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold" style={{ color: C.acc }}>Da giocare</div>
        {live && <Live />}
      </div>
      <div className="text-[17px] font-semibold capitalize mt-0.5">{formatRomeDay(date)}</div>
      {from && <div className="text-[13px]" style={{ color: C.muted }}>{to ? `${from} – ${to}` : from}</div>}
    </>
  )
  return (
    <Card className="p-3.5">
      {href ? <SeasonLink href={href} className="block">{head}</SeasonLink> : head}
      {live && clock ? (
        <div className="live-bar mt-3">
          <Live label="IN CAMPO ORA" />
          <span style={{ color: C.muted }}>{clock.minutesIn < 1 ? 'appena iniziata' : `iniziata da ${clock.minutesIn} min`}</span>
        </div>
      ) : (
        clock?.parts && <Countdown parts={clock.parts} />
      )}
      <div className="mt-3"><AddToCalendar date={date} title="Calcetto" /></div>
    </Card>
  )
}
