import Link from 'next/link'
import { getMatchById } from '@/lib/queries/matches'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getMotmCounts, getMotmWinnersByMatch } from '@/lib/queries/motm'
import { buildLedText, buildUpcomingLedText, sortScorers, teamTopScorers, toPlayerHomeStats } from '@/lib/homeText'
import StadiumPitch from '@/components/home/StadiumPitch'
import NextMatchCard from '@/components/NextMatchCard'
import MotmSection from '@/components/motm/MotmSection'
import { C, Card, Section } from '@/components/ui'
import type { PlayerHomeStats } from '@/lib/types'
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
  const hasLineup = match.match_players.length > 0

  // Statistiche per le card ingrandite e MOTM (solo a voto chiuso): se falliscono, il campo resta senza
  let stats: Record<string, PlayerHomeStats> = {}
  let motmIds: string[] = []
  if (hasLineup) {
    try {
      const [players, counts, winners] = await Promise.all([
        getPlayersWithStats(),
        getMotmCounts(),
        match.is_upcoming ? Promise.resolve({} as Record<string, string[]>) : getMotmWinnersByMatch([match.id]),
      ])
      stats = toPlayerHomeStats(players, counts)
      motmIds = winners[match.id] ?? []
    } catch (e) {
      console.error('match detail stats failed', e)
    }
  }

  if (match.is_upcoming) {
    return (
      <main className="pb-6">
        <div className="px-4 pt-6 pb-2 text-center">
          <div className="text-[12px] text-muted capitalize">{date}</div>
          <div className="text-[18px] font-semibold mt-1">
            {match.team_a_name} <span className="text-muted">–</span> {match.team_b_name}
          </div>
        </div>
        {hasLineup && (
          <StadiumPitch
            match={match}
            motmIds={[]}
            stats={stats}
            ledText={buildUpcomingLedText({ teamA: match.team_a_name, teamB: match.team_b_name, playedAt: match.played_at, time: match.match_time })}
          />
        )}
        <div className="px-4 pt-4">
          <NextMatchCard match={match} />
        </div>
      </main>
    )
  }

  const sa = match.score_a ?? 0
  const sb = match.score_b ?? 0
  const aWins = sa > sb
  const bWins = sb > sa
  const motmNames = match.match_players.filter((mp) => motmIds.includes(mp.player_id)).map((mp) => mp.player.name)
  const ledText = buildLedText({
    teamA: match.team_a_name, teamB: match.team_b_name, scoreA: sa, scoreB: sb, motmNames,
    scorers: match.match_players.filter((mp) => mp.goals > 0).map((mp) => ({ name: mp.player.name, goals: mp.goals })),
    next: null,
  })
  // Stesso ordine del LED: piu' gol prima, a parita' alfabetico; gli autogol in fondo
  const scorers = sortScorers(
    match.match_players.filter((mp) => mp.goals > 0 || mp.own_goals > 0),
    (mp) => ({ name: mp.player.name, goals: mp.goals }),
  )
  const tops = teamTopScorers(match.match_players)

  return (
    <main className="pb-6">
      {/* Risultato, come in cima alla home */}
      <div className="px-4 pt-6 pb-1 text-center">
        <div className="text-[12px] text-muted mb-2 capitalize">{date}</div>
        <div className="flex items-baseline justify-center gap-3.5">
          <div className={`text-[14px] font-semibold w-24 text-right truncate ${aWins || !bWins ? 'text-white' : 'text-muted'}`}>{match.team_a_name}</div>
          <div className="numeric text-[52px] font-bold leading-none">{sa} – {sb}</div>
          <div className={`text-[14px] font-semibold w-24 text-left truncate ${bWins || !aWins ? 'text-white' : 'text-muted'}`}>{match.team_b_name}</div>
        </div>
        <div className="text-[12px] text-muted mt-1.5">
          {aWins ? `Vince ${match.team_a_name}` : bWins ? `Vince ${match.team_b_name}` : 'Pareggio'}
          {motmNames.length > 0 && <span style={{ color: C.gold }}> · ★ MOTM {motmNames.join(' & ')}</span>}
        </div>
      </div>

      {hasLineup && <StadiumPitch match={match} motmIds={motmIds} stats={stats} ledText={ledText} />}

      <div className="px-4 pt-4 flex flex-col gap-6">
        <MotmSection match={match} />

        <Section title="Marcatori">
          {scorers.length === 0 ? (
            <p className="text-[13px] text-center py-4" style={{ color: C.muted }}>Nessun gol in questa partita.</p>
          ) : (
            <Card className="overflow-hidden">
              {scorers.map((mp, i) => (
                <Link
                  key={mp.player_id}
                  href={`/players/${mp.player_id}`}
                  className="flex items-center gap-2.5 px-3.5 py-3 text-[14px] transition-colors hover:bg-white/[0.03]"
                  style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}
                >
                  <span className="truncate">{mp.player.name}</span>
                  {tops.has(mp.player_id) && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: 'rgba(91,156,255,.14)', color: C.acc }}>
                      TOP
                    </span>
                  )}
                  <span className="text-[11px] flex-shrink-0" style={{ color: C.muted }}>{mp.team === 'a' ? match.team_a_name : match.team_b_name}</span>
                  <span className="ml-auto flex items-center gap-2 flex-shrink-0 font-semibold numeric text-[16px]">
                    {mp.goals > 0 && <span>{mp.goals}</span>}
                    {mp.own_goals > 0 && <span style={{ color: C.loss }}>{mp.own_goals} autogol</span>}
                  </span>
                </Link>
              ))}
            </Card>
          )}
        </Section>
      </div>
    </main>
  )
}
