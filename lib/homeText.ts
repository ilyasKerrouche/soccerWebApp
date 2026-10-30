// lib/homeText.ts
// Modulo puro: testi e stati della home (LED, riquadro voto, conti alla rovescia, orari italiani).

export type LedInput = {
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  motmNames: string[]
  scorers: { name: string; goals: number }[]
  next: { playedAt: string; time: string | null } | null
}

export type HomeViewer = { kind: 'anon' | 'pending' | 'player' | 'admin'; playerId: string | null; inLineup: boolean; voted: boolean }
export type VoteCta = 'accedi' | 'vota' | 'cambia' | 'vedi'

const SEP = '  ·  '
const up = (s: string) => s.toLocaleUpperCase('it-IT')

/** Ordine unico dei marcatori (LED e liste): piu' gol prima, a parita' in ordine alfabetico. */
export function sortScorers<T>(items: T[], pick: (x: T) => { name: string; goals: number }): T[] {
  return [...items].sort((a, b) => {
    const pa = pick(a)
    const pb = pick(b)
    return pb.goals - pa.goals || pa.name.localeCompare(pb.name, 'it')
  })
}

/** Top n marcatori della stagione: chi non ha segnato non compare. */
export function topScorers<T extends { name: string; total_goals: number }>(players: T[], n: number): T[] {
  return sortScorers(players.filter((p) => p.total_goals > 0), (p) => ({ name: p.name, goals: p.total_goals })).slice(0, n)
}

export function buildLedText(i: LedInput): string {
  const parts = [`${up(i.teamA)} ${i.scoreA} – ${i.scoreB} ${up(i.teamB)}`]
  if (i.motmNames.length > 0) parts.push(`★ MOTM ${i.motmNames.map(up).join(' & ')}`)
  if (i.scorers.length > 0) {
    const sorted = sortScorers(i.scorers, (s) => s)
    parts.push(sorted.map((s) => (s.goals > 1 ? `${up(s.name)} ×${s.goals}` : up(s.name))).join('  '))
  }
  if (i.next) {
    const time = formatRomeTime(i.next.time)
    parts.push(['PROSSIMA PARTITA', up(formatRomeDay(i.next.playedAt)), time ? `ORE ${time}` : null].filter(Boolean).join(' · '))
  }
  return parts.join(SEP)
}

export function voteCta(v: HomeViewer | null): VoteCta {
  if (!v || v.kind === 'anon') return 'accedi'
  if (v.kind !== 'player' || !v.inLineup) return 'vedi'
  return v.voted ? 'cambia' : 'vota'
}

export function countdownParts(msLeft: number): { d: number; h: number; m: number } | null {
  if (msLeft <= 0) return null
  const min = Math.floor(msLeft / 60000)
  return { d: Math.floor(min / 1440), h: Math.floor((min % 1440) / 60), m: min % 60 }
}

// Una data "YYYY-MM-DD" senza ora viene letta a mezzogiorno UTC, cosi' in Italia resta lo stesso giorno.
function toDate(isoOrDate: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate) ? new Date(`${isoOrDate}T12:00:00Z`) : new Date(isoOrDate)
}

export function formatRomeDay(isoOrDate: string): string {
  return new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(isoOrDate))
}

/** Giorno "YYYY-MM-DD" + ora "HH:MM[:SS]" in ora italiana → istante assoluto (gestisce ora legale e solare). */
export function romeInstant(date: string, time: string): Date {
  const asUtc = new Date(`${date}T${time.slice(0, 5)}:00Z`)
  // Che ora segna Roma in quell'istante UTC? La differenza e' lo scarto del fuso.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(asUtc).map((p) => [p.type, p.value]),
  )
  const romeAsUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute)
  return new Date(asUtc.getTime() - (romeAsUtc - asUtc.getTime()))
}

export function formatRomeTime(time: string | null): string | null {
  return time ? time.slice(0, 5) : null
}
