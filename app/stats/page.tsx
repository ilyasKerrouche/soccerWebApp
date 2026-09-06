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

  return (
    <main className="pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
        <div className="absolute -top-10 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-black">📊 Statistiche</h1>
          <div className="text-sm text-white/40 mt-1">Stagione 2025/26 · {globalStats.total_matches} partite</div>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6">

        {/* Podio */}
        {top3.length > 0 && (
          <section>
            <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-4 font-bold">🏆 Top marcatori</div>
            <PodiumView players={top3} deltas={deltas} />
          </section>
        )}

        {/* Stagione boxes */}
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Stagione</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: globalStats.total_matches, lbl: 'Partite giocate' },
              { val: globalStats.total_goals, lbl: 'Goal totali' },
              { val: globalStats.wins_a, lbl: 'Vittorie Team A' },
              { val: globalStats.wins_b, lbl: 'Vittorie Team B' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-3xl font-black text-brand leading-none">{val}</div>
                <div className="text-[9px] text-white/35 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Classifiche con chip toggle */}
        <StatsRankings players={players} goalkeepers={goalkeepers} />

      </div>
    </main>
  )
}
