// components/PlayersClient.tsx
'use client'
import { useState } from 'react'
import PodiumView from './PodiumView'
import PlayerCard from './PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

export default function PlayersClient({
  initialPlayers,
}: {
  initialPlayers: PlayerWithStats[]
}) {
  const [sort, setSort] = useState<'goals' | 'appearances' | 'name'>('goals')

  const sorted = [...initialPlayers].sort((a, b) => {
    if (sort === 'goals') return b.total_goals - a.total_goals
    if (sort === 'appearances') return b.total_appearances - a.total_appearances
    return a.name.localeCompare(b.name)
  })

  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <main style={{ background: '#0d0d1a' }} className="min-h-screen px-4 pb-4">
      <div className="pt-7 pb-3 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black">👥 Giocatori</h1>
          <div className="text-xs text-white/35 mt-1">Stagione 2025/26</div>
        </div>
        <span className="bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1 rounded-full">
          {initialPlayers.length} players
        </span>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(
          [
            ['goals', '⚽ Più goal'],
            ['appearances', '👟 Più presenze'],
            ['name', '🔤 A–Z'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] border transition-all ${
              sort === key
                ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                : 'bg-white/6 border-white/10 text-white/55'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-3 font-bold">
        🏆 Classifica
      </div>
      <PodiumView players={podium} />

      {/* Rest list */}
      {rest.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mt-5 mb-2 font-bold">
            Altri giocatori
          </div>
          <div className="flex flex-col gap-2">
            {rest.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-3 py-2.5 hover:border-accent/25 transition-colors"
              >
                <span className="text-sm font-black text-white/25 w-5 text-center">
                  {i + 4}
                </span>
                <div className="w-9 h-12 rounded overflow-hidden flex-shrink-0">
                  <PlayerCard player={p} width={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  {p.position && (
                    <div className="text-[11px] text-white/35">{p.position}</div>
                  )}
                </div>
                <div className="flex gap-3.5 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-accent leading-none">
                      {p.total_goals}
                    </div>
                    <div className="text-[9px] uppercase text-white/30">Goal</div>
                  </div>
                  <div className="w-px bg-white/7 self-stretch" />
                  <div className="text-right">
                    <div className="text-base font-black leading-none">{p.total_appearances}</div>
                    <div className="text-[9px] uppercase text-white/30">Pres</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
