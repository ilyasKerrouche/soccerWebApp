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
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)
  const maxGoals = byGoals[0]?.total_goals ?? 1
  const maxAppearances = byAppearances[0]?.total_appearances ?? 1

  const boxes = [
    { val: globalStats.total_goals, lbl: 'Goal totali', sub: `Media ${globalStats.avg_goals_per_match}/partita`, accent: true },
    { val: globalStats.total_matches, lbl: 'Partite', sub: `${globalStats.total_players} giocatori` },
    { val: globalStats.wins_a, lbl: 'Vittorie A', sub: `su ${globalStats.total_matches}` },
    { val: globalStats.wins_b, lbl: 'Vittorie B', sub: `su ${globalStats.total_matches}` },
  ]

  return (
    <main className="pb-4">
      <div className="relative overflow-hidden px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
        <div className="absolute -top-10 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-black">📊 Statistiche</h1>
          <div className="text-sm text-white/40 mt-1">Stagione 2025/26 · {globalStats.total_matches} partite</div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Boxes */}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-3 font-bold">Riepilogo</div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {boxes.map(({ val, lbl, sub, accent }) => (
            <div key={lbl} className={`rounded-2xl p-4 border ${accent ? 'border-brand/25' : 'border-white/6 glass'}`}
              style={accent ? { background: 'rgba(167,139,250,0.1)' } : {}}>
              <div className={`text-4xl font-black leading-none glow-violet ${accent ? 'text-brand' : ''}`}>{val}</div>
              <div className="text-[11px] text-white/40 mt-1">{lbl}</div>
              <div className="text-[10px] text-white/20 mt-1.5 pt-1.5 border-t border-white/6">{sub}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        {recentGoals.length > 0 && (
          <>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-3 font-bold">Goal per partita</div>
            <div className="mb-5"><BarChart data={recentGoals} /></div>
          </>
        )}

        {/* Scorers */}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-3 font-bold">🥇 Marcatori</div>
        <div className="flex flex-col gap-2 mb-5">
          {byGoals.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2.5 glass rounded-xl px-3 py-2">
              <span className="text-xs font-black text-white/20 w-4">{i + 1}</span>
              <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
                <PlayerCard player={p} width={28} />
              </div>
              <span className="flex-1 text-sm font-semibold">{p.name}</span>
              <div className="w-20 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${(p.total_goals / maxGoals) * 100}%` }} />
              </div>
              <span className="text-sm font-black text-brand w-6 text-right">{p.total_goals}</span>
            </div>
          ))}
        </div>

        {/* Presenze */}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-3 font-bold">👟 Presenze</div>
        <div className="flex flex-col gap-2">
          {byAppearances.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2.5 glass rounded-xl px-3 py-2">
              <span className="text-xs font-black text-white/20 w-4">{i + 1}</span>
              <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
                <PlayerCard player={p} width={28} />
              </div>
              <span className="flex-1 text-sm font-semibold">{p.name}</span>
              <div className="w-20 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(p.total_appearances / maxAppearances) * 100}%` }} />
              </div>
              <span className="text-sm font-black text-accent w-6 text-right">{p.total_appearances}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
