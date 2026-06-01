import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import PlayerCard from '@/components/PlayerCard'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getPlayersWithStats(),
  ])

  const topScorers = [...players]
    .sort((a, b) => b.total_goals - a.total_goals)
    .slice(0, 4)

  const lastMatchDate = lastMatch
    ? new Date(lastMatch.played_at).toLocaleDateString('it-IT', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const nextMatchDate = nextMatch
    ? new Date(nextMatch.played_at).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const lastMatchWinner =
    lastMatch
      ? (lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0)
        ? lastMatch.team_a_name
        : lastMatch.team_b_name
      : null

  return (
    <main className="px-4 pb-4">
      {/* Header */}
      <div className="pt-7 pb-4">
        <div className="text-2xl font-black">
          ⚽ <span className="text-brand">Calcetto</span>
        </div>
        <div className="text-xs text-white/30 mt-1">Stagione 2025/26</div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { val: stats.total_matches, lbl: 'Partite' },
          { val: stats.total_goals, lbl: 'Goal', green: true },
          { val: stats.total_players, lbl: 'Giocatori' },
        ].map(({ val, lbl, green }) => (
          <div key={lbl} className="bg-white/5 border border-white/7 rounded-xl p-3 text-center">
            <div className={`text-3xl font-black leading-none ${green ? 'text-brand' : ''}`}>
              {val}
            </div>
            <div className="text-[10px] text-white/35 mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Next match */}
      {nextMatch && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">
            Prossima partita
          </div>
          <Link href={`/matches/${nextMatch.id}`}>
            <div
              className="relative rounded-2xl overflow-hidden mb-4 p-4"
              style={{ background: 'linear-gradient(135deg,#14532d,#166534)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(90deg,transparent,transparent 8%,rgba(0,0,0,.06) 8%,rgba(0,0,0,.06) 16%)',
                }}
              />
              <div className="relative">
                <span className="inline-block bg-white/15 text-white/80 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full mb-2">
                  📅 In programma
                </span>
                <div className="text-lg font-black capitalize">{nextMatchDate}</div>
              </div>
            </div>
          </Link>
        </>
      )}

      {/* Last match */}
      {lastMatch && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">
            Ultima partita
          </div>
          <Link href={`/matches/${lastMatch.id}`}>
            <div className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-2xl p-4 mb-4 hover:border-brand/25 transition-colors">
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-black tracking-tight">
                  <span
                    className={
                      (lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0)
                        ? 'text-brand'
                        : 'text-white/60'
                    }
                  >
                    {lastMatch.score_a}
                  </span>
                  <span className="text-white/20 mx-1">–</span>
                  <span
                    className={
                      (lastMatch.score_b ?? 0) > (lastMatch.score_a ?? 0)
                        ? 'text-brand'
                        : 'text-white/60'
                    }
                  >
                    {lastMatch.score_b}
                  </span>
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">
                  {lastMatch.team_a_name} vs {lastMatch.team_b_name}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-white/35 mb-1">{lastMatchDate}</div>
                <div className="text-sm font-bold text-brand">🏆 {lastMatchWinner}</div>
              </div>
              <span className="text-white/20 text-lg">›</span>
            </div>
          </Link>
        </>
      )}

      {/* Top scorers */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">
        Classifica marcatori
      </div>
      <div className="flex flex-col gap-1.5">
        {topScorers.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
              i === 0 ? 'bg-brand/8 border-brand/15' : 'bg-white/3 border-white/5'
            }`}
          >
            <span
              className={`text-sm font-black w-5 text-center ${
                i === 0 ? 'text-yellow-400' : 'text-white/25'
              }`}
            >
              {i === 0 ? '🥇' : i + 1}
            </span>
            <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={32} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <span className="text-xs text-white/40">
              <strong className="text-brand font-bold">{p.total_goals}</strong> ⚽ ·{' '}
              {p.total_appearances} pres
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
