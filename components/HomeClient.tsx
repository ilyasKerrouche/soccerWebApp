'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { MatchWithPlayers, PlayerWithStats } from '@/lib/types'
import type { GlobalStats } from '@/lib/queries/stats'
import AddToCalendar from './AddToCalendar'

type Props = {
  lastMatch: MatchWithPlayers | null
  nextMatch: MatchWithPlayers | null
  recentMatches: MatchWithPlayers[]
  stats: GlobalStats
  topScorers: PlayerWithStats[]
}

const TABS = ['Home', 'Partite', 'Stats'] as const
type Tab = typeof TABS[number]

export default function HomeClient({ lastMatch, nextMatch, recentMatches, stats, topScorers }: Props) {
  const [tab, setTab] = useState<Tab>('Home')

  const lastSA = lastMatch?.score_a ?? 0
  const lastSB = lastMatch?.score_b ?? 0
  const lastAWins = lastSA > lastSB
  const lastBWins = lastSB > lastSA
  const lastIsDraw = lastMatch ? lastSA === lastSB : false
  const lastTeamA = lastMatch?.match_players.filter(mp => mp.team === 'a').map(mp => mp.player.name) ?? []
  const lastTeamB = lastMatch?.match_players.filter(mp => mp.team === 'b').map(mp => mp.player.name) ?? []
  const nextTeamA = nextMatch?.match_players.filter(mp => mp.team === 'a').map(mp => mp.player.name) ?? []
  const nextTeamB = nextMatch?.match_players.filter(mp => mp.team === 'b').map(mp => mp.player.name) ?? []

  return (
    <>
      {/* Tab row — bordo inferiore della hero */}
      <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-xs font-bold transition-colors relative"
            style={{ color: tab === t ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}
          >
            {t}
            {tab === t && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Contenuto tab */}
      <div className="px-4 pt-4 pb-4 flex flex-col gap-5">

        {/* ── HOME ── */}
        {tab === 'Home' && (
          <>
            {/* Prossima partita */}
            {nextMatch && (
              <section>
                <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Prossima partita</div>
                <Link href={`/matches/${nextMatch.id}`}>
                  <div className="rounded-2xl p-4 transition-all hover:opacity-90" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-brand bg-brand/15 px-2 py-0.5 rounded-full">📅 Upcoming</span>
                      <AddToCalendar date={nextMatch.played_at} title="Calcetto" />
                    </div>
                    <div className="text-base font-black capitalize mb-3">
                      {new Date(nextMatch.played_at).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    {(nextTeamA.length > 0 || nextTeamB.length > 0) && (
                      <div className="grid grid-cols-2 gap-2">
                        {[{ name: nextMatch.team_a_name, pl: nextTeamA }, { name: nextMatch.team_b_name, pl: nextTeamB }].map(({ name, pl }) =>
                          pl.length > 0 ? (
                            <div key={name} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div className="text-[9px] font-bold text-brand/60 mb-1.5">{name}</div>
                              {pl.map(n => <div key={n} className="text-[10px] text-white/50 truncate">{n}</div>)}
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </section>
            )}

            {/* Team blocks ultima partita */}
            {lastMatch && (lastTeamA.length > 0 || lastTeamB.length > 0) && (
              <section>
                <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Ultima partita — giocatori</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: lastMatch.team_a_name, pl: lastTeamA, wins: lastAWins && !lastIsDraw },
                    { name: lastMatch.team_b_name, pl: lastTeamB, wins: lastBWins && !lastIsDraw },
                  ].map(({ name, pl, wins }) => (
                    <div key={name} className="rounded-2xl p-3" style={{
                      background: wins ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${wins ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                      <div className={`text-[9px] font-black uppercase tracking-wider mb-2 ${wins ? 'text-win/70' : 'text-white/30'}`}>
                        {wins && '🏆 '}{name}
                      </div>
                      {pl.map(n => <div key={n} className={`text-[11px] leading-relaxed truncate ${wins ? 'text-win/60' : 'text-white/40'}`}>{n}</div>)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Classifica marcatori ultima partita */}
            {lastMatch && (() => {
              const scorers = lastMatch.match_players
                .filter(mp => mp.goals > 0)
                .sort((a, b) => b.goals - a.goals)
              if (scorers.length === 0) return null
              return (
                <section>
                  <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Marcatori ultima partita</div>
                  <div className="flex flex-col gap-1.5">
                    {scorers.map((mp, i) => (
                      <div key={mp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{
                        background: i === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                          {i === 0 ? '🥇' : i + 1}
                        </span>
                        <span className="flex-1 text-sm font-bold">{mp.player.name}</span>
                        <span className="text-[9px] text-white/30">{mp.team === 'a' ? lastMatch.team_a_name : lastMatch.team_b_name}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: mp.goals }).map((_, g) => (
                            <span key={g} className="text-[11px]">⚽</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })()}
          </>
        )}

        {/* ── PARTITE ── */}
        {tab === 'Partite' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] tracking-[2px] uppercase text-white/25 font-bold">Ultime partite</div>
              <Link href="/matches" className="text-[10px] text-brand/60 hover:text-brand transition-colors">Tutte →</Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentMatches.length === 0 && (
                <p className="text-white/25 text-sm text-center py-6">Nessuna partita ancora.</p>
              )}
              {recentMatches.map(m => {
                const mSA = m.score_a ?? 0
                const mSB = m.score_b ?? 0
                const aWins = mSA > mSB
                const bWins = mSB > mSA
                const isDraw = mSA === mSB
                const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
                const teamA = m.match_players.filter(mp => mp.team === 'a').map(mp => mp.player.name)
                const teamB = m.match_players.filter(mp => mp.team === 'b').map(mp => mp.player.name)
                return (
                  <Link key={m.id} href={`/matches/${m.id}`}>
                    <div className="rounded-2xl overflow-hidden border border-white/8 hover:border-brand/25 transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                        <span className="text-[9px] text-white/25">{date}</span>
                        <span className={`text-[9px] font-bold ${isDraw ? 'text-brand' : 'text-win'}`}>
                          {isDraw ? '🤝 Pareggio' : `🏆 ${aWins ? m.team_a_name : m.team_b_name}`}
                        </span>
                      </div>
                      <div className="flex">
                        {[
                          { name: m.team_a_name, score: m.score_a, players: teamA, wins: aWins && !isDraw },
                          { name: m.team_b_name, score: m.score_b, players: teamB, wins: bWins && !isDraw },
                        ].map(({ name, score, players, wins }, idx) => (
                          <div key={idx} className="flex-1 p-2.5" style={{
                            background: wins ? 'rgba(74,222,128,0.05)' : 'transparent',
                            borderLeft: idx === 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                          }}>
                            <div className={`text-[9px] font-bold mb-1 truncate ${wins ? 'text-win/60' : 'text-white/25'}`}>{name}</div>
                            <div className={`text-2xl font-black leading-none mb-1.5 ${wins ? 'text-win' : 'text-white/20'}`}>{score}</div>
                            {players.map(n => <div key={n} className={`text-[9px] truncate ${wins ? 'text-win/50' : 'text-white/35'}`}>{n}</div>)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── STATS ── */}
        {tab === 'Stats' && (
          <>
            <section>
              <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Stagione</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: stats.total_matches, lbl: 'Partite giocate' },
                  { val: stats.total_goals, lbl: 'Goal totali' },
                  { val: stats.wins_a, lbl: 'Vittorie Team A' },
                  { val: stats.wins_b, lbl: 'Vittorie Team B' },
                ].map(({ val, lbl }) => (
                  <div key={lbl} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-3xl font-black text-brand leading-none">{val}</div>
                    <div className="text-[9px] text-white/35 mt-1">{lbl}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-[2px] uppercase text-white/25 font-bold">Top marcatori</div>
                <Link href="/stats" className="text-[10px] text-brand/60 hover:text-brand transition-colors">Tutte →</Link>
              </div>
              <div className="flex flex-col gap-1.5">
                {topScorers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{
                    background: i === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                      {i === 0 ? '🥇' : i + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold">{p.name}</span>
                    <div className="text-right">
                      <div className={`text-lg font-black leading-none ${i === 0 ? 'text-brand' : 'text-white/50'}`}>{p.total_goals}</div>
                      <div className="text-[9px] text-white/25">goal</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </>
  )
}
