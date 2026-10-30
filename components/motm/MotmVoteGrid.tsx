'use client'
import { useState, useTransition } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { castVote } from '@/app/matches/[id]/motmActions'
import type { Player } from '@/lib/types'

type Props = {
  matchId: string
  candidates: Player[] // la formazione senza il votante
  myVote: string | null
}

export default function MotmVoteGrid({ matchId, candidates, myVote }: Props) {
  const [selected, setSelected] = useState<string | null>(myVote)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function vote(playerId: string) {
    if (playerId === selected) return
    const previous = selected
    setSelected(playerId)
    setError(null)
    startTransition(async () => {
      const res = await castVote(matchId, playerId)
      if (res.error) {
        setSelected(previous)
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {candidates.map(p => {
          const active = p.id === selected
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending}
              onClick={() => vote(p.id)}
              aria-pressed={active}
              aria-label={`Vota ${p.name}`}
              className={`flex flex-col items-center gap-1 rounded-xl p-1.5 transition ${
                active ? 'bg-brand/20 ring-2 ring-brand' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <PlayerCard player={p} width={72} />
              <span className="text-[10px] font-semibold text-white/60 truncate max-w-full">{p.name}</span>
            </button>
          )
        })}
      </div>
      {error && <p role="alert" className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
