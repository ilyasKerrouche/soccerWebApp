import { cachedGlobalStats, cachedGoalkeeperRanking, cachedMotmCounts, cachedPlayedDates, cachedPlayersWithStats } from '@/lib/queries/cached'
import PodiumView from '@/components/PodiumView'
import { comparePlayers } from '@/lib/ranking'
import { getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { computeRecords, goldenPairs } from '@/lib/records'
import { PAIR_MIN_GAMES } from '@/components/RecordsBoard'
import StatsRankings from '@/components/StatsRankings'
import PageHeader from '@/components/PageHeader'
import SeasonPicker from '@/components/SeasonPicker'
import { C, StatTile } from '@/components/ui'
import { availableSeasons, currentSeason, inSeason, parseSeason, seasonEmptyText } from '@/lib/season'

// Dipende da ?stagione=: la cache sta sui dati (lib/queries/cached.ts), non sulla pagina
export const dynamic = 'force-dynamic'

export default async function StatsPage({ searchParams }: { searchParams: { stagione?: string | string[] } }) {
  const now = new Date()
  const season = parseSeason(searchParams.stagione, now)

  const [globalStats, allPlayers, goalkeepers, allMatches, dates] = await Promise.all([
    cachedGlobalStats(season),
    cachedPlayersWithStats(season),
    cachedGoalkeeperRanking(season),
    getAllMatchesWithPlayers(),
    cachedPlayedDates(),
  ])
  const matches = allMatches.filter((m) => inSeason(m.played_at, season))
  const records = computeRecords(matches)
  const pairs = goldenPairs(matches, { minGames: PAIR_MIN_GAMES, limit: 5 })
  // In una stagione compare solo chi ha giocato; in "Sempre" tutti i giocatori attivi, come prima
  const players = season === 'all' ? allPlayers : allPlayers.filter((p) => p.total_appearances > 0)

  let motmCounts: Record<string, number> = {}
  try {
    motmCounts = await cachedMotmCounts(season)
  } catch (e) {
    console.error('MOTM counts failed', e)
  }

  const byGoals = [...players].sort(comparePlayers('goals'))
  const top3 = byGoals.slice(0, 3)

  const tiles = [
    { val: globalStats.total_matches, lbl: 'partite' },
    { val: globalStats.total_goals, lbl: 'gol' },
    { val: String(globalStats.avg_goals_per_match).replace('.', ','), lbl: 'a partita' },
  ]

  const picker = <SeasonPicker seasons={availableSeasons(dates, now)} current={currentSeason(now)} active={season} />

  return (
    <main className="pb-6 px-4">
      <PageHeader title="Statistiche" aside={picker} />

      {season !== 'all' && globalStats.total_matches === 0 ? (
        <p className="text-[13px] text-center py-10" style={{ color: C.muted }}>{seasonEmptyText(season)}</p>
      ) : (
        <>
          {top3.length > 0 && <PodiumView players={top3} />}

          <div className="grid grid-cols-3 gap-2 mt-4">
            {tiles.map(({ val, lbl }) => <StatTile key={lbl} value={val} label={lbl} />)}
          </div>

          <div className="mt-6" />
          <StatsRankings players={players} goalkeepers={goalkeepers} motmCounts={motmCounts} records={records} pairs={pairs} />
        </>
      )}
    </main>
  )
}
