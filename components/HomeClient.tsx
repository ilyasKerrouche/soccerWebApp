'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { MatchWithPlayers, Player, PlayerHomeStats, PlayerWithStats } from '@/lib/types'
import type { GlobalStats } from '@/lib/queries/stats'
import { sortScorers, type HomeViewer } from '@/lib/homeText'
import { getHomeViewer } from '@/app/homeActions'
import NextMatchCard from './NextMatchCard'
import { C, Card, Section } from './ui'
import VoteBox from './home/VoteBox'
import MySummary from './home/MySummary'

type Props = {
  lastMatch: MatchWithPlayers | null
  nextMatch: MatchWithPlayers | null
  recentMatches: MatchWithPlayers[]
  stats: GlobalStats
  topScorers: PlayerWithStats[]
  players: Player[]
  playerStats: Record<string, PlayerHomeStats>
  voteOpen: { matchId: string; closesAt: string } | null
}

const TABS = ['Riepilogo', 'Risultati', 'Classifica'] as const
type Tab = typeof TABS[number]

export default function HomeClient({ lastMatch, nextMatch, recentMatches, stats, topScorers, players, playerStats, voteOpen }: Props) {
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

  const me = viewer?.kind === 'player' && viewer.playerId ? players.find((p) => p.id === viewer.playerId) : undefined
  const myStats = me ? playerStats[me.id] : undefined
  const scorers = sortScorers(lastMatch?.match_players.filter((mp) => mp.goals > 0) ?? [], (mp) => ({ name: mp.player.name, goals: mp.goals }))

  return (
    <>
      {voteOpen && lastMatch && (
        <VoteBox matchId={voteOpen.matchId} closesAt={voteOpen.closesAt} teamA={lastMatch.team_a_name} teamB={lastMatch.team_b_name} viewer={viewer} />
      )}

      {/* Selettore a pillola */}
      <div className="flex mx-4 mt-4 rounded-xl p-[3px]" style={{ background: C.surf, border: `1px solid ${C.line}` }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-[7px] rounded-[9px] text-[13px] transition-colors"
            style={tab === t ? { background: C.surf2, color: '#fff', fontWeight: 600 } : { color: C.muted }}
          >
            {t}
          </button>
        ))}
      </div>

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
                      <span className="flex-1 truncate">{mp.player.name}</span>
                      <span className="text-[11px]" style={{ color: C.muted }}>{mp.team === 'a' ? lastMatch.team_a_name : lastMatch.team_b_name}</span>
                      <span className="font-semibold tabular-nums w-5 text-right">{mp.goals}</span>
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

        {tab === 'Risultati' && (
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
                      <span className="font-semibold tabular-nums">{a} – {b}</span>
                    </Link>
                  )
                })}
              </Card>
            )}
          </Section>
        )}

        {tab === 'Classifica' && (
          <>
            <Section title="Stagione">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: stats.total_matches, l: 'Partite' },
                  { v: stats.total_goals, l: 'Gol' },
                  { v: stats.wins_a, l: `Vittorie ${lastMatch?.team_a_name ?? 'squadra A'}` },
                  { v: stats.wins_b, l: `Vittorie ${lastMatch?.team_b_name ?? 'squadra B'}` },
                ].map(({ v, l }) => (
                  <Card key={l} className="p-3">
                    <div className="text-[22px] font-bold tabular-nums leading-none">{v}</div>
                    <div className="text-[11px] mt-1.5 truncate" style={{ color: C.muted }}>{l}</div>
                  </Card>
                ))}
              </div>
            </Section>

            <Section title="Top marcatori" link={{ href: '/stats', label: 'Classifiche' }}>
              {topScorers.length === 0 ? (
                <p className="text-[13px] text-center py-6" style={{ color: C.muted }}>Ancora nessun gol.</p>
              ) : (
              <Card>
                {topScorers.map((p, i) => (
                  <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3.5 py-3 text-[14px]"
                    style={i > 0 ? { borderTop: `1px solid ${C.line}` } : undefined}>
                    <span className="w-4 text-[12px] tabular-nums" style={{ color: C.muted }}>{i + 1}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="font-semibold tabular-nums">{p.total_goals}</span>
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
