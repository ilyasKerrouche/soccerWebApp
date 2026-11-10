import Link from 'next/link'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getMotmWinnersByMatch } from '@/lib/queries/motm'
import { cachedGlobalStats, cachedMotmCounts, cachedPlayersWithStats } from '@/lib/queries/cached'
import { currentSeason, inSeason, seasonEmptyText, seasonOf } from '@/lib/season'
import { motmStatus } from '@/lib/motm'
import { buildLedText, formatRomeDay, toPlayerHomeStats, topScorers as topScorersOf } from '@/lib/homeText'
import HomeClient from '@/components/HomeClient'
import StadiumPitch from '@/components/home/StadiumPitch'
import MotmCelebration from '@/components/home/MotmCelebration'
import PullToRefresh from '@/components/PullToRefresh'

export const revalidate = 60

export default async function HomePage() {
  // Risultati e classifica: stagione in corso. Blocco ultima partita (campo, card, marcatori,
  // il tuo riepilogo): la stagione di quella partita, anche se e' quella appena chiusa.
  const season = currentSeason(new Date())
  const [stats, lastMatch, nextMatch, allMatches] = await Promise.all([
    // Se i numeri non arrivano: null, cosi' non si dice "stagione al via" per sbaglio
    cachedGlobalStats(season).catch((e) => { console.error('home stats failed', e); return null }),
    getLastMatch(),
    getNextMatch(),
    getAllMatchesWithPlayers(),
  ])
  const lastSeason = lastMatch ? seasonOf(lastMatch.played_at) : season
  const [players, seasonPlayers] = await Promise.all([
    cachedPlayersWithStats(lastSeason),
    lastSeason === season ? null : cachedPlayersWithStats(season),
  ])

  // MOTM (solo a voto chiuso) e conteggi per le card: se falliscono, il campo resta senza
  let motmIds: string[] = []
  let motmCounts: Record<string, number> = {}
  if (lastMatch) {
    try {
      const [winners, counts] = await Promise.all([getMotmWinnersByMatch([lastMatch.id]), cachedMotmCounts(lastSeason)])
      motmIds = winners[lastMatch.id] ?? []
      motmCounts = counts
    } catch (e) {
      console.error('MOTM home failed', e)
    }
  }
  const playerStats = toPlayerHomeStats(players, motmCounts)

  const recentMatches = allMatches.filter((m) => !m.is_upcoming && inSeason(m.played_at, season)).slice(0, 3)
  const topScorers = topScorersOf(seasonPlayers ?? players, 5)
  const emptyText = stats && stats.total_matches === 0 ? seasonEmptyText(season) : null

  const voteOpen = lastMatch?.motm_closes_at && motmStatus(lastMatch.motm_closes_at, new Date()) === 'open'
    ? { matchId: lastMatch.id, closesAt: lastMatch.motm_closes_at }
    : null

  const scoreA = lastMatch?.score_a ?? 0
  const scoreB = lastMatch?.score_b ?? 0
  const motmNames = lastMatch ? lastMatch.match_players.filter((mp) => motmIds.includes(mp.player_id)).map((mp) => mp.player.name) : []
  const ledText = lastMatch
    ? buildLedText({
        teamA: lastMatch.team_a_name, teamB: lastMatch.team_b_name, scoreA, scoreB, motmNames,
        scorers: lastMatch.match_players.filter((mp) => mp.goals > 0).map((mp) => ({ name: mp.player.name, goals: mp.goals })),
        next: nextMatch ? { playedAt: nextMatch.played_at, time: nextMatch.match_time } : null,
      })
    : ''

  return (
    <main className="pb-6" style={{ background: '#0d1420', color: '#e8ecf2' }}>
      <PullToRefresh />

      {/* L'ultima partita e' la cosa che si viene a vedere */}
      {lastMatch ? (
        <section className="pt-4">
          <Link href={`/matches/${lastMatch.id}`} className="block px-4 text-center">
            <div className="text-[11px] capitalize" style={{ color: '#8a96a8' }}>Ultima partita · {formatRomeDay(lastMatch.played_at)}</div>
            <div className="flex items-baseline justify-center gap-3.5 mt-1">
              <span className="w-24 text-right text-[14px] font-semibold truncate" style={{ color: scoreA >= scoreB ? '#ffffff' : '#8a96a8' }}>{lastMatch.team_a_name}</span>
              <span className="numeric text-[42px] font-bold leading-none">{scoreA} – {scoreB}</span>
              <span className="w-24 text-left text-[14px] font-semibold truncate" style={{ color: scoreB >= scoreA ? '#ffffff' : '#8a96a8' }}>{lastMatch.team_b_name}</span>
            </div>
            <div className="text-[12px] mt-1" style={{ color: '#8a96a8' }}>
              {scoreA === scoreB ? 'Pareggio' : `Vince ${scoreA > scoreB ? lastMatch.team_a_name : lastMatch.team_b_name}`}
              {motmNames.length > 0 && <span style={{ color: '#f5c451' }}> · ★ MOTM {motmNames.join(' & ')}</span>}
            </div>
          </Link>
          <StadiumPitch match={lastMatch} motmIds={motmIds} stats={playerStats} ledText={ledText} />
          {motmIds.length > 0 && (
            <MotmCelebration
              matchId={lastMatch.id}
              closesAt={lastMatch.motm_closes_at}
              winners={lastMatch.match_players.filter((mp) => motmIds.includes(mp.player_id)).map((mp) => mp.player)}
              matchLabel={`${lastMatch.team_a_name} ${scoreA} – ${scoreB} ${lastMatch.team_b_name} · ${formatRomeDay(lastMatch.played_at)}`}
            />
          )}
        </section>
      ) : (
        <div className="px-4 py-10 text-center text-[13px]" style={{ color: '#8a96a8' }}>
          Nessuna partita registrata.
        </div>
      )}

      <HomeClient
        lastMatch={lastMatch}
        nextMatch={nextMatch}
        recentMatches={recentMatches}
        stats={stats}
        topScorers={topScorers}
        players={players}
        playerStats={playerStats}
        voteOpen={voteOpen}
        season={season}
        emptyText={emptyText}
      />
    </main>
  )
}
