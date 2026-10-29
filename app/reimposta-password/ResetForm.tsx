'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { resetPasswordAction } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full font-black py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
      style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
    >
      {pending ? 'Salvo…' : 'Salva password'}
    </button>
  )
}

export default function ResetForm() {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string }, fd: FormData) => resetPasswordAction(fd),
    {}
  )
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Nuova password (min. 8 caratteri)</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/50 transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
          {state.error}
        </div>
      )}
      <Submit />
    </form>
  )
}
