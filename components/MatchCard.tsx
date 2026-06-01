import Link from 'next/link'
import type { MatchWithPlayers } from '@/lib/types'

function topScorer(match: MatchWithPlayers, team: 'a' | 'b') {
  const players = match.match_players.filter((mp) => mp.team === team && mp.goals > 0)
  if (players.length === 0) return null
  return players.reduce((a, b) => (b.goals > a.goals ? b : a))
}

function TeamColumn({ name, score, players, wins, upcoming }: {
  name: string
  score?: number | null
  players: string[]
  wins: boolean
  upcoming?: boolean
}) {
  return (
    <div className="flex-1 flex flex-col gap-1.5">
      {/* Team name */}
      <div className={`text-[9px] font-bold text-center truncate ${wins ? 'text-win/80' : 'text-white/30'}`}>{name}</div>

      {/* Score */}
      {score !== undefined && (
        <div className={`text-3xl font-black leading-none text-center ${wins ? 'text-win' : 'text-white/30'}`}>{score}</div>
      )}

      {/* Players box */}
      {players.length > 0 && (
        <div
          className="rounded-xl p-2 flex flex-col gap-0.5 mt-0.5"
          style={{ background: wins && !upcoming ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${wins && !upcoming ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.07)'}` }}
        >
          {players.map((n) => (
            <div key={n} className={`text-[9px] truncate ${wins && !upcoming ? 'text-win/60' : 'text-white/40'}`}>{n}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MatchCard({ match }: { match: MatchWithPlayers }) {
  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const teamAPlayers = match.match_players.filter((mp) => mp.team === 'a').map((mp) => mp.player.name)
  const teamBPlayers = match.match_players.filter((mp) => mp.team === 'b').map((mp) => mp.player.name)

  if (match.is_upcoming) {
    return (
      <Link href={`/matches/${match.id}`} className="flex flex-col rounded-2xl overflow-hidden border border-brand/20 hover:border-brand/50 transition-all" style={{ background: 'rgba(167,139,250,0.06)' }}>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#7c3aed,#6366f1)' }} />
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider uppercase bg-brand/15 text-brand px-2 py-0.5 rounded-full">📅 Upcoming</span>
            <span className="text-[9px] text-white/30">{date}</span>
          </div>
          <div className="flex gap-2">
            <TeamColumn name={match.team_a_name} players={teamAPlayers} wins={false} upcoming />
            <div className="w-px bg-white/8 self-stretch mx-0.5" />
            <TeamColumn name={match.team_b_name} players={teamBPlayers} wins={false} upcoming />
          </div>
        </div>
      </Link>
    )
  }

  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)
  const bestA = topScorer(match, 'a')
  const bestB = topScorer(match, 'b')

  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex flex-col rounded-2xl overflow-hidden border border-white/8 hover:border-brand/30 transition-all hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Date */}
        <div className="text-[9px] text-white/25">{date}</div>

        {/* Two-column layout: team A | team B */}
        <div className="flex gap-2">
          <TeamColumn name={match.team_a_name} score={match.score_a} players={teamAPlayers} wins={aWins} />
          <div className="w-px bg-white/8 self-stretch mx-0.5" />
          <TeamColumn name={match.team_b_name} score={match.score_b} players={teamBPlayers} wins={!aWins} />
        </div>

        {/* Top scorers */}
        {(bestA || bestB) && (
          <div className="border-t border-white/6 pt-2 flex gap-2">
            <div className="flex-1 text-[9px] text-white/50 truncate">
              {bestA ? <>⚽ {bestA.player.name} <span className="text-white/25">{bestA.goals}g</span></> : null}
            </div>
            <div className="flex-1 text-[9px] text-white/50 truncate text-right">
              {bestB ? <>{bestB.goals}g <span className="text-white/25"></span>⚽ {bestB.player.name}</> : null}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
