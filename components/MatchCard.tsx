'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { MatchWithPlayers } from '@/lib/types'


export default function MatchCard({ match }: { match: MatchWithPlayers }) {
  const [expanded, setExpanded] = useState(false)

  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (match.is_upcoming) {
    return (
      <Link
        href={`/matches/${match.id}`}
        className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]"
        style={{ border: '1px solid rgba(167,139,250,0.28)' }}
      >
        <span className="text-[13px] font-medium text-white/85">{date}</span>
        <span className="text-[12px] text-brand">Da giocare</span>
      </Link>
    )
  }

  const sa = match.score_a ?? 0
  const sb = match.score_b ?? 0
  const aWins = sa > sb
  const bWins = sb > sa
  const isDraw = sa === sb
  const teamAPlayers = match.match_players.filter((mp) => mp.team === 'a').map((mp) => mp.player.name)
  const teamBPlayers = match.match_players.filter((mp) => mp.team === 'b').map((mp) => mp.player.name)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Compact row — sempre visibile */}
      <button
        className="w-full flex items-center gap-3 px-3 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Score */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xl font-semibold leading-none tracking-[-0.02em] ${aWins ? 'text-win' : isDraw ? 'text-white/70' : 'text-white/30'}`}>{match.score_a}</span>
          <span className="text-white/15 text-sm">–</span>
          <span className={`text-xl font-semibold leading-none tracking-[-0.02em] ${bWins ? 'text-win' : isDraw ? 'text-white/70' : 'text-white/30'}`}>{match.score_b}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`text-[12px] font-medium truncate ${isDraw ? 'text-white/60' : 'text-win'}`}>
            {isDraw ? 'Pareggio' : `Vince ${aWins ? match.team_a_name : match.team_b_name}`}
          </div>
          <div className="text-[11px] text-white/30 mt-0.5">{date}</div>
        </div>

        {/* Expand arrow */}
        <span className="text-white/20 text-sm transition-transform flex-shrink-0" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Expanded content */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? 600 : 0, opacity: expanded ? 1 : 0 }}
      >
        <div className="border-t border-white/6 px-3 pb-3 pt-2.5 flex flex-col gap-2.5">
          {/* Players */}
          {(teamAPlayers.length > 0 || teamBPlayers.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: match.team_a_name, players: teamAPlayers, wins: aWins && !isDraw },
                { name: match.team_b_name, players: teamBPlayers, wins: bWins && !isDraw },
              ].map(({ name, players, wins }) => (
                <div key={name} className="rounded-xl p-2" style={{
                  background: wins ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${wins ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  <div className={`text-[9px] font-black uppercase tracking-wider mb-1.5 ${wins ? 'text-win/70' : 'text-white/30'}`}>
                    {name}
                  </div>
                  {players.map(n => (
                    <div key={n} className={`text-[10px] leading-relaxed truncate ${wins ? 'text-win/55' : 'text-white/40'}`}>{n}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Top scorers + OG */}
          {(() => {
            const scorers = match.match_players.filter((mp) => mp.goals > 0 || mp.own_goals > 0)
            if (scorers.length === 0) return null
            return (
              <div className="flex flex-col gap-1">
                <div className="text-[9px] uppercase tracking-wider text-white/20 font-bold mb-0.5">Marcatori</div>
                {scorers.map((mp) => (
                  <div key={mp.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.12)' }}>
                    <span className="text-[11px] font-bold flex-1">{mp.player.name}</span>
                    <span className="text-[9px] text-white/30">{mp.team === 'a' ? match.team_a_name : match.team_b_name}</span>
                    <div className="flex items-center gap-1">
                      {mp.goals > 0 && <span className="text-[10px] font-black text-brand">{mp.goals} ⚽</span>}
                      {mp.own_goals > 0 && <span className="text-[10px] font-black text-red-400">{mp.own_goals} OG</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Link dettaglio */}
          <Link
            href={`/matches/${match.id}`}
            className="text-center text-[10px] text-brand/50 hover:text-brand transition-colors pt-0.5"
            onClick={e => e.stopPropagation()}
          >
            Vedi dettaglio →
          </Link>
        </div>
      </div>
    </div>
  )
}
