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

/**
 * Tocco su una card = voto. Finche' il server non conferma la card mostra "Invio…";
 * a voto registrato compare il riquadro "Hai votato" e la card scelta resta in oro con la spunta.
 */
export default function MotmVoteGrid({ matchId, candidates, myVote }: Props) {
  // Voto confermato dal server e card appena toccata (in attesa di conferma)
  const [confirmed, setConfirmed] = useState<string | null>(myVote)
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function vote(playerId: string) {
    if (pending || playerId === confirmed) return
    setSending(playerId)
    setError(null)
    startTransition(async () => {
      const res = await castVote(matchId, playerId)
      if (res.error) setError(res.error)
      else setConfirmed(playerId)
      setSending(null)
    })
  }

  const chosen = candidates.find((p) => p.id === confirmed)

  return (
    <div>
      {chosen ? (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-3"
          style={{ background: 'rgba(245,196,81,0.12)', border: '1px solid rgba(245,196,81,0.35)' }}
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: '#f5c451', color: '#2b1f05' }}>✓</span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-gold truncate">Hai votato {chosen.name}</div>
            <div className="text-[11px] text-muted">Puoi cambiare voto fino alla chiusura toccando un&apos;altra card</div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted mb-3">Tocca la card del migliore in campo per votarlo</p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {candidates.map((p) => {
          const isVote = p.id === confirmed && !sending
          const isSending = p.id === sending
          // Dopo il voto le altre card restano toccabili ma passano in secondo piano
          const dim = (confirmed || sending) && !isVote && !isSending
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending}
              onClick={() => vote(p.id)}
              aria-pressed={p.id === confirmed}
              aria-label={p.id === confirmed ? `Hai votato ${p.name}` : `Vota ${p.name}`}
              className={`relative flex flex-col items-center gap-1 rounded-xl p-1.5 transition ${dim ? 'opacity-45 hover:opacity-80' : ''}`}
              style={
                isVote
                  ? { background: 'rgba(245,196,81,0.14)', boxShadow: '0 0 0 2px #f5c451, 0 0 18px rgba(245,196,81,0.3)' }
                  : isSending
                    ? { background: 'rgba(91,156,255,0.12)', boxShadow: '0 0 0 2px rgba(91,156,255,0.6)' }
                    : undefined
              }
            >
              <PlayerCard player={p} width={72} />
              {isVote && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: '#f5c451', color: '#2b1f05' }} aria-hidden>
                  ✓
                </span>
              )}
              <span className={`text-[10px] font-semibold truncate max-w-full ${isVote ? 'text-gold' : 'text-white/70'}`}>
                {isSending ? 'Invio…' : isVote ? 'Il tuo voto' : p.name}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p role="alert" className="text-xs text-loss mt-2">{error}</p>}
    </div>
  )
}
