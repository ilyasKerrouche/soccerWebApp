'use client'
import { useState, useEffect } from 'react'
import { toggleVote, getVotesAction } from '@/app/availability/actions'
import type { AvailabilityVote } from '@/lib/types'

const IT_DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

type WeekDay = { dateStr: string; dayName: string; dayNum: number }

function getFollowingWeek(played_at: string): WeekDay[] {
  const [y, m, d] = played_at.split('-').map(Number)
  const match = new Date(Date.UTC(y, m - 1, d))
  const dayOfWeek = match.getUTCDay()
  const daysUntilNextMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7 || 7
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(match)
    date.setUTCDate(match.getUTCDate() + daysUntilNextMonday + i)
    const dateStr = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-')
    return { dateStr, dayName: IT_DAYS[date.getUTCDay()], dayNum: date.getUTCDate() }
  })
}

type Props = {
  matchId: string
  played_at: string
  initialVotes: AvailabilityVote[]
}

export default function AvailabilityPoll({ matchId, played_at, initialVotes }: Props) {
  const [votes, setVotes] = useState<AvailabilityVote[]>(initialVotes)
  const [name, setName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('calcetto_voter_name')
    if (stored) setName(stored)
    // Fetch fresh votes bypassing page cache
    getVotesAction(matchId).then(setVotes)
  }, [matchId])

  const week = getFollowingWeek(played_at)

  const saveName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    localStorage.setItem('calcetto_voter_name', trimmed)
    setName(trimmed)
    setNameInput('')
  }

  const handleToggle = async (dateStr: string) => {
    if (!name || pending) return
    setPending(dateStr)
    try {
      const updated = await toggleVote(matchId, dateStr, name)
      setVotes(updated)
    } finally {
      setPending(null)
    }
  }

  const votesByDate = Object.fromEntries(
    week.map(({ dateStr }) => [dateStr, votes.filter(v => v.vote_date === dateStr).map(v => v.voter_name)])
  )

  const maxVotes = Math.max(1, ...week.map(({ dateStr }) => votesByDate[dateStr].length))
  const topCount = Math.max(...week.map(({ dateStr }) => votesByDate[dateStr].length))
  const topDateStr = topCount > 0
    ? week.find(({ dateStr }) => votesByDate[dateStr].length === topCount)?.dateStr ?? null
    : null

  return (
    <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold text-white/45">Disponibilità settimana dopo</div>
        {name && (
          <button
            onClick={() => { localStorage.removeItem('calcetto_voter_name'); setName('') }}
            className="text-[9px] text-white/20 hover:text-white/40 transition-colors"
          >
            {name} · cambia
          </button>
        )}
      </div>

      {/* Righe con barre */}
      <div className="flex flex-col gap-2 mb-3">
        {week.map(({ dateStr, dayName, dayNum }) => {
          const voters = votesByDate[dateStr] ?? []
          const count = voters.length
          const voted = voters.includes(name)
          const isTop = dateStr === topDateStr
          const isLoading = pending === dateStr
          const barPct = Math.round((count / maxVotes) * 100)

          const barColor = isTop
            ? 'rgba(74,222,128,0.55)'
            : voted
            ? 'rgba(167,139,250,0.5)'
            : 'rgba(255,255,255,0.15)'

          const countColor = isTop ? '#4ade80' : voted ? '#a78bfa' : count > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'

          const displayNames = voters.slice(0, 3)
          const extra = voters.length - displayNames.length

          return (
            <button
              key={dateStr}
              onClick={() => handleToggle(dateStr)}
              disabled={!name || !!pending}
              className="flex items-center gap-2 w-full text-left transition-opacity disabled:cursor-default"
              style={{ opacity: pending && pending !== dateStr ? 0.5 : 1 }}
            >
              {/* Giorno */}
              <div className="w-10 shrink-0 text-right">
                <div style={{ fontSize: '9px', fontWeight: 700, color: count > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)', lineHeight: 1.2 }}>
                  {dayName}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: count > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', lineHeight: 1.2 }}>
                  {dayNum}
                </div>
              </div>

              {/* Barra */}
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${barPct}%`, background: barColor }}
                />
              </div>

              {/* Conteggio */}
              <div className="w-4 text-right shrink-0" style={{ fontSize: '10px', fontWeight: 900, color: countColor }}>
                {isLoading ? '…' : count > 0 ? count : ''}
              </div>

              {/* Badge nomi */}
              <div className="flex gap-1 w-24 shrink-0">
                {displayNames.map(v => (
                  <span
                    key={v}
                    style={{
                      fontSize: '8px',
                      padding: '1px 5px',
                      borderRadius: '999px',
                      background: v === name ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.06)',
                      color: v === name ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                      maxWidth: '32px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v}
                  </span>
                ))}
                {extra > 0 && (
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>+{extra}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Input nome */}
      {!name ? (
        <div className="flex gap-2 mt-1">
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            placeholder="Il tuo nome per votare…"
            className="flex-1 rounded-xl px-3 py-2 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={saveName}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}
          >
            Ok
          </button>
        </div>
      ) : (
        <div className="text-[9px] text-white/20 text-center mt-1">
          Tocca un giorno per votare
        </div>
      )}
    </div>
  )
}
