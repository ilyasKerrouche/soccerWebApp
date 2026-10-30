'use client'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signUpAction } from './actions'

type Option = { id: string; name: string }

const inputClass = 'w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/50 transition-all'
const inputStyle: React.CSSProperties = { background: '#1a2536', border: '1px solid rgba(255,255,255,0.08)' }
const labelClass = 'text-[11px] uppercase tracking-wider text-white/40 block mb-2'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
      style={{ background: '#5b9cff', color: 'white' }}
    >
      {pending ? 'Registro…' : 'Registrati'}
    </button>
  )
}

export default function SignUpForm({ players }: { players: Option[] }) {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string }, fd: FormData) => signUpAction(fd),
    {}
  )
  const [mode, setMode] = useState<'existing' | 'new'>(players.length > 0 ? 'existing' : 'new')

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Email</label>
        <input name="email" type="email" required autoComplete="email" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className={labelClass}>Password (min. 8 caratteri)</label>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} style={inputStyle} />
      </div>

      <input type="hidden" name="mode" value={mode} />
      <div className="grid grid-cols-2 gap-2">
        {([['existing', 'Sono già in squadra'], ['new', 'Sono nuovo']] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${mode === value ? 'text-white border-brand/60' : 'text-white/40 border-white/10'}`}
            style={mode === value ? { background: 'rgba(91,156,255,0.15)' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'existing' ? (
        <div>
          <label className={labelClass}>Il tuo nome</label>
          <select name="player_id" required defaultValue="" className={inputClass} style={inputStyle}>
            <option value="" disabled>Scegli dall&apos;elenco</option>
            {players.map(p => (
              <option key={p.id} value={p.id} className="bg-[#1a2536]">{p.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" required className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>Ruolo (indicativo)</label>
            <input name="position" placeholder="Posizione (es. ST)" className={inputClass} style={inputStyle} />
          </div>
        </>
      )}

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
          {state.error}
        </div>
      )}
      <Submit />
      <p className="text-center text-xs text-white/35">
        Hai già un account? <Link href="/accedi" className="text-brand">Accedi</Link>
      </p>
    </form>
  )
}
