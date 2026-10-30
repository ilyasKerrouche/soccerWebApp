'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMyCard } from './actions'

export default function CardUploadForm() {
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
      const res = await uploadMyCard(fd)
      if (res.error) setError(res.error)
      else router.refresh()
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
        className="w-full font-black py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
      >
        {pending ? 'Caricamento…' : 'Carica la tua card'}
      </button>
      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
          {error}
        </div>
      )}
    </div>
  )
}
