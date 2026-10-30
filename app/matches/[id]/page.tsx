import { getMatchById } from '@/lib/queries/matches'
import FieldView from '@/components/FieldView'
import MotmSection from '@/components/motm/MotmSection'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
// Formazioni e risultato cambiano dall'admin: nessuna lettura in cache (vedi app/admin/layout.tsx)
export const fetchCache = 'force-no-store'

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
        <div className="px-4 pt-8 pb-6 text-center">
          <div className="text-[13px] text-muted mb-3 capitalize">{date}</div>
          <span className="inline-block glass text-brand text-sm font-semibold px-5 py-2 rounded-full">📅 Partita in programma</span>
        </div>
      </main>
    )
  }

  return (
    <main className="pb-4">
      {/* Risultato, come in cima alla home */}
      <div className="px-4 pt-6 pb-5 text-center">
        <div className="text-[12px] text-muted mb-2 capitalize">{date}</div>
        <div className="flex items-baseline justify-center gap-3.5">
          <div className={`text-[14px] font-semibold w-24 text-right truncate ${aWins || !bWins ? 'text-white' : 'text-muted'}`}>{match.team_a_name}</div>
          <div className="text-[44px] font-bold leading-none tabular-nums tracking-tight">{match.score_a} – {match.score_b}</div>
          <div className={`text-[14px] font-semibold w-24 text-left truncate ${bWins || !aWins ? 'text-white' : 'text-muted'}`}>{match.team_b_name}</div>
        </div>
        <div className="text-[12px] text-muted mt-1.5">
          {aWins ? `Vince ${match.team_a_name}` : bWins ? `Vince ${match.team_b_name}` : 'Pareggio'}
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
                <div className="text-[10px] text-muted">{label}</div>
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

        <MotmSection match={match} />

        {/* Scorers */}
        <div className="flex gap-2.5">
          {[
            { label: `⚽ ${match.team_a_name}`, players: teamAPlayers },
            { label: `⚽ ${match.team_b_name}`, players: teamBPlayers },
          ].map(({ label, players }) => (
            <div key={label} className="flex-1 glass rounded-2xl p-3">
              <div className="text-[11px] font-semibold text-muted mb-2">{label}</div>
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
