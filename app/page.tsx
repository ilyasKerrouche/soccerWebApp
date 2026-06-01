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

  const topScorers = [...players].sort((a, b) => b.total_goals - a.total_goals).slice(0, 4)

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
  const lastMatchWinner = lastMatch
    ? ((lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0) ? lastMatch.team_a_name : lastMatch.team_b_name)
    : null
  const lastAWins = lastMatch ? (lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0) : false

  return (
    <main className="pb-4">
      {/* HERO */}
      <div className="relative overflow-hidden px-4 pt-10 pb-8" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        {/* Orbs */}
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.45) 0%,transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,.35) 0%,transparent 70%)' }} />

        <div className="relative z-10">
          <div className="text-[11px] font-bold tracking-[3px] uppercase text-white/40 mb-1">⚽ Calcetto</div>
          <div className="text-3xl font-black mb-1">Stagione 2025/26</div>

          {/* Stats pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            {[
              { val: stats.total_matches, lbl: 'partite' },
              { val: stats.total_goals, lbl: 'goal' },
              { val: stats.total_players, lbl: 'giocatori' },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }} className="border border-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-black leading-none">{val}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Next match */}
        {nextMatch && (
          <>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">Prossima partita</div>
            <Link href={`/matches/${nextMatch.id}`}>
              <div className="glass rounded-2xl p-4 mb-4 border-brand/20 hover:border-brand/40 transition-all group">
                <span className="inline-block bg-brand/15 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded-full mb-2">
                  📅 In programma
                </span>
                <div className="text-lg font-black capitalize group-hover:text-brand transition-colors">{nextMatchDate}</div>
              </div>
            </Link>
          </>
        )}

        {/* Last match */}
        {lastMatch && (
          <>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">Ultima partita</div>
            <Link href={`/matches/${lastMatch.id}`}>
              <div className="glass rounded-2xl p-4 mb-4 hover:border-brand/25 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-black tracking-tight leading-none glow-violet">
                      <span className={lastAWins ? 'text-win' : 'text-white/40'}>{lastMatch.score_a}</span>
                      <span className="text-white/15 mx-2 text-2xl">–</span>
                      <span className={!lastAWins ? 'text-win' : 'text-white/40'}>{lastMatch.score_b}</span>
                    </div>
                    <div className="text-[10px] text-white/25 mt-1">{lastMatch.team_a_name} vs {lastMatch.team_b_name}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-white/30 mb-1">{lastMatchDate}</div>
                    <div className="text-sm font-bold text-brand">🏆 {lastMatchWinner}</div>
                  </div>
                  <span className="text-white/20 text-xl group-hover:text-brand transition-colors">›</span>
                </div>
              </div>
            </Link>
          </>
        )}

        {/* Top scorers */}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-3 font-bold">Classifica marcatori</div>
        <div className="flex flex-col gap-2">
          {topScorers.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${
                i === 0
                  ? 'border-brand/25 hover:border-brand/40'
                  : 'border-white/6 hover:border-white/12'
              }`}
              style={{ background: i === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)' }}
            >
              <span className={`text-sm font-black w-5 text-center ${i === 0 ? 'text-yellow-400' : 'text-white/20'}`}>
                {i === 0 ? '🥇' : i + 1}
              </span>
              <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                <PlayerCard player={p} width={36} />
              </div>
              <span className="flex-1 text-sm font-bold">{p.name}</span>
              <div className="text-right">
                <div className={`text-lg font-black leading-none ${i === 0 ? 'text-brand glow-violet' : 'text-white/60'}`}>
                  {p.total_goals}
                </div>
                <div className="text-[9px] text-white/25 uppercase">goal</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
