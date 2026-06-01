'use client'
import { useState, useTransition } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { savePlayerName, uploadPlayerCard } from './actions'
import type { Player } from '@/lib/types'

export default function AdminPlayerRow({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [pending, startTransition] = useTransition()
  const [uploadPending, startUpload] = useTransition()
  const [success, setSuccess] = useState(false)

  const saveName = () => {
    if (!name.trim() || name === player.name) { setEditing(false); return }
    startTransition(async () => {
      await savePlayerName(player.id, name)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  const handleCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('card', file)
    startUpload(async () => {
      await uploadPlayerCard(player.id, fd)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
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
        {player.position && <div className="text-[9px] text-white/30 mt-0.5">{player.position}</div>}
      </div>

      {/* Status */}
      {(pending || uploadPending) && <span className="text-[10px] text-white/40 animate-pulse">salvo…</span>}
      {success && <span className="text-[10px] text-win">✓</span>}
    </div>
  )
}
