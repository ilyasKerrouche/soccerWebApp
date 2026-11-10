'use client'
import { useState, useTransition, useEffect } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { savePlayerName, uploadPlayerCard, updatePlayerPosition } from './actions'
import type { Player } from '@/lib/types'

export default function AdminPlayerRow({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [isGK, setIsGK] = useState(player.position === 'GK')
  const [pending, startTransition] = useTransition()
  const [uploadPending, startUpload] = useTransition()
  const [gkPending, startGK] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const done = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  useEffect(() => {
    setIsGK(player.position === 'GK')
  }, [player.position])

  const saveName = () => {
    if (!name.trim() || name.trim() === player.name) { setName(player.name); setEditing(false); return }
    setError(null)
    startTransition(async () => {
      try {
        await savePlayerName(player.id, name)
        setName(name.trim())
        done()
      } catch {
        setName(player.name)
        setError('Nome non salvato')
      }
      setEditing(false)
    })
  }

  const handleCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('card', file)
    // Svuotato subito: cosi' si puo' riscegliere lo stesso file dopo un errore
    e.target.value = ''
    setError(null)
    startUpload(async () => {
      try {
        const res = await uploadPlayerCard(player.id, fd)
        if (res.error) setError(res.error)
        else done()
      } catch {
        setError('Card non caricata')
      }
    })
  }

  const toggleGK = () => {
    const newPosition = isGK ? null : 'GK'
    setError(null)
    startGK(async () => {
      try {
        await updatePlayerPosition(player.id, newPosition)
        setIsGK(!isGK)
        done()
      } catch {
        setError('Ruolo non salvato')
      }
    })
  }

  return (
    <div className="glass rounded-2xl p-3 flex items-center gap-3">
      {/* Card preview + upload */}
      <label className="relative cursor-pointer flex-shrink-0 group">
        <div className="w-10 h-14 rounded-lg overflow-hidden">
          <PlayerCard player={player} width={40} />
        </div>
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] text-white font-bold text-center leading-tight px-1">{uploadPending ? '…' : '📷'}</span>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleCard} disabled={uploadPending} />
      </label>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(player.name); setEditing(false) } }}
            className="w-full bg-white/10 border border-brand/30 rounded-lg px-2 py-1 text-sm font-bold outline-none text-white"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm font-bold text-left w-full hover:text-brand transition-colors">
            {name}
            <span className="text-white/20 text-[10px] ml-1.5">✏️</span>
          </button>
        )}
        {isGK && <div className="text-[9px] text-brand/60 mt-0.5 font-bold">Portiere</div>}
      </div>

      {/* Toggle GK */}
      <button
        onClick={toggleGK}
        disabled={gkPending}
        title={isGK ? 'Rimuovi portiere' : 'Imposta come portiere'}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all text-base"
        style={{
          background: isGK ? 'rgba(91,156,255,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isGK ? 'rgba(91,156,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          opacity: gkPending ? 0.5 : 1,
        }}
      >
        🥅
      </button>

      {/* Status */}
      {(pending || uploadPending || gkPending) && <span className="text-[10px] text-white/40 animate-pulse">salvo…</span>}
      {success && <span className="text-[10px] text-win">✓</span>}
      {error && <span role="alert" className="text-[10px] text-red-400 max-w-[90px] leading-tight">{error}</span>}
    </div>
  )
}
