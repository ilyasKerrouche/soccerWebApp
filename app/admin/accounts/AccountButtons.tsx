'use client'
import { useState, useTransition } from 'react'
import { approveAccount, rejectAccount, unlinkAccount, resetAccountPassword } from './actions'

const btn = 'text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50'

export function PendingButtons({ userId }: { userId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          disabled={pending}
          className={`${btn} border-brand/25 text-brand hover:bg-brand/10`}
          onClick={() => start(async () => {
            const r = await approveAccount(userId)
            setError(r.error ?? null)
          })}
        >
          Approva
        </button>
        <button
          disabled={pending}
          className={`${btn} border-red-500/25 text-red-400 hover:bg-red-500/10`}
          onClick={() => start(async () => {
            const r = await rejectAccount(userId)
            setError(r.error ?? null)
          })}
        >
          Rifiuta
        </button>
      </div>
      {error && <div className="text-[11px] text-red-400">{error}</div>}
    </div>
  )
}

export function LinkedButtons({ userId }: { userId: string }) {
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          disabled={pending}
          className={`${btn} border-white/10 text-white/60 hover:text-white`}
          onClick={() => start(async () => {
            const r = await resetAccountPassword(userId)
            setTempPassword(r.tempPassword ?? null)
            setError(r.error ?? null)
          })}
        >
          Reimposta password
        </button>
        <button
          disabled={pending}
          className={`${btn} border-red-500/25 text-red-400 hover:bg-red-500/10`}
          onClick={() => {
            if (!confirm("Scollegare ed eliminare l'account? La persona dovrà registrarsi di nuovo.")) return
            start(async () => {
              const r = await unlinkAccount(userId)
              setError(r.error ?? null)
            })
          }}
        >
          Scollega ed elimina
        </button>
      </div>
      {tempPassword && (
        <div className="text-[11px] text-white/60">
          Password temporanea (mostrata una sola volta):{' '}
          <span className="font-mono font-bold text-white select-all">{tempPassword}</span>
        </div>
      )}
      {error && <div className="text-[11px] text-red-400">{error}</div>}
    </div>
  )
}
