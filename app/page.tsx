import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch, getAllMatchesWithPlayers } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import { getMotmWinnersByMatch, getMotmCounts } from '@/lib/queries/motm'
import HomeClient from '@/components/HomeClient'
import HoloPitch, { type HoloStats } from '@/components/HoloPitch'
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

  // MOTM dell'ultima partita e conteggi per le statistiche delle card: se falliscono, il campo resta senza
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
  const holoStats: Record<string, HoloStats> = {}
  for (const p of players) {
    holoStats[p.id] = {
      goals: p.total_goals,
      appearances: p.total_appearances,
      winRate: p.record && p.record.played > 0 ? p.record.win_rate : null,
      motm: motmCounts[p.id] ?? 0,
      form: p.record?.form ?? [],
    }
  }
  const motmNames = lastMatch
    ? lastMatch.match_players.filter((mp) => motmIds.includes(mp.player_id)).map((mp) => mp.player.name)
    : []

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
      {lastMatch ? (
        <section className="pt-5">
          <Link href={`/matches/${lastMatch.id}`} className="block px-4 text-center">
            <div className="text-[10px] font-bold tracking-[3px] uppercase text-white/45">Ultima partita · {lastMatchDate}</div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-[13px] font-black italic uppercase tracking-wide" style={{ color: '#ff9be4' }}>{lastMatch.team_a_name}</span>
              <ScoreCount
                value={lastMatch.score_a ?? 0}
                className={`text-[40px] font-black italic leading-none ${lastAWins || lastIsDraw ? 'text-white' : 'text-white/35'}`}
              />
              <span className="text-xl font-light" style={{ color: '#c6ff3a' }}>–</span>
              <ScoreCount
                value={lastMatch.score_b ?? 0}
                className={`text-[40px] font-black italic leading-none ${lastBWins || lastIsDraw ? 'text-white' : 'text-white/35'}`}
              />
              <span className="text-[13px] font-black italic uppercase tracking-wide" style={{ color: '#fde047' }}>{lastMatch.team_b_name}</span>
            </div>
            <div className="text-[12px] text-white/50 mt-1">
              {lastIsDraw ? 'Pareggio' : `Vince ${lastMatchWinner}`}
              {motmNames.length > 0 && <span style={{ color: '#fbbf24' }}> · ⭐ MOTM {motmNames.join(' & ')}</span>}
            </div>
          </Link>
          <HoloPitch match={lastMatch} motmIds={motmIds} stats={holoStats} />
        </section>
      ) : (
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
      />

    </main>
  )
}
