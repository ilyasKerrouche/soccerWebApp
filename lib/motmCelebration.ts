// lib/motmCelebration.ts
// Modulo puro: quando mostrare in home il "momento MOTM" (components/home/MotmCelebration.tsx).

/** Oltre questo tempo dalla chiusura del voto la festa non ha piu' senso (chi torna dopo settimane non la vede). */
export const CELEBRATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export function celebrationKey(matchId: string): string {
  return `calcetto:motm-celebrated:${matchId}`
}

export function shouldCelebrate(i: { winnerCount: number; closesAt: string | null; now: Date; seen: boolean }): boolean {
  if (i.seen || i.winnerCount === 0 || i.closesAt === null) return false
  const sinceClose = i.now.getTime() - new Date(i.closesAt).getTime()
  return sinceClose >= 0 && sinceClose < CELEBRATION_WINDOW_MS
}
