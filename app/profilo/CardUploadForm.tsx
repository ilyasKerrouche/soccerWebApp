'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMyCard } from './actions'

export default function CardUploadForm({ hasCard }: { hasCard: boolean }) {
  const router = useRouter()
  const ref = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.set('card', file)
    setError(null)
    startTransition(async () => {
      try {
        const res = await uploadMyCard(fd)
        if (res.error) setError(res.error)
        else {
          router.refresh()
          window.dispatchEvent(new CustomEvent('calcetto:card-updated'))
        }
      } catch {
        setError('Caricamento non riuscito, riprova')
      }
      if (ref.current) ref.current.value = ''
    })
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} className="hidden" />
      <button
        type="button"
        disabled={pending}
        onClick={() => ref.current?.click()}
        className="w-full font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
        style={{ background: '#5b9cff', color: 'white' }}
      >
        {pending ? 'Caricamento…' : hasCard ? 'Cambia card' : 'Carica la tua card'}
      </button>
      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
          {error}
        </div>
      )}
    </div>
  )
}
