import { getMatchById } from '@/lib/queries/matches'
import FieldView from '@/components/FieldView'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  let match
  try {
    match = await getMatchById(params.id)
  } catch {
    notFound()
  }

  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)
  const bWins = (match.score_b ?? 0) > (match.score_a ?? 0)

  const teamAPlayers = match.match_players.filter((mp) => mp.team === 'a')
  const teamBPlayers = match.match_players.filter((mp) => mp.team === 'b')

  const topScorerA = teamAPlayers.length > 0
    ? teamAPlayers.reduce((top, mp) => (mp.goals > top.goals ? mp : top), teamAPlayers[0])
    : null
  const topScorerB = teamBPlayers.length > 0
    ? teamBPlayers.reduce((top, mp) => (mp.goals > top.goals ? mp : top), teamBPlayers[0])
    : null

  if (match.is_upcoming) {
    return (
      <main className="px-4 pb-4">
        <div className="pt-7 pb-2 text-center">
          <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2">{date}</div>
          <span className="inline-block bg-white/10 text-white/60 text-sm font-bold px-4 py-1.5 rounded-full">
            📅 Partita in programma
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 pb-4">
      {/* Hero score */}
      <div className="pt-7 pb-3 text-center">
        <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2 capitalize">
          {date}
        </div>
        <div className="flex items-center justify-center gap-5 mb-2">
          <div className="text-sm font-bold text-white/70 w-20 text-right">
            {match.team_a_name}
          </div>
          <div className="flex items-center gap-2.5 text-5xl font-black leading-none">
            <span className={aWins ? 'text-brand' : 'text-white/60'}>{match.score_a}</span>
            <span className="text-white/20 text-3xl font-light">–</span>
            <span className={bWins ? 'text-brand' : 'text-white/60'}>{match.score_b}</span>
          </div>
          <div className="text-sm font-bold text-white/70 w-20 text-left">
            {match.team_b_name}
          </div>
        </div>
        <span className="inline-block bg-brand/15 border border-brand/30 text-brand text-[11px] font-bold px-3 py-1 rounded-full">
          🏆 {aWins ? match.team_a_name : match.team_b_name} vince
        </span>
      </div>

      {/* Top scorers */}
      <div className="flex gap-2.5 mb-3">
        {[
          { label: `Top scorer · ${match.team_a_name}`, scorer: topScorerA },
          { label: `Top scorer · ${match.team_b_name}`, scorer: topScorerB },
        ].map(({ label, scorer }) => (
          <div
            key={label}
            className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl p-2.5"
          >
            <span className="text-lg">🥇</span>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] tracking-wider uppercase text-white/35">{label}</div>
              <div className="text-sm font-bold truncate">
                {scorer?.player?.name ?? '—'}
              </div>
            </div>
            <span className="bg-brand/15 text-brand text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap">
              {scorer?.goals ?? 0} ⚽
            </span>
          </div>
        ))}
      </div>

      {/* Field */}
      <div className="mb-3">
        <FieldView match={match} />
      </div>

      {/* Scorers */}
      <div className="flex gap-2.5">
        {[
          { label: `⚽ ${match.team_a_name}`, players: teamAPlayers },
          { label: `⚽ ${match.team_b_name}`, players: teamBPlayers },
        ].map(({ label, players }) => (
          <div
            key={label}
            className="flex-1 bg-white/4 border border-white/6 rounded-xl p-3"
          >
            <div className="text-[9px] tracking-wider uppercase text-white/35 mb-2">{label}</div>
            {players
              .filter((mp) => mp.goals > 0)
              .map((mp) => (
                <div key={mp.player_id} className="flex items-center text-sm mb-1.5">
                  <span className="flex-1 text-white/80">{mp.player.name}</span>
                  <span className="bg-brand/12 text-brand text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {mp.goals}
                  </span>
                </div>
              ))}
            {players.filter((mp) => mp.goals > 0).length === 0 && (
              <div className="text-xs text-white/25">Nessun goal</div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
