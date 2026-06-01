import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import HomeClient from '@/components/HomeClient'
import PlayerCard from '@/components/PlayerCard'
import PullToRefresh from '@/components/PullToRefresh'
import ScoreCount from '@/components/ScoreCount'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, allMatches, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getAllMatchesWithPlayers(),
    getPlayersWithStats(),
  ])

  const recentMatches = allMatches.filter(m => !m.is_upcoming).slice(0, 3)
  const topScorers = [...players].sort((a, b) => b.total_goals - a.total_goals).slice(0, 5)

  const lastSA = lastMatch?.score_a ?? 0
  const lastSB = lastMatch?.score_b ?? 0
  const lastAWins = lastSA > lastSB
  const lastBWins = lastSB > lastSA
  const lastIsDraw = lastMatch ? lastSA === lastSB : false
  const lastMatchDate = lastMatch
    ? new Date(lastMatch.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const lastMatchWinner = lastMatch
    ? (lastIsDraw ? null : lastAWins ? lastMatch.team_a_name : lastMatch.team_b_name)
    : null

  return (
    <main className="pb-4">
      <PullToRefresh />

      {/* ── HERO: grande score ultima partita ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#1a0533 0%,#0d0d1f 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,0.2) 0%,transparent 70%)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-2">
          <div className="text-[11px] font-black tracking-[3px] uppercase text-white/40">⚽ CALCETTO</div>
          <div className="text-[10px] font-bold text-brand border border-brand/25 bg-brand/10 px-3 py-1 rounded-full">2025 / 26</div>
        </div>

        {/* Score + fan */}
        {lastMatch ? (() => {
          const playersA = lastMatch.match_players.filter(mp => mp.team === 'a').map(mp => mp.player)
          const playersB = lastMatch.match_players.filter(mp => mp.team === 'b').map(mp => mp.player)
          const cardW = 72

          return (
            <Link href={`/matches/${lastMatch.id}`} className="relative z-10 block px-4 pt-4 pb-6 text-center">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">
                Ultima partita · {lastMatchDate}
              </div>

              {/* Score */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <ScoreCount
                  value={lastMatch.score_a ?? 0}
                  className={`text-6xl font-black leading-none ${lastAWins ? 'text-win' : lastIsDraw ? 'text-brand' : 'text-white/20'}`}
                  style={lastAWins || lastIsDraw ? { textShadow: '0 0 30px rgba(74,222,128,0.5)' } : {}}
                />
                <span className="text-2xl text-white/10">–</span>
                <ScoreCount
                  value={lastMatch.score_b ?? 0}
                  className={`text-6xl font-black leading-none ${lastBWins ? 'text-win' : lastIsDraw ? 'text-brand' : 'text-white/20'}`}
                  style={lastBWins || lastIsDraw ? { textShadow: '0 0 30px rgba(74,222,128,0.5)' } : {}}
                />
              </div>

              {/* Cards in linea per team */}
              <div className="grid grid-cols-2 gap-2 px-1">
                {[
                  { players: playersA, wins: lastAWins && !lastIsDraw, name: lastMatch.team_a_name },
                  { players: playersB, wins: lastBWins && !lastIsDraw, name: lastMatch.team_b_name },
                ].map(({ players, wins, name }) => (
                  <div key={name}>
                    <div className={`text-[9px] font-black uppercase tracking-wider mb-2 ${wins ? 'text-win/80' : 'text-white/30'}`}>
                      {wins && '🏆 '}{name}
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {players.map(p => (
                        <div key={p.id} style={{ filter: wins ? 'drop-shadow(0 0 6px rgba(74,222,128,0.35))' : 'none' }}>
                          <PlayerCard player={p} width={cardW} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Team names + winner */}
              <div className="flex justify-between px-2 mb-1">
                <div className={`text-[10px] font-black ${lastAWins && !lastIsDraw ? 'text-win' : 'text-white/30'}`}>{lastMatch.team_a_name}</div>
                <div className={`text-[10px] font-black ${lastBWins && !lastIsDraw ? 'text-win' : 'text-white/30'}`}>{lastMatch.team_b_name}</div>
              </div>
              <div className={`text-sm font-black ${lastIsDraw ? 'text-brand' : 'text-win'}`}>
                {lastIsDraw ? '🤝 Pareggio' : `🏆 ${lastMatchWinner}`}
              </div>
            </Link>
          )
        })() : (
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
