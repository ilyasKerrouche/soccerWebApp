import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import HomeClient from '@/components/HomeClient'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, allMatches, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getAllMatchesWithPlayers(),
    getPlayersWithStats(),
  ])

  const recentMatches = allMatches.filter(m => !m.is_upcoming).slice(0, 5)
  const topScorers = [...players].sort((a, b) => b.total_goals - a.total_goals).slice(0, 5)

  const lastAWins = lastMatch ? (lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0) : false
  const lastMatchDate = lastMatch
    ? new Date(lastMatch.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const lastMatchWinner = lastMatch ? (lastAWins ? lastMatch.team_a_name : lastMatch.team_b_name) : null

  return (
    <main className="pb-4">

      {/* ── HERO: grande score ultima partita ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#1a0533 0%,#0d0d1f 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,0.2) 0%,transparent 70%)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-2">
          <div className="text-[11px] font-black tracking-[3px] uppercase text-white/40">⚽ CALCETTO</div>
          <div className="text-[10px] font-bold text-brand border border-brand/25 bg-brand/10 px-3 py-1 rounded-full">2025 / 26</div>
        </div>

        {/* Score */}
        {lastMatch ? (
          <Link href={`/matches/${lastMatch.id}`} className="relative z-10 block px-4 py-6 text-center">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">
              Ultima partita · {lastMatchDate}
            </div>
            <div className="flex justify-between px-6 mb-2">
              <div className={`text-xs font-black truncate max-w-[100px] ${lastAWins ? 'text-win' : 'text-white/30'}`}>{lastMatch.team_a_name}</div>
              <div className={`text-xs font-black truncate max-w-[100px] ${!lastAWins ? 'text-win' : 'text-white/30'}`}>{lastMatch.team_b_name}</div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <span className={`text-7xl font-black leading-none ${lastAWins ? 'text-win' : 'text-white/20'}`}
                style={lastAWins ? { textShadow: '0 0 40px rgba(74,222,128,0.4)' } : {}}>
                {lastMatch.score_a}
              </span>
              <span className="text-3xl text-white/10 font-light">–</span>
              <span className={`text-7xl font-black leading-none ${!lastAWins ? 'text-win' : 'text-white/20'}`}
                style={!lastAWins ? { textShadow: '0 0 40px rgba(74,222,128,0.4)' } : {}}>
                {lastMatch.score_b}
              </span>
            </div>
            <div className="mt-4 text-sm font-black text-win">🏆 {lastMatchWinner}</div>
          </Link>
        ) : (
          <div className="relative z-10 px-4 py-10 text-center text-white/25 text-sm">Nessuna partita ancora</div>
        )}
      </div>

      {/* Tab + contenuto (client) */}
      <HomeClient
        lastMatch={lastMatch}
        nextMatch={nextMatch}
        recentMatches={recentMatches}
        stats={stats}
        topScorers={topScorers}
      />

    </main>
  )
}
