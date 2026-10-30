'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCountdown } from '@/lib/motm'

// Conto alla rovescia verso la chiusura; a zero ricarica i dati del server.
export default function MotmCountdown({ closesAt }: { closesAt: string }) {
  const router = useRouter()
  const refreshed = useRef(false)
  const end = new Date(closesAt).getTime()
  const [msLeft, setMsLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setMsLeft(end - Date.now())
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [end])

  useEffect(() => {
    if (msLeft !== null && msLeft <= 0 && !refreshed.current) {
      refreshed.current = true
      router.refresh()
    }
  }, [msLeft, router])

  if (msLeft === null) {
    return <span className="inline-block w-20 h-6 rounded-full bg-white/5" aria-hidden />
  }
  if (msLeft <= 0) {
    return <span className="text-xs font-bold text-white/50">Votazione chiusa</span>
  }
  return (
    <span className="bg-brand/15 text-brand text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap">
      ⏳ {formatCountdown(msLeft)}
    </span>
  )
}
