'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { MatchWithPlayers, PlayerHomeStats, PlayerWithStats } from '@/lib/types'
import type { GlobalStats } from '@/lib/queries/stats'
import { sortScorers, type HomeViewer } from '@/lib/homeText'
import { getHomeViewer } from '@/app/homeActions'
import NextMatchCard from './NextMatchCard'
import PillTabs from './PillTabs'
import { C, Card, Section } from './ui'
import VoteBox from './home/VoteBox'
import MySummary from './home/MySummary'
import StreakFlame from './StreakFlame'

type Props = {
  lastMatch: MatchWithPlayers | null
  nextMatch: MatchWithPlayers | null
  recentMatches: MatchWithPlayers[]
  /** null se i numeri della stagione non sono arrivati: la sezione Stagione non si mostra. */
  stats: GlobalStats | null
  topScorers: PlayerWithStats[]
  players: PlayerWithStats[]
  playerStats: Record<string, PlayerHomeStats>
  voteOpen: { matchId: string; closesAt: string } | null
  /** Stagione in corso: Risultati e Classifica parlano di questa. */
  season: number
  /** Stagione in corso ancora senza partite: Risultati e Classifica mostrano solo questo testo. */
  emptyText: string | null
}

const TABS = ['Riepilogo', 'Risultati', 'Classifica'] as const
type Tab = typeof TABS[number]

export default function HomeClient({ lastMatch, nextMatch, recentMatches, stats, topScorers, players, playerStats, voteOpen, season, emptyText }: Props) {
  const [tab, setTab] = useState<Tab>('Riepilogo')
  // undefined finche' non sappiamo chi guarda: la pagina e' in cache uguale per tutti
  const [viewer, setViewer] = useState<HomeViewer | undefined>(undefined)

  const viewerMatchId = voteOpen?.matchId ?? lastMatch?.id ?? null
  useEffect(() => {
    let cancelled = false
    // Se non sappiamo chi guarda (errore) si resta su undefined: nessun pulsante, mai un "Accedi" sbagliato
    getHomeViewer(viewerMatchId)
      .then((v) => { if (!cancelled && v) setViewer(v) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [viewerMatchId])

  const streakOf = (id: string) => players.find((p) => p.id === id)?.scoring_streak ?? 0
  const me = viewer?.kind === 'player' && viewer.playerId ? players.find((p) => p.id === viewer.playerId) : undefined
  const myStats = me ? playerStats[me.id] : undefined
  const scorers = sortScorers(lastMatch?.match_players.filter((mp) => mp.goals > 0) ?? [], (mp) => ({ name: mp.player.name, goals: mp.goals }))

  return (
    <>
      {voteOpen && lastMatch && (
        <VoteBox matchId={voteOpen.matchId} closesAt={voteOpen.closesAt} teamA={lastMatch.team_a_name} teamB={lastMatch.team_b_name} viewer={viewer} />
      )}

      {/* Selettore a pillola */}
      <PillTabs className="mx-4 mt-4" tabs={TABS.map((t) => ({ key: t, label: t }))} active={tab} onChange={setTab} />

      <div key={tab} className="px-4 pt-5 pb-4 flex flex-col gap-6 animate-section">
        {tab === 'Riepilogo' && (
          <>
            {me && myStats && <MySummary player={me} stats={myStats} />}

            {nextMatch && (
              <Section title="Prossima partita">
                <NextMatchCard match={nextMatch} />
              </Section>
            )}

            {scorers.length > 0 && lastMatch && (
              <Section title="Marcatori ultima partita">
                <Card>
                  {scorers.map((mp, i) => (
                    <Link key={mp.id} href={`/players/${mp.player_id}`} className="flex items-center gap-3 px-3.5 py-3 text-[14px]"
                      style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                      <span className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="truncate">{mp.player.name}</span>
                        <StreakFlame streak={streakOf(mp.player_id)} withCount />
                      </span>
                      <span className="text-[11px]" style={{ color: C.muted }}>{mp.team === 'a' ? lastMatch.team_a_name : lastMatch.team_b_name}</span>
                      <span className="numeric text-[16px] font-semibold w-5 text-right">{mp.goals}</span>
                    </Link>
                  ))}
                </Card>
              </Section>
            )}

            {!me && !nextMatch && scorers.length === 0 && (
              <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Niente da mostrare per ora.</p>
            )}
          </>
        )}

        {(tab === 'Risultati' || tab === 'Classifica') && emptyText && (
          <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>{emptyText}</p>
        )}

        {tab === 'Risultati' && !emptyText && (
          <Section title="Ultime partite" link={{ href: '/matches', label: 'Tutte' }}>
            {recentMatches.length === 0 ? (
              <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Nessuna partita ancora.</p>
            ) : (
              <Card>
                {recentMatches.map((m, i) => {
                  const a = m.score_a ?? 0
                  const b = m.score_b ?? 0
                  return (
                    <Link key={m.id} href={`/matches/${m.id}`} className="flex items-center px-3.5 py-3 text-[14px]"
                      style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                      <span className="w-14 text-[11px]" style={{ color: C.muted }}>
                        {new Date(`${m.played_at}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' })}
                      </span>
                      <span className="flex-1 truncate">
                        <span style={{ color: a >= b ? '#fff' : C.muted }}>{m.team_a_name}</span>
                        <span style={{ color: C.muted }}> · </span>
                        <span style={{ color: b >= a ? '#fff' : C.muted }}>{m.team_b_name}</span>
                      </span>
                      <span className="numeric text-[16px] font-semibold">{a} – {b}</span>
                    </Link>
                  )
                })}
              </Card>
            )}
          </Section>
        )}

        {tab === 'Classifica' && !emptyText && (
          <>
            {stats && <Section title={`Stagione ${season}`}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: stats.total_matches, l: 'Partite' },
                  { v: stats.total_goals, l: 'Gol' },
                  { v: stats.wins_a, l: `Vittorie ${lastMatch?.team_a_name ?? 'squadra A'}` },
                  { v: stats.wins_b, l: `Vittorie ${lastMatch?.team_b_name ?? 'squadra B'}` },
                ].map(({ v, l }) => (
                  <Card key={l} className="p-3">
                    <div className="numeric text-[26px] font-bold leading-none">{v}</div>
                    <div className="text-[11px] mt-1.5 truncate" style={{ color: C.muted }}>{l}</div>
                  </Card>
                ))}
              </div>
            </Section>}

            <Section title="Top marcatori" link={{ href: '/stats', label: 'Classifiche' }}>
              {topScorers.length === 0 ? (
                <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Ancora nessun gol.</p>
              ) : (
              <Card>
                {topScorers.map((p, i) => (
                  <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3.5 py-3 text-[14px]"
                    style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                    <span className="numeric w-4 text-[13px]" style={{ color: C.muted }}>{i + 1}</span>
                    <span className="flex-1 min-w-0 flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      <StreakFlame streak={p.scoring_streak} withCount />
                    </span>
                    <span className="numeric text-[16px] font-semibold">{p.total_goals}</span>
                  </Link>
                ))}
              </Card>
              )}
            </Section>
          </>
        )}
      </div>
    </>
  )
}
