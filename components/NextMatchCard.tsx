'use client'
import { useEffect, useState } from 'react'
import SeasonLink from './SeasonLink'
import { countdownParts, formatRomeDay, formatRomeTime, romeInstant } from '@/lib/homeText'
import AddToCalendar from './AddToCalendar'
import { C, Card } from './ui'

/** Conto alla rovescia in giorni / ore / minuti verso la partita (ora italiana). */
function Countdown({ date, time }: { date: string; time: string }) {
  const target = romeInstant(date, time).getTime()
  // Calcolato solo nel client: l'HTML in cache puo' essere vecchio
  const [parts, setParts] = useState<ReturnType<typeof countdownParts> | undefined>(undefined)
  useEffect(() => {
    const tick = () => setParts(countdownParts(target - Date.now()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [target])
  if (!parts) return null
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

/** Riquadro "Prossima partita": uguale in home e nella pagina Partite. Con href, giorno e ora portano al dettaglio. */
export default function NextMatchCard({ match, href }: { match: { played_at: string; match_time: string | null }; href?: string }) {
  const time = formatRomeTime(match.match_time)
  const head = (
    <>
      <div className="text-[11px] font-semibold" style={{ color: C.acc }}>Da giocare</div>
      <div className="text-[17px] font-semibold capitalize mt-0.5">{formatRomeDay(match.played_at)}</div>
      {time && <div className="text-[13px]" style={{ color: C.muted }}>{time}</div>}
    </>
  )
  return (
    <Card className="p-3.5">
      {href ? <SeasonLink href={href} className="block">{head}</SeasonLink> : head}
      {match.match_time && <Countdown date={match.played_at} time={match.match_time} />}
      <div className="mt-3"><AddToCalendar date={match.played_at} title="Calcetto" /></div>
    </Card>
  )
}
