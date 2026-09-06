import { getPlayersWithStats, getGoalkeeperRanking } from '@/lib/queries/players'
import { getGlobalStats } from '@/lib/queries/stats'
import PodiumView from '@/components/PodiumView'
import { buildRankDeltas, comparePlayers } from '@/components/RankDelta'
import StatsRankings from '@/components/StatsRankings'

export const revalidate = 60

export default async function StatsPage() {
  const [globalStats, players, goalkeepers] = await Promise.all([
    getGlobalStats(),
    getPlayersWithStats(),
    getGoalkeeperRanking(),
  ])

  const byGoals = [...players].sort(comparePlayers('goals'))
  const top3 = byGoals.slice(0, 3)
  const deltas = buildRankDeltas(players, 'goals')

  const season = [
    { val: globalStats.total_matches, lbl: 'partite' },
    { val: globalStats.total_goals, lbl: 'gol' },
    { val: globalStats.avg_goals_per_match, lbl: 'a partita' },
  ]

  return (
    <main className="pb-6 px-4">
      <header className="pt-7 pb-1">
        <div className="text-[13px] text-white/35">Stagione 2025/26</div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em] leading-none mt-1">Statistiche</h1>
      </header>

      {top3.length > 0 && <PodiumView players={top3} deltas={deltas} />}

      {/* I numeri di stagione fanno da contesto, non competono col podio. */}
      <div className="flex rule pt-3 pb-4">
        {season.map(({ val, lbl }) => (
          <div key={lbl} className="flex-1 text-center">
            <div className="text-xl font-semibold text-white/85 leading-none tracking-[-0.02em]">{val}</div>
            <div className="text-[10px] text-white/30 mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      <StatsRankings players={players} goalkeepers={goalkeepers} />
    </main>
  )
}
