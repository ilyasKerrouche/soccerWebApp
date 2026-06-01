'use client'
import PlayerCard from './PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

type PodiumSlotProps = {
  player: PlayerWithStats | undefined
  rank: 1 | 2 | 3
}

const RANK_CONFIG = {
  1: { cardWidth: 96, medal: '🥇', baseH: 'h-12', nameSize: 'text-xs', goalColor: 'text-brand', goalBg: 'rgba(167,139,250,0.15)', goalBorder: 'rgba(167,139,250,0.3)', ring: '2px solid rgba(167,139,250,0.5)' },
  2: { cardWidth: 76, medal: '🥈', baseH: 'h-8',  nameSize: 'text-[10px]', goalColor: 'text-white/60', goalBg: 'rgba(255,255,255,0.06)', goalBorder: 'rgba(255,255,255,0.1)', ring: 'none' },
  3: { cardWidth: 68, medal: '🥉', baseH: 'h-6',  nameSize: 'text-[10px]', goalColor: 'text-white/50', goalBg: 'rgba(255,255,255,0.06)', goalBorder: 'rgba(255,255,255,0.1)', ring: 'none' },
}

function PodiumSlot({ player, rank }: PodiumSlotProps) {
  const cfg = RANK_CONFIG[rank]
  return (
    <div className="flex flex-col items-center" style={{ flex: rank === 1 ? '0 0 120px' : '0 0 96px' }}>
      {/* Spazio vuoto sopra per allineare in basso le card di rank diverso */}
      <div className="flex-1" />

      <div className="text-base mb-1">{cfg.medal}</div>

      <div
        className="rounded-xl overflow-hidden mb-2"
        style={{ width: cfg.cardWidth, boxShadow: rank === 1 ? '0 0 24px rgba(167,139,250,0.3)' : 'none', outline: cfg.ring }}
      >
        {player ? <PlayerCard player={player} width={cfg.cardWidth} /> : (
          <div style={{ width: cfg.cardWidth, height: cfg.cardWidth * 1.35, background: 'rgba(255,255,255,0.04)' }} />
        )}
      </div>

      <div className={`${cfg.nameSize} font-bold text-white/80 mb-1.5 text-center leading-tight max-w-[90px] truncate`}>
        {player?.name ?? '—'}
      </div>

      <div className="text-[10px] font-black px-2.5 py-0.5 rounded-full mb-3" style={{ background: cfg.goalBg, border: `1px solid ${cfg.goalBorder}`, color: rank === 1 ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}>
        {player?.total_goals ?? 0} ⚽
      </div>

      {/* Base podio */}
      <div className={`w-full ${cfg.baseH} rounded-t-lg flex items-center justify-center font-black`} style={{
        background: rank === 1 ? 'linear-gradient(180deg,rgba(139,92,246,.5),rgba(139,92,246,.2))' : 'rgba(255,255,255,0.06)',
        color: rank === 1 ? '#a78bfa' : 'rgba(255,255,255,0.3)',
        fontSize: rank === 1 ? '18px' : '14px',
      }}>
        {rank}
      </div>
    </div>
  )
}

export default function PodiumView({ players }: { players: PlayerWithStats[] }) {
  const [first, second, third] = players
  return (
    <div className="flex items-end justify-center gap-1" style={{ minHeight: 280 }}>
      <PodiumSlot player={second} rank={2} />
      <PodiumSlot player={first}  rank={1} />
      <PodiumSlot player={third}  rank={3} />
    </div>
  )
}
