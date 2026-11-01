import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import { getMotmWinnersByMatch, getMotmCounts } from '@/lib/queries/motm'
import { motmStatus } from '@/lib/motm'
import { buildLedText, formatRomeDay, toPlayerHomeStats, topScorers as topScorersOf } from '@/lib/homeText'
import HomeClient from '@/components/HomeClient'
import StadiumPitch from '@/components/home/StadiumPitch'
import PullToRefresh from '@/components/PullToRefresh'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, allMatches, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getAllMatchesWithPlayers(),
    getPlayersWithStats(),
  ])

  // MOTM (solo a voto chiuso) e conteggi per le card: se falliscono, il campo resta senza
  let motmIds: string[] = []
  let motmCounts: Record<string, number> = {}
  if (lastMatch) {
    try {
      const [winners, counts] = await Promise.all([getMotmWinnersByMatch([lastMatch.id]), getMotmCounts()])
      motmIds = winners[lastMatch.id] ?? []
      motmCounts = counts
    } catch (e) {
      console.error('MOTM home failed', e)
    }
  }
  const playerStats = toPlayerHomeStats(players, motmCounts)

  const recentMatches = allMatches.filter((m) => !m.is_upcoming).slice(0, 3)
  const topScorers = topScorersOf(players, 5)

  const voteOpen = lastMatch?.motm_closes_at && motmStatus(lastMatch.motm_closes_at, new Date()) === 'open'
    ? { matchId: lastMatch.id, closesAt: lastMatch.motm_closes_at }
    : null

  const scoreA = lastMatch?.score_a ?? 0
  const scoreB = lastMatch?.score_b ?? 0
  const motmNames = lastMatch ? lastMatch.match_players.filter((mp) => motmIds.includes(mp.player_id)).map((mp) => mp.player.name) : []
  const ledText = lastMatch
    ? buildLedText({
        teamA: lastMatch.team_a_name, teamB: lastMatch.team_b_name, scoreA, scoreB, motmNames,
        scorers: lastMatch.match_players.filter((mp) => mp.goals > 0).map((mp) => ({ name: mp.player.name, goals: mp.goals })),
        next: nextMatch ? { playedAt: nextMatch.played_at, time: nextMatch.match_time } : null,
      })
    : ''

  return (
    <main className="pb-6" style={{ background: '#0d1420', color: '#e8ecf2' }}>
      <PullToRefresh />

      {/* L'ultima partita e' la cosa che si viene a vedere */}
      {lastMatch ? (
        <section className="pt-4">
          <Link href={`/matches/${lastMatch.id}`} className="block px-4 text-center">
            <div className="text-[11px] capitalize" style={{ color: '#8a96a8' }}>Ultima partita · {formatRomeDay(lastMatch.played_at)}</div>
            <div className="flex items-baseline justify-center gap-3.5 mt-1">
              <span className="w-24 text-right text-[14px] font-semibold truncate" style={{ color: scoreA >= scoreB ? '#ffffff' : '#8a96a8' }}>{lastMatch.team_a_name}</span>
              <span className="text-[36px] font-bold tabular-nums tracking-tight leading-none">{scoreA} – {scoreB}</span>
              <span className="w-24 text-left text-[14px] font-semibold truncate" style={{ color: scoreB >= scoreA ? '#ffffff' : '#8a96a8' }}>{lastMatch.team_b_name}</span>
            </div>
            <div className="text-[12px] mt-1" style={{ color: '#8a96a8' }}>
              {scoreA === scoreB ? 'Pareggio' : `Vince ${scoreA > scoreB ? lastMatch.team_a_name : lastMatch.team_b_name}`}
              {motmNames.length > 0 && <span style={{ color: '#f5c451' }}> · ★ MOTM {motmNames.join(' & ')}</span>}
            </div>
          </Link>
          <StadiumPitch match={lastMatch} motmIds={motmIds} stats={playerStats} ledText={ledText} />
        </section>
      ) : (
        <div className="px-4 py-10 text-center text-[13px]" style={{ color: '#8a96a8' }}>
          Nessuna partita registrata.
        </div>
      )}

      <HomeClient
        lastMatch={lastMatch}
        nextMatch={nextMatch}
        recentMatches={recentMatches}
        stats={stats}
        topScorers={topScorers}
        players={players}
        playerStats={playerStats}
        voteOpen={voteOpen}
      />
    </main>
  )
}
