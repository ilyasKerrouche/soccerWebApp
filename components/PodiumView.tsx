// components/PodiumView.tsx
'use client'
import PlayerCard from './PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

export default function PodiumView({ players }: { players: PlayerWithStats[] }) {
  const [first, second, third] = players
  return (
    <div>
      <div className="flex items-end justify-center gap-2.5 mb-2.5">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-base">🥈</span>
          {second && (
            <PlayerCard player={second} width={78} className="opacity-90 shadow-xl" />
          )}
          <div className="text-[11px] font-bold text-white/80">{second?.name}</div>
          <span className="bg-accent/20 border border-accent/35 text-accent text-xs font-black px-2.5 py-0.5 rounded-full">
            {second?.total_goals} ⚽
          </span>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xl">🥇</span>
          {first && (
            <PlayerCard player={first} width={100} className="shadow-2xl ring-2 ring-accent/40" />
          )}
          <div className="text-[13px] font-bold text-white">{first?.name}</div>
          <span className="bg-accent/30 border border-accent/40 text-accent text-[13px] font-black px-3 py-0.5 rounded-full">
            {first?.total_goals} ⚽
          </span>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-base">🥉</span>
          {third && (
            <PlayerCard player={third} width={78} className="opacity-90 shadow-xl" />
          )}
          <div className="text-[11px] font-bold text-white/80">{third?.name}</div>
          <span className="bg-accent/20 border border-accent/35 text-accent text-xs font-black px-2.5 py-0.5 rounded-full">
            {third?.total_goals} ⚽
          </span>
        </div>
      </div>
      {/* Podium bases */}
      <div className="flex items-end justify-center gap-2.5 px-2">
        <div className="flex-1 h-6 rounded-t-lg bg-white/8 flex items-center justify-center text-lg font-black text-white/40">
          2
        </div>
        <div
          className="flex-1 h-9 rounded-t-lg flex items-center justify-center text-xl font-black text-accent"
          style={{ background: 'linear-gradient(180deg,rgba(139,92,246,.4),rgba(139,92,246,.2))' }}
        >
          1
        </div>
        <div className="flex-1 h-5 rounded-t-lg bg-white/5 flex items-center justify-center text-base font-black text-white/30">
          3
        </div>
      </div>
    </div>
  )
}
