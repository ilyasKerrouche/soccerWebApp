import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import { getVotesForMatch } from '@/lib/queries/availability'
import HomeClient from '@/components/HomeClient'
import PlayerCard from '@/components/PlayerCard'
import PullToRefresh from '@/components/PullToRefresh'
import ScoreCount from '@/components/ScoreCount'
import PageHeader from '@/components/PageHeader'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, allMatches, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getAllMatchesWithPlayers(),
    getPlayersWithStats(),
  ])

  const initialVotes = nextMatch ? await getVotesForMatch(nextMatch.id) : []

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
    <main className="pb-6">
      <PullToRefresh />

      <div className="px-4">
        <PageHeader
          eyebrow="Stagione 2025/26"
          title="Calcetto"
          aside={<span className="text-[13px] text-white/30">{stats.total_matches} partite</span>}
        />
      </div>

      {/* Il risultato dell'ultima partita e' la cosa che si viene a vedere. */}
      {lastMatch ? (() => {
        const playersA = lastMatch.match_players.filter(mp => mp.team === 'a').map(mp => mp.player)
        const playersB = lastMatch.match_players.filter(mp => mp.team === 'b').map(mp => mp.player)

        return (
          <Link href={`/matches/${lastMatch.id}`} className="block px-4 pt-6 pb-5">
            <div className="text-[13px] text-white/35 mb-3">Ultima partita · {lastMatchDate}</div>

            <div className="flex items-center gap-4 mb-6">
              <ScoreCount
                value={lastMatch.score_a ?? 0}
                className={`text-[56px] font-bold leading-none tracking-[-0.03em] ${lastAWins ? 'text-win' : lastIsDraw ? 'text-white/80' : 'text-white/25'}`}
              />
              <span className="text-2xl text-white/12">–</span>
              <ScoreCount
                value={lastMatch.score_b ?? 0}
                className={`text-[56px] font-bold leading-none tracking-[-0.03em] ${lastBWins ? 'text-win' : lastIsDraw ? 'text-white/80' : 'text-white/25'}`}
              />
              <span className="flex-1 text-right text-[13px] font-medium text-white/45">
                {lastIsDraw ? 'Pareggio' : `Vince ${lastMatchWinner}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { players: playersA, wins: lastAWins && !lastIsDraw, name: lastMatch.team_a_name },
                { players: playersB, wins: lastBWins && !lastIsDraw, name: lastMatch.team_b_name },
              ].map(({ players, wins, name }) => (
                <div key={name}>
                  <div className={`text-[11px] font-medium mb-2 ${wins ? 'text-win' : 'text-white/35'}`}>{name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {players.map(p => (
                      <PlayerCard key={p.id} player={p} width={54} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        )
      })() : (
        <div className="px-4 py-10 text-center text-white/30 text-[13px]">
          Nessuna partita registrata.
        </div>
      )}

      {/* Tab + contenuto (client) */}
      <HomeClient
        lastMatch={lastMatch}
        nextMatch={nextMatch}
        recentMatches={recentMatches}
        stats={stats}
        topScorers={topScorers}
        initialVotes={initialVotes}
      />

    </main>
  )
}
