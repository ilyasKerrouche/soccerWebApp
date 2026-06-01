'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  onDelete: () => Promise<void>
  onDuplicate: () => Promise<void>
}

export default function MatchActions({ onDelete, onDuplicate }: Props) {
  const router = useRouter()
  const [deletePending, startDelete] = useTransition()
  const [dupPending, startDup] = useTransition()

  const handleDelete = () => {
    if (!confirm('Sei sicuro di voler eliminare questa partita?')) return
    startDelete(async () => { await onDelete() })
  }

  const handleDuplicate = () => {
    startDup(async () => { await onDuplicate() })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDuplicate}
        disabled={dupPending}
        className="text-xs font-bold px-3 py-2 rounded-xl border border-brand/25 text-brand hover:bg-brand/10 transition-colors disabled:opacity-50"
        style={{ background: 'rgba(167,139,250,0.07)' }}
      >
        {dupPending ? '…' : '⧉ Duplica'}
      </button>
      <button
        onClick={handleDelete}
        disabled={deletePending}
        className="text-xs font-bold px-3 py-2 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        style={{ background: 'rgba(239,68,68,0.07)' }}
      >
        {deletePending ? '…' : '🗑 Elimina'}
      </button>
    </div>
  )
}
