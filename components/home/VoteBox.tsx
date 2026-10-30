'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { countdownParts, voteCta, type HomeViewer } from '@/lib/homeText'

type Props = { matchId: string; closesAt: string; teamA: string; teamB: string; viewer: HomeViewer | null | undefined }

function left(closesAt: string) {
  return countdownParts(new Date(closesAt).getTime() - Date.now())
}

/** Riquadro del voto MOTM sotto il campo. Sparisce da solo quando il voto chiude. */
export default function VoteBox({ matchId, closesAt, teamA, teamB, viewer }: Props) {
  const [parts, setParts] = useState(() => left(closesAt))
  useEffect(() => {
    const id = setInterval(() => setParts(left(closesAt)), 30_000)
    return () => clearInterval(id)
  }, [closesAt])
  if (!parts) return null

  const remaining = parts.d > 0 ? `${parts.d}g ${parts.h}h` : parts.h > 0 ? `${parts.h}h ${parts.m}m` : `${Math.max(parts.m, 1)}m`
  // undefined = non sappiamo ancora chi guarda: niente pulsante per non mostrarne uno sbagliato
  const cta = viewer === undefined ? null : voteCta(viewer)
  const href = cta === 'accedi' ? `/accedi?next=/matches/${matchId}` : `/matches/${matchId}`
  const label = { accedi: 'Accedi', vota: 'Vota', cambia: 'Cambia', vedi: 'Vedi' }

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl px-3.5 py-3"
      style={{ background: 'linear-gradient(120deg, rgba(245,196,81,.16), rgba(245,196,81,.05))', border: '1px solid rgba(245,196,81,.35)' }}>
      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{ background: 'rgba(245,196,81,.2)', color: '#f5c451' }}>★</div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold">{cta === 'cambia' ? 'Hai votato il Man of the Match' : 'Vota il Man of the Match'}</div>
        <div className="text-[12px] truncate" style={{ color: '#8a96a8' }}>{teamA} – {teamB} · chiude tra {remaining}</div>
      </div>
      {cta && (
        <Link href={href} className="ml-auto text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
          style={cta === 'vota' || cta === 'accedi' ? { background: '#f5c451', color: '#2b1f05' } : { border: '1px solid rgba(245,196,81,.5)', color: '#f5c451' }}>
          {label[cta]}
        </Link>
      )}
    </div>
  )
}
