'use client'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signInAction } from './actions'

const inputClass = 'w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/50 transition-all'
const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }
const labelClass = 'text-[11px] uppercase tracking-wider text-white/40 block mb-2'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full font-black py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
      style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
    >
      {pending ? 'Accedo…' : 'Accedi'}
    </button>
  )
}

export default function SignInForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string }, fd: FormData) => signInAction(fd),
    {}
  )
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={labelClass}>Email</label>
        <input name="email" type="email" required autoComplete="email" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} style={inputStyle} />
      </div>
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
          {state.error}
        </div>
      )}
      <Submit />
      <div className="flex justify-between text-xs text-white/35">
        <Link href="/registrati" className="text-brand">Registrati</Link>
        <Link href="/password-dimenticata" className="text-brand">Password dimenticata?</Link>
      </div>
    </form>
  )
}
