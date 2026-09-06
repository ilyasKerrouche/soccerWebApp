'use client'
import { useState } from 'react'
import PodiumView from './PodiumView'
import PlayerCard from './PlayerCard'
import RankDelta, { buildRankDeltas, comparePlayers, type SortKey } from './RankDelta'
import type { PlayerWithStats } from '@/lib/types'

export default function PlayersClient({ initialPlayers }: { initialPlayers: PlayerWithStats[] }) {
  const [sort, setSort] = useState<SortKey>('goals')

  const sorted = [...initialPlayers].sort(comparePlayers(sort))
  const deltas = buildRankDeltas(initialPlayers, sort)

  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <main className="pb-4" style={{ background: '#06060f' }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#2d1b69)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.4) 0%,transparent 70%)' }} />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black">👥 Giocatori</h1>
            <div className="text-sm text-white/40 mt-1">Stagione 2025/26</div>
          </div>
          <span className="glass border-brand/30 text-brand text-xs font-bold px-3 py-1.5 rounded-full">
            {initialPlayers.length} players
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Sort pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {([['goals', '⚽ Più goal'], ['appearances', '👟 Più presenze'], ['name', '🔤 A–Z']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] border transition-all font-semibold ${
                sort === key
                  ? 'bg-brand/20 border-brand/40 text-brand'
                  : 'bg-white/5 border-white/8 text-white/40 hover:border-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-4 font-bold">🏆 Classifica</div>
        <PodiumView players={podium} deltas={deltas} />

        {/* Rest */}
        {rest.length > 0 && (
          <>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mt-6 mb-3 font-bold">Altri giocatori</div>
            <div className="flex flex-col gap-2">
              {rest.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 glass rounded-2xl px-3 py-2.5 hover:border-brand/20 transition-all">
                  <span className="text-sm font-black text-white/20 w-5 text-center">{i + 4}</span>
                  <span className="w-7 flex justify-center flex-shrink-0">
                    <RankDelta delta={deltas.get(p.id) ?? null} isNew={sort !== 'name' && (p.prev_appearances ?? 0) === 0} />
                  </span>
                  <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <PlayerCard player={p} width={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{p.name}</div>
                    {p.position && <div className="text-[11px] text-white/30">{p.position}</div>}
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-brand leading-none">{p.total_goals}</div>
                      <div className="text-[9px] uppercase text-white/25">Goal</div>
                    </div>
                    <div className="w-px bg-white/6 self-stretch" />
                    <div className="text-right">
                      <div className="text-base font-black leading-none">{p.total_appearances}</div>
                      <div className="text-[9px] uppercase text-white/25">Pres</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
