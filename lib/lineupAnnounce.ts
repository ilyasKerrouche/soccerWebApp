// lib/lineupAnnounce.ts
// Modulo puro: quando mostrare in home l'annuncio delle formazioni (components/home/LineupAnnounce.tsx)
// e in che ordine presentare i giocatori.
import type { MatchPhase } from './homeText'

export function announceKey(matchId: string): string {
  return `calcetto:lineup-announced:${matchId}`
}

/**
 * L'annuncio parte da solo quando la prossima partita ha giocatori in entrambe le squadre, una volta sola.
 * Non a partita finita (in attesa del risultato) e non con "riduci movimento": li' resta solo il pulsante per rivederlo.
 */
export function shouldAnnounce(i: { teamA: number; teamB: number; phase: MatchPhase | null; seen: boolean; reducedMotion: boolean }): boolean {
  if (i.seen || i.reducedMotion || i.phase === 'after') return false
  return i.teamA > 0 && i.teamB > 0
}

// Sigle usate nelle card (italiane e inglesi), dalla porta all'attacco
const ROLES: { re: RegExp; label: string }[] = [
  { re: /^(gk|por|portiere|p)$/, label: 'Portiere' },
  { re: /^(def|dif|cb|dc|lb|rb|td|ts|difensore)$/, label: 'Difensore' },
  { re: /^(cm|cc|cdm|cdc|med|mid|centrocampista)$/, label: 'Centrocampista' },
  { re: /^(cam|coc|trq|trequartista)$/, label: 'Trequartista' },
  { re: /^(att|st|cf|fw|lw|rw|as|ad|attaccante)$/, label: 'Attaccante' },
]

function roleIndex(position: string | null): number {
  const key = (position ?? '').trim().toLowerCase()
  const i = ROLES.findIndex((r) => r.re.test(key))
  return i === -1 ? ROLES.length : i
}

/** Ruolo per esteso sotto il nome; una sigla sconosciuta resta com'e'. */
export function roleLabel(position: string | null): string {
  const i = roleIndex(position)
  return i < ROLES.length ? ROLES[i].label : (position ?? '').trim()
}

/** Ordine di presentazione: portiere, difesa, centrocampo, attacco; ruoli sconosciuti in fondo. */
export function announceOrder<T extends { position: string | null }>(players: T[]): T[] {
  return players
    .map((p, i) => ({ p, i, r: roleIndex(p.position) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.p)
}

/** Distanza in px tra le card del ventaglio: 40, o meno se n card larghe cardW non stanno nello schermo. */
export function fanSpacing(screenW: number, n: number, cardW: number): number {
  if (n < 2) return 0
  return Math.max(0, Math.min(40, Math.floor((screenW - 16 - cardW) / (n - 1))))
}
