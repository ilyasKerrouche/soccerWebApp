'use client'
import { useState, useTransition, useRef } from 'react'
import { createPlayer } from './actions'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
}

export default function NewPlayerForm() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(formRef.current!)
    startTransition(async () => {
      try {
        await createPlayer(fd)
        formRef.current?.reset()
        setOpen(false)
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black border border-dashed border-brand/30 text-brand/60 hover:border-brand/60 hover:text-brand transition-all"
        style={{ background: 'rgba(167,139,250,0.05)' }}
      >
        ＋ Aggiungi giocatore
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <div className="text-xs font-black text-brand mb-1">Nuovo giocatore</div>

      <input
        name="name"
        required
        placeholder="Nome *"
        className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-brand/40"
        style={inputStyle}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="position"
          placeholder="Posizione (es. ST)"
          className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-brand/40"
          style={inputStyle}
        />
        <input
          name="ovr"
          type="number"
          min={1}
          max={99}
          placeholder="OVR (es. 85)"
          className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-brand/40"
          style={inputStyle}
        />
      </div>

      {error && <div className="text-red-400 text-xs">{error}</div>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/40 border border-white/10"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}
        >
          {pending ? 'Salvo…' : 'Aggiungi'}
        </button>
      </div>
    </form>
  )
}
