'use client'
import { useState } from 'react'
import SeasonLink from './SeasonLink'
import type { MatchWithPlayers } from '@/lib/types'
import { dayParts } from '@/lib/monthGroups'
import { C } from './ui'

/** Riga di una partita giocata: data, squadre con i gol, MOTM. Il tocco apre formazioni e marcatori. */
export default function MatchCard({ match, motmNames = [] }: { match: MatchWithPlayers; motmNames?: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const { day, weekday } = dayParts(match.played_at)

  const sa = match.score_a ?? 0
  const sb = match.score_b ?? 0
  const isDraw = sa === sb
  const teams = [
    { key: 'a' as const, name: match.team_a_name, score: sa, wins: sa > sb },
    { key: 'b' as const, name: match.team_b_name, score: sb, wins: sb > sa },
  ]
  const scorers = match.match_players.filter((mp) => mp.goals > 0 || mp.own_goals > 0)

  return (
    <div>
      <button className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
        <div className="w-[34px] text-center flex-shrink-0">
          <div className="numeric text-[18px] font-semibold leading-none">{day}</div>
          <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{weekday}</div>
        </div>
        <div className="flex-1 min-w-0 text-[13.5px] leading-[1.5]">
          {teams.map((t) => (
            <div key={t.key} className="flex justify-between gap-2" style={t.wins ? { color: '#fff', fontWeight: 600 } : { color: C.muted }}>
              <span className="truncate">{t.name}</span>
              <span className="numeric text-[15px] leading-[20px]">{t.score}</span>
            </div>
          ))}
          {motmNames.length > 0 && (
            <div className="text-[11px] mt-0.5 truncate" style={{ color: C.gold }}>★ MOTM {motmNames.join(' & ')}</div>
          )}
        </div>
        <span className="text-[12px] flex-shrink-0 transition-transform" style={{ color: C.muted, transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 animate-section">
          <div className="grid grid-cols-2 gap-2">
            {teams.map((t) => (
              <div key={t.key} className="rounded-[10px] px-2.5 py-2 text-[12px] leading-[1.6] min-w-0" style={{ background: C.surf2, color: '#c9d1dd' }}>
                <div className="text-[11px] font-semibold mb-0.5 truncate" style={{ color: t.wins && !isDraw ? '#fff' : C.muted }}>{t.name}</div>
                {match.match_players.filter((mp) => mp.team === t.key).map((mp) => (
                  <div key={mp.id} className="truncate">{mp.player.name}</div>
                ))}
              </div>
            ))}
          </div>

          {scorers.length > 0 && (
            <div className="mt-2.5 text-[12.5px]">
              {scorers.map((mp, i) => (
                <div key={mp.id} className="flex justify-between gap-2 px-0.5 py-1.5" style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                  <span className="truncate">
                    {mp.player.name} <span style={{ color: C.muted }}>· {mp.team === 'a' ? match.team_a_name : match.team_b_name}</span>
                  </span>
                  <span className="flex gap-2 flex-shrink-0 font-semibold numeric text-[14px]">
                    {mp.goals > 0 && <span>{mp.goals}</span>}
                    {mp.own_goals > 0 && <span style={{ color: C.loss }}>{mp.own_goals} autogol</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          <SeasonLink href={`/matches/${match.id}`} className="inline-block mt-2.5 text-[12px] font-semibold" style={{ color: C.acc }}>
            Vedi dettaglio →
          </SeasonLink>
        </div>
      )}
    </div>
  )
}
