'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { whenNoOverlay } from '@/lib/overlay'
import { recordNewsKey } from '@/lib/records'

type Props = {
  matchId: string
  /** true se almeno un record e' stato battuto; false se sono solo eguagliati. */
  beaten: boolean
  /** Una riga per record, es. "Più gol in una partita: 5 gol · Marco". */
  lines: string[]
}

// Dopo che la home si e' disegnata; se c'e' un momento a tutto schermo, aspetta che finisca
const START_DELAY_MS = 1200
const SETTLE_MS = 700
const VISIBLE_MS = 10_000

/**
 * Avviso record: se l'ultima partita ha battuto o eguagliato un record, una fascia dorata scende dall'alto.
 * Una volta sola per partita e per telefono; toccandola si va alla bacheca dei record, la X la chiude.
 * Deciso nel client: la home e' in cache uguale per tutti.
 */
export default function RecordBanner({ matchId, beaten, lines }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (lines.length === 0) return
    try { if (localStorage.getItem(recordNewsKey(matchId)) !== null) return } catch { /* senza storage: si mostra */ }
    let cancel = () => {}
    const id = setTimeout(() => {
      cancel = whenNoOverlay(() => {
        setOpen(true)
        try { localStorage.setItem(recordNewsKey(matchId), '1') } catch {}
      }, SETTLE_MS)
    }, START_DELAY_MS)
    return () => { clearTimeout(id); cancel() }
  }, [matchId, lines.length])

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => setOpen(false), VISIBLE_MS)
    return () => clearTimeout(id)
  }, [open])

  if (!open) return null
  return (
    <div className="rec-banner" role="status">
      <Link href="/stats?scheda=record" className="rec-banner-body" onClick={() => setOpen(false)}>
        <div className="rec-banner-title">★ {beaten ? 'NUOVO RECORD' : 'RECORD EGUAGLIATO'}</div>
        {lines.map((l) => <div key={l} className="rec-banner-line">{l}</div>)}
      </Link>
      <button type="button" className="rec-banner-x" aria-label="Chiudi" onClick={() => setOpen(false)}>×</button>
    </div>
  )
}
