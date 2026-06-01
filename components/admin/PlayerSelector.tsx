'use client'
import PlayerCard from '@/components/PlayerCard'
import type { Player } from '@/lib/types'

type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type Props = {
  players: Player[]
  value: SelectedPlayer[]
  onChange: (v: SelectedPlayer[]) => void
}

export default function PlayerSelector({ players, value, onChange }: Props) {
  const toggle = (playerId: string, team: 'a' | 'b') => {
    const exists = value.find((v) => v.player_id === playerId)
    if (exists) {
      if (exists.team === team) {
        onChange(value.filter((v) => v.player_id !== playerId))
      } else {
        onChange(value.map((v) => v.player_id === playerId ? { ...v, team } : v))
      }
    } else {
      onChange([...value, { player_id: playerId, team }])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((p) => {
        const sel = value.find((v) => v.player_id === p.id)
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-xl p-2.5 border transition-all ${
              sel ? 'border-brand/40 bg-brand/10' : 'border-white/8 bg-white/4'
            }`}
          >
            <div className="w-6 h-8 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={24} />
            </div>
            <span className="flex-1 text-xs font-semibold truncate">{p.name}</span>
            <div className="flex gap-1">
              {(['a', 'b'] as const).map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => toggle(p.id, team)}
                  className={`w-7 h-7 rounded-lg text-xs font-black border transition-all ${
                    sel?.team === team
                      ? 'bg-brand text-black border-brand'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}
                >
                  {team.toUpperCase()}
                </button>
              ))}
            </div>
            {sel && <span className="text-brand text-sm">✓</span>}
          </div>
        )
      })}
    </div>
  )
}
