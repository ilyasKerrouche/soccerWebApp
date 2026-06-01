import { getPlayersWithStats } from '@/lib/queries/players'
import { getGlobalStats, getRecentGoalsPerMatch } from '@/lib/queries/stats'
import BarChart from '@/components/BarChart'
import PlayerCard from '@/components/PlayerCard'

export const revalidate = 60

export default async function StatsPage() {
  const [globalStats, recentGoals, players] = await Promise.all([
    getGlobalStats(),
    getRecentGoalsPerMatch(8),
    getPlayersWithStats(),
  ])

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort(
    (a, b) => b.total_appearances - a.total_appearances
  )
  const maxGoals = byGoals[0]?.total_goals ?? 1
  const maxAppearances = byAppearances[0]?.total_appearances ?? 1

  const globalBoxes = [
    {
      val: globalStats.total_goals,
      lbl: 'Goal totali',
      sub: `Media ${globalStats.avg_goals_per_match} a partita`,
      green: true,
    },
    {
      val: globalStats.total_matches,
      lbl: 'Partite giocate',
      sub: `${globalStats.total_players} giocatori attivi`,
    },
    {
      val: globalStats.wins_a,
      lbl: 'Vittorie Team A',
      sub: `su ${globalStats.total_matches} partite`,
    },
    {
      val: globalStats.wins_b,
      lbl: 'Vittorie Team B',
      sub: `su ${globalStats.total_matches} partite`,
    },
  ]

  return (
    <main className="px-4 pb-4">
      <div className="pt-7 pb-4">
        <h1 className="text-2xl font-black">📊 Statistiche</h1>
        <div className="text-xs text-white/35 mt-1">
          Stagione 2025/26 · {globalStats.total_matches} partite
        </div>
      </div>

      {/* Global boxes */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
        Riepilogo stagione
      </div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {globalBoxes.map(({ val, lbl, sub, green }) => (
          <div
            key={lbl}
            className={`rounded-2xl p-3.5 border ${
              green ? 'bg-brand/7 border-brand/20' : 'bg-white/4 border-white/7'
            }`}
          >
            <div className={`text-4xl font-black leading-none ${green ? 'text-brand' : ''}`}>
              {val}
            </div>
            <div className="text-[11px] text-white/40 mt-1">{lbl}</div>
            <div className="text-[10px] text-white/25 mt-1.5 pt-1.5 border-t border-white/6">
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {recentGoals.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
            Goal per partita (ultime 8)
          </div>
          <div className="mb-5">
            <BarChart data={recentGoals} />
          </div>
        </>
      )}

      {/* Top scorers */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
        🥇 Classifica marcatori
      </div>
      <div className="flex flex-col gap-1.5 mb-5">
        {byGoals.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2"
          >
            <span className="text-xs font-black text-white/25 w-4">{i + 1}</span>
            <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={28} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <div className="w-20 h-1.5 bg-white/7 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${(p.total_goals / maxGoals) * 100}%` }}
              />
            </div>
            <span className="text-sm font-black text-brand w-6 text-right">
              {p.total_goals}
            </span>
          </div>
        ))}
      </div>

      {/* Presenze */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
        👟 Più presenze
      </div>
      <div className="flex flex-col gap-1.5">
        {byAppearances.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2"
          >
            <span className="text-xs font-black text-white/25 w-4">{i + 1}</span>
            <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={28} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <div className="w-20 h-1.5 bg-white/7 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(p.total_appearances / maxAppearances) * 100}%`,
                  background: '#818cf8',
                }}
              />
            </div>
            <span
              className="text-sm font-black w-6 text-right"
              style={{ color: '#818cf8' }}
            >
              {p.total_appearances}
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
