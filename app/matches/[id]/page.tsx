import { getMatchById } from '@/lib/queries/matches'
import FieldView from '@/components/FieldView'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  let match
  try { match = await getMatchById(params.id) } catch { notFound() }

  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)
  const bWins = (match.score_b ?? 0) > (match.score_a ?? 0)
  const teamAPlayers = match.match_players.filter((mp) => mp.team === 'a')
  const teamBPlayers = match.match_players.filter((mp) => mp.team === 'b')
  const topScorerA = teamAPlayers.length > 0 ? teamAPlayers.reduce((t, mp) => mp.goals > t.goals ? mp : t, teamAPlayers[0]) : null
  const topScorerB = teamBPlayers.length > 0 ? teamBPlayers.reduce((t, mp) => mp.goals > t.goals ? mp : t, teamBPlayers[0]) : null

  if (match.is_upcoming) {
    return (
      <main className="pb-4">
        <div className="relative overflow-hidden px-4 pt-10 pb-8 text-center" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
          <div className="absolute -top-10 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 70%)' }} />
          <div className="relative z-10">
            <div className="text-[13px] text-white/40 mb-3 capitalize">{date}</div>
            <span className="inline-block glass border-brand/20 text-brand text-sm font-bold px-5 py-2 rounded-full">📅 Partita in programma</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.4) 0%,transparent 70%)' }} />
        <div className="absolute -bottom-8 -left-6 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,.3) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <div className="text-[13px] font-semibold text-white/45 mb-3 capitalize">{date}</div>
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-sm font-bold text-white/60 w-20 text-right">{match.team_a_name}</div>
            <div className="flex items-center gap-2 text-5xl font-black leading-none">
              <span className={`${aWins ? 'text-win' : 'text-white/40'} glow-violet`}>{match.score_a}</span>
              <span className="text-white/15 text-3xl font-light">–</span>
              <span className={`${bWins ? 'text-win' : 'text-white/40'} glow-violet`}>{match.score_b}</span>
            </div>
            <div className="text-sm font-bold text-white/60 w-20 text-left">{match.team_b_name}</div>
          </div>
          <span className="inline-block glass border-brand/30 text-brand text-[11px] font-bold px-4 py-1.5 rounded-full">
            {aWins ? `🏆 ${match.team_a_name} vince` : bWins ? `🏆 ${match.team_b_name} vince` : '🤝 Pareggio'}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Top scorers */}
        <div className="flex gap-2.5 mb-4">
          {[
            { label: `Top scorer · ${match.team_a_name}`, scorer: topScorerA },
            { label: `Top scorer · ${match.team_b_name}`, scorer: topScorerB },
          ].map(({ label, scorer }) => (
            <div key={label} className="flex-1 flex items-center gap-2 glass rounded-2xl p-3">
              <span className="text-lg">🥇</span>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] tracking-wider uppercase text-white/30">{label}</div>
                <div className="text-sm font-bold truncate">{scorer?.player?.name ?? '—'}</div>
              </div>
              <span className="bg-brand/15 text-brand text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                {scorer?.goals ?? 0} ⚽
              </span>
            </div>
          ))}
        </div>

        {/* Field */}
        <div className="mb-4"><FieldView match={match} /></div>

        {/* Scorers */}
        <div className="flex gap-2.5">
          {[
            { label: `⚽ ${match.team_a_name}`, players: teamAPlayers },
            { label: `⚽ ${match.team_b_name}`, players: teamBPlayers },
          ].map(({ label, players }) => (
            <div key={label} className="flex-1 glass rounded-2xl p-3">
              <div className="text-[9px] tracking-wider uppercase text-white/30 mb-2">{label}</div>
              {players.filter((mp) => mp.goals > 0 || mp.own_goals > 0).map((mp) => (
                <div key={mp.player_id} className="flex items-center gap-1.5 text-sm mb-1.5">
                  <span className="flex-1 text-white/70">{mp.player.name}</span>
                  {mp.goals > 0 && (
                    <span className="bg-brand/15 text-brand text-[11px] font-bold px-2 py-0.5 rounded-full">{mp.goals} ⚽</span>
                  )}
                  {mp.own_goals > 0 && (
                    <span className="bg-red-500/15 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded-full">{mp.own_goals} OG</span>
                  )}
                </div>
              ))}
              {players.filter((mp) => mp.goals > 0 || mp.own_goals > 0).length === 0 && (
                <div className="text-xs text-white/20">Nessun goal</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
