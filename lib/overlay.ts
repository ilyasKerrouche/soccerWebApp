// lib/overlay.ts
// Solo browser. I momenti a tutto schermo della home (momento MOTM, annuncio formazioni) e l'avviso record
// non devono accavallarsi: chi si apre lo segnala qui, chi arriva dopo aspetta che lo schermo sia libero.
const CLOSED_EVENT = 'calcetto:overlay-closed'
let openCount = 0

/** Da chiamare quando un momento a tutto schermo si apre; la funzione restituita va chiamata alla chiusura. */
export function overlayOpened(): () => void {
  openCount++
  let closed = false
  return () => {
    if (closed) return
    closed = true
    openCount--
    if (openCount === 0) window.dispatchEvent(new Event(CLOSED_EVENT))
  }
}

/**
 * Chiama `cb` appena nessun momento a tutto schermo e' aperto. Dopo una chiusura aspetta `settleMs` e ricontrolla:
 * chi ha un'attesa piu' lunga lascia passare gli altri. Restituisce la funzione per annullare.
 */
export function whenNoOverlay(cb: () => void, settleMs = 0): () => void {
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const check = () => {
    if (cancelled) return
    if (openCount === 0) cb()
    else window.addEventListener(CLOSED_EVENT, later, { once: true })
  }
  const later = () => { timer = setTimeout(check, settleMs) }
  check()
  return () => { cancelled = true; clearTimeout(timer); window.removeEventListener(CLOSED_EVENT, later) }
}
