import Link from 'next/link'
import type { Match } from '@/lib/types'

export default function MatchCard({ match }: { match: Match }) {
  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  if (match.is_upcoming) {
    return (
      <Link
        href={`/matches/${match.id}`}
        className="block p-4 rounded-2xl border border-white/8 hover:border-brand/30 transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-brand/15 text-brand px-3 py-1 rounded-full mb-2">
          📅 In programma
        </span>
        <div className="font-bold">{date}</div>
      </Link>
    )
  }

  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)

  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 hover:border-brand/25 transition-all hover:shadow-lg hover:shadow-brand/10"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="text-center min-w-[80px]">
        <div className="text-2xl font-black tracking-tight">
          <span className={aWins ? 'text-win' : 'text-white/50'}>{match.score_a}</span>
          <span className="text-white/15 mx-1">–</span>
          <span className={!aWins ? 'text-win' : 'text-white/50'}>{match.score_b}</span>
        </div>
        <div className="text-[10px] text-white/25 mt-0.5">
          {match.team_a_name} vs {match.team_b_name}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-[11px] text-white/30 mb-1">{date}</div>
        <div className="text-sm font-bold text-brand">🏆 {aWins ? match.team_a_name : match.team_b_name}</div>
      </div>
      <span className="text-white/15 text-lg">›</span>
    </Link>
  )
}
