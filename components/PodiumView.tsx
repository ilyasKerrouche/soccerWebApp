'use client'
import PlayerCard from './PlayerCard'
import RankDelta from './RankDelta'
import FormDots from './FormDots'
import type { PlayerWithStats } from '@/lib/types'

type PodiumSlotProps = {
  player: PlayerWithStats | undefined
  rank: 1 | 2 | 3
  delta: number | null
}

// La card e' l'unico oggetto in rilievo della schermata: il primo posto si
// distingue per dimensione e luce, non per una scatola in piu'.
const RANK_CONFIG = {
  1: { cardWidth: 104, nameSize: 'text-[13px]', goalSize: 'text-[26px]', dim: 'text-white' },
  2: { cardWidth: 78, nameSize: 'text-[11px]', goalSize: 'text-[19px]', dim: 'text-white/75' },
  3: { cardWidth: 78, nameSize: 'text-[11px]', goalSize: 'text-[19px]', dim: 'text-white/75' },
}

function PodiumSlot({ player, rank, delta }: PodiumSlotProps) {
  const cfg = RANK_CONFIG[rank]
  const first = rank === 1

  return (
    <div className="flex flex-col items-center" style={{ flex: first ? '0 0 118px' : '0 0 92px' }}>
      <div className="flex-1" />

      <div
        className="overflow-hidden mb-2.5"
        style={{
          width: cfg.cardWidth,
          borderRadius: 10,
          boxShadow: first
            ? '0 0 0 1px rgba(167,139,250,0.45), 0 12px 36px -8px rgba(167,139,250,0.45)'
            : '0 8px 20px -10px rgba(0,0,0,0.9)',
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

      <div className={`${cfg.goalSize} font-bold leading-none mt-1 tracking-[-0.02em] ${first ? 'text-brand' : 'text-white/60'}`}>
        {player?.total_goals ?? 0}
      </div>

      <div className="h-4 flex items-center justify-center gap-1.5 mt-1.5">
        {player && <FormDots form={player.record?.form} size={5} />}
        {player && <RankDelta delta={delta} isNew={(player.record?.played ?? 0) === 0} hideEmpty />}
      </div>
    </div>
  )
}

export default function PodiumView({
  players,
  deltas,
}: {
  players: PlayerWithStats[]
  deltas?: Map<string, number | null>
}) {
  const [first, second, third] = players
  const deltaOf = (p: PlayerWithStats | undefined) => (p ? deltas?.get(p.id) ?? null : null)

  return (
    <div className="relative">
      {/* La luce sotto al primo posto sostituisce il gradino del podio. */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: 8,
          width: 260,
          height: 130,
          background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.16) 0%, transparent 70%)',
        }}
      />
      <div className="relative flex items-end justify-center gap-3" style={{ minHeight: 250 }}>
        <PodiumSlot player={second} rank={2} delta={deltaOf(second)} />
        <PodiumSlot player={first} rank={1} delta={deltaOf(first)} />
        <PodiumSlot player={third} rank={3} delta={deltaOf(third)} />
      </div>
    </div>
  )
}
