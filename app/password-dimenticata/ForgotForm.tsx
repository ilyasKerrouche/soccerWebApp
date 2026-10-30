'use client'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { forgotPasswordAction } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full font-black py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
      style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
    >
      {pending ? 'Invio…' : 'Invia link'}
    </button>
  )
}

export default function ForgotForm() {
  const [state, formAction] = useFormState(
    async (_prev: { done: boolean }, fd: FormData) => forgotPasswordAction(fd),
    { done: false }
  )
  if (state.done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-white/70">Se l&apos;email esiste, ti abbiamo scritto.</p>
        <Link href="/accedi" className="text-brand text-xs">Torna all&apos;accesso</Link>
      </div>
    )
  }
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/50 transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>
      <Submit />
    </form>
  )
}
