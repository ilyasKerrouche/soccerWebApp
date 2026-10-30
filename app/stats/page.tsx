import { getPlayersWithStats, getGoalkeeperRanking } from '@/lib/queries/players'
import { getGlobalStats } from '@/lib/queries/stats'
import PodiumView from '@/components/PodiumView'
import { comparePlayers } from '@/lib/ranking'
import { getMotmCounts } from '@/lib/queries/motm'
import StatsRankings from '@/components/StatsRankings'
import PageHeader from '@/components/PageHeader'
import { StatTile } from '@/components/ui'

export const revalidate = 60

export default async function StatsPage() {
  const [globalStats, players, goalkeepers] = await Promise.all([
    getGlobalStats(),
    getPlayersWithStats(),
    getGoalkeeperRanking(),
  ])

  let motmCounts: Record<string, number> = {}
  try {
    motmCounts = await getMotmCounts()
  } catch (e) {
    console.error('MOTM counts failed', e)
  }

  const byGoals = [...players].sort(comparePlayers('goals'))
  const top3 = byGoals.slice(0, 3)

  const season = [
    { val: globalStats.total_matches, lbl: 'partite' },
    { val: globalStats.total_goals, lbl: 'gol' },
    { val: String(globalStats.avg_goals_per_match).replace('.', ','), lbl: 'a partita' },
  ]

  return (
    <main className="pb-6 px-4">
      <PageHeader title="Statistiche" eyebrow="Stagione 2025/26" />

      {top3.length > 0 && <PodiumView players={top3} />}

      <div className="grid grid-cols-3 gap-2 mt-4">
        {season.map(({ val, lbl }) => <StatTile key={lbl} value={val} label={lbl} />)}
      </div>

      <div className="mt-6" />
      <StatsRankings players={players} goalkeepers={goalkeepers} motmCounts={motmCounts} />
    </main>
  )
}
