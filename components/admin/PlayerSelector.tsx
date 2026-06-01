'use client'
import { useRef } from 'react'
import PlayerCard from '@/components/PlayerCard'
import type { Player } from '@/lib/types'

type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type Props = {
  players: Player[]
  value: SelectedPlayer[]
  onChange: (v: SelectedPlayer[]) => void
}

export default function PlayerSelector({ players, value, onChange }: Props) {
  const dragging = useRef<string | null>(null)

  const teamA = value.filter(v => v.team === 'a').map(v => v.player_id)
  const teamB = value.filter(v => v.team === 'b').map(v => v.player_id)
  const pool = players.filter(p => !value.find(v => v.player_id === p.id)).map(p => p.id)

  const getPlayer = (id: string) => players.find(p => p.id === id)!

  const assign = (playerId: string, team: 'a' | 'b' | null) => {
    if (team === null) {
      onChange(value.filter(v => v.player_id !== playerId))
    } else {
      const exists = value.find(v => v.player_id === playerId)
      if (exists) {
        onChange(value.map(v => v.player_id === playerId ? { ...v, team } : v))
      } else {
        onChange([...value, { player_id: playerId, team }])
      }
    }
  }

  // Tap to cycle: pool → A → B → pool
  const tap = (playerId: string) => {
    const sel = value.find(v => v.player_id === playerId)
    if (!sel) assign(playerId, 'a')
    else if (sel.team === 'a') assign(playerId, 'b')
    else assign(playerId, null)
  }

  const onDrop = (team: 'a' | 'b' | null) => {
    if (!dragging.current) return
    assign(dragging.current, team)
    dragging.current = null
  }

  const chipStyle = (team: 'a' | 'b') => ({
    background: team === 'a' ? 'rgba(167,139,250,0.12)' : 'rgba(99,102,241,0.12)',
    border: `1px solid ${team === 'a' ? 'rgba(167,139,250,0.3)' : 'rgba(99,102,241,0.3)'}`,
  })

  const dropZoneStyle = (active: boolean) => ({
    minHeight: 90,
    background: active ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.02)',
    border: `1px dashed ${active ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: 6,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 4,
    transition: 'all .15s',
  })

  return (
    <div className="flex flex-col gap-3">

      {/* Split drop zones */}
      <div className="grid grid-cols-2 gap-2">
        {(['a', 'b'] as const).map(team => (
          <div key={team}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: team === 'a' ? '#a78bfa' : '#818cf8' }}>
                Team {team.toUpperCase()}
              </span>
              <span className="text-[9px]" style={{ color: team === 'a' ? 'rgba(167,139,250,0.5)' : 'rgba(99,102,241,0.5)' }}>
                {(team === 'a' ? teamA : teamB).length} giocatori
              </span>
            </div>
            <div
              style={dropZoneStyle(team === 'a' ? teamA.length > 0 : teamB.length > 0)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(team)}
            >
              {(team === 'a' ? teamA : teamB).map(id => {
                const p = getPlayer(id)
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => { dragging.current = id }}
                    onClick={() => assign(id, team === 'a' ? 'b' : 'a')}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing select-none"
                    style={chipStyle(team)}
                    title="Trascina o clicca per spostare"
                  >
                    <div className="w-5 h-6 rounded overflow-hidden flex-shrink-0">
                      <PlayerCard player={p} width={20} />
                    </div>
                    <span className="text-[10px] font-bold truncate flex-1">{p.name}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); assign(id, null) }}
                      className="text-white/25 hover:text-red-400 text-sm leading-none flex-shrink-0 transition-colors"
                    >×</button>
                  </div>
                )
              })}
              {(team === 'a' ? teamA : teamB).length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[9px] text-white/20 py-4">
                  Drop qui o tap dal pool
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pool */}
      {pool.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-1.5">
            Pool — non assegnati ({pool.length})
          </div>
          <div
            className="rounded-xl p-2 flex flex-wrap gap-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(null)}
          >
            {pool.map(id => {
              const p = getPlayer(id)
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => { dragging.current = id }}
                  onClick={() => tap(id)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing select-none transition-all hover:border-white/20"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title="Trascina nel team o tap: A → B → rimuovi"
                >
                  <div className="w-5 h-6 rounded overflow-hidden flex-shrink-0">
                    <PlayerCard player={p} width={20} />
                  </div>
                  <span className="text-[10px] font-bold">{p.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="text-[9px] text-white/20 text-center">
        Trascina nei riquadri · Tap dal pool: assegna A → B → rimuovi · Clicca un giocatore assegnato per spostarlo
      </div>
    </div>
  )
}
