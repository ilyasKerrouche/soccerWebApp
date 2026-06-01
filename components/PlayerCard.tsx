import Image from 'next/image'
import type { Player } from '@/lib/types'

type Props = {
  player: Player
  width?: number
  className?: string
}

export default function PlayerCard({ player, width = 80, className = '' }: Props) {
  if (!player.card_url) {
    return (
      <div
        className={`rounded-lg bg-white/10 flex items-center justify-center text-white/30 text-xs ${className}`}
        style={{ width, aspectRatio: '0.72' }}
      >
        {player.name[0]}
      </div>
    )
  }
  return (
    <div className={`rounded-lg overflow-hidden flex-shrink-0 ${className}`} style={{ width }}>
      <Image
        src={player.card_url}
        alt={player.name}
        width={width}
        height={Math.round(width / 0.72)}
        className="w-full block"
        unoptimized
      />
    </div>
  )
}
