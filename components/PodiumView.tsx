'use client'
import PlayerCard from './PlayerCard'
import FormDots from './FormDots'
import CountUp from './CountUp'
import type { PlayerWithStats } from '@/lib/types'

type PodiumSlotProps = {
  player: PlayerWithStats | undefined
  rank: 1 | 2 | 3
}

// La card e' l'unico oggetto in rilievo della schermata: il primo posto si
// distingue per dimensione e luce, non per una scatola in piu'.
const RANK_CONFIG = {
  1: { cardWidth: 104, nameSize: 'text-[13px]', goalSize: 'text-[26px]', dim: 'text-white' },
  2: { cardWidth: 78, nameSize: 'text-[11px]', goalSize: 'text-[19px]', dim: 'text-white/75' },
  3: { cardWidth: 78, nameSize: 'text-[11px]', goalSize: 'text-[19px]', dim: 'text-white/75' },
}

function PodiumSlot({ player, rank }: PodiumSlotProps) {
  const cfg = RANK_CONFIG[rank]
  const first = rank === 1

  return (
    <div className="flex flex-col items-center podium-rise" style={{ flex: first ? '0 0 118px' : '0 0 92px', animationDelay: `${{ 2: 0.05, 1: 0.2, 3: 0.35 }[rank]}s` }}>
      <div className="flex-1" />

      <div
        className="card-shield mb-2.5"
        style={{
          width: cfg.cardWidth,
          // Card ritagliate a scudo come sul campo della home: l'ombra segue la sagoma
          filter: first ? 'drop-shadow(0 14px 22px rgba(0,0,0,0.6))' : 'drop-shadow(0 8px 14px rgba(0,0,0,0.6))',
          opacity: player ? 1 : 0.35,
        }}
      >
        {player ? <PlayerCard player={player} width={cfg.cardWidth} /> : (
          <div style={{ width: cfg.cardWidth, height: cfg.cardWidth * 1.35, background: 'rgba(255,255,255,0.04)' }} />
        )}
      </div>

      <div className={`${cfg.nameSize} font-semibold ${cfg.dim} text-center leading-tight max-w-[104px] truncate`}>
        {player?.name ?? '—'}
      </div>

      <div className={`${cfg.goalSize} font-bold leading-none mt-1 tracking-[-0.02em] ${first ? 'text-brand' : 'text-white/80'}`}>
        <CountUp value={player?.total_goals ?? 0} />
      </div>

      <div className="h-4 flex items-center justify-center mt-1.5">
        {player && <FormDots form={player.record?.form} size={5} />}
      </div>
    </div>
  )
}

export default function PodiumView({ players }: { players: PlayerWithStats[] }) {
  const [first, second, third] = players

  return (
    <div className="relative">
      {/* La luce sotto al primo posto sostituisce il gradino del podio. */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: 8,
          width: 260,
          height: 130,
          background: 'radial-gradient(ellipse at center, rgba(91,156,255,0.14) 0%, transparent 70%)',
        }}
      />
      <div className="relative flex items-end justify-center gap-3" style={{ minHeight: 250 }}>
        <PodiumSlot player={second} rank={2} />
        <PodiumSlot player={first} rank={1} />
        <PodiumSlot player={third} rank={3} />
      </div>
    </div>
  )
}
