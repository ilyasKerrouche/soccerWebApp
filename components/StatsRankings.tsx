'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { PlayerWithStats, PlayerWithGoalkeeperStats } from '@/lib/types'

type Props = {
  players: PlayerWithStats[]
  goalkeepers: PlayerWithGoalkeeperStats[]
}

const CHIPS = [
  { key: 'marcatori', label: '🥇 Marcatori' },
  { key: 'presenze', label: '👟 Presenze' },
  { key: 'portieri', label: '🥅 Portieri' },
] as const

type ChipKey = typeof CHIPS[number]['key']

export default function StatsRankings({ players, goalkeepers }: Props) {
  const [active, setActive] = useState<ChipKey>('marcatori')

  const hasPortieri = goalkeepers.some(g => g.appearances > 0)

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)

  const chipStyle = (key: ChipKey): React.CSSProperties => active === key
    ? { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa' }
    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }

  return (
    <div className="flex flex-col gap-6">
      {/* Chips */}
      <div className="flex gap-2 flex-wrap">
        {CHIPS.filter(c => c.key !== 'portieri' || hasPortieri).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className="rounded-full px-3 py-1 text-[10px] font-bold transition-all"
            style={chipStyle(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Classifica marcatori */}
      {active === 'marcatori' && (
        <section className="animate-section">
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">🥇 Classifica marcatori</div>
          <div className="flex flex-col gap-1.5">
            {byGoals.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-brand/25" style={{
                background: i === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                {p.scoring_streak >= 3 && (
                  <span className="text-sm" title={`${p.scoring_streak} partite consecutive con gol`}>🔥</span>
                )}
                <div className="text-right">
                  <div className={`text-lg font-black leading-none ${i === 0 ? 'text-brand' : 'text-white/50'}`}>{p.total_goals}</div>
                  <div className="text-[9px] text-white/25">
                    {p.total_appearances > 0
                      ? `${(p.total_goals / p.total_appearances).toFixed(1)} media`
                      : 'goal'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Presenze */}
      {active === 'presenze' && (
        <section className="animate-section">
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">👟 Presenze</div>
          <div className="flex flex-col gap-1.5">
            {byAppearances.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-accent/25" style={{
                background: i === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <div className="text-right">
                  <div className={`text-lg font-black leading-none ${i === 0 ? 'text-accent' : 'text-white/50'}`}>{p.total_appearances}</div>
                  <div className="text-[9px] text-white/25">presenze</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Portieri */}
      {active === 'portieri' && hasPortieri && (
        <section className="animate-section">
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">🥅 Classifica portieri</div>
          <div className="flex flex-col gap-1.5">
            {goalkeepers.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-green-400/25" style={{
                background: i === 0 ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <div className="text-right">
                  {p.appearances > 0 ? (
                    <>
                      <div className={`text-lg font-black leading-none ${i === 0 ? 'text-green-400' : 'text-white/50'}`}>
                        {p.avg_conceded}
                      </div>
                      <div className="text-[9px] text-white/25">
                        gol/partita · {p.clean_sheets} CS
                      </div>
                    </>
                  ) : (
                    <div className="text-[9px] text-white/25">nessuna partita</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
