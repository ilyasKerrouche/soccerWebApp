import Image from 'next/image'
import type { Player } from '@/lib/types'
import PlaceholderCard from './PlaceholderCard'

type Props = {
  player: Player
  width?: number
  className?: string
  /** Carica subito l'immagine. Serve dentro le scene 3D: Safari ne calcola male la posizione
   *  e con il caricamento "lazy" non la scarica mai. */
  eager?: boolean
}

export default function PlayerCard({ player, width = 80, className = '', eager = false }: Props) {
  if (!player.card_url) {
    return <PlaceholderCard player={player} width={width} className={className} />
  }
  return (
    <div className={`rounded-lg overflow-hidden flex-shrink-0 ${className}`} style={{ width }}>
      <Image
        src={player.card_url}
        alt={player.name}
        width={width}
        height={Math.round(width / 0.72)}
        className="w-full block"
        loading={eager ? 'eager' : 'lazy'}
        unoptimized
      />
    </div>
  )
}
