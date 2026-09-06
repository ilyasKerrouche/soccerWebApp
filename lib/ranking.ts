// lib/ranking.ts
import type { PlayerWithStats } from '@/lib/types'

export type SortKey = 'goals' | 'appearances' | 'name'

/**
 * Ordinamento delle classifiche giocatori. Lo spareggio e' deterministico
 * (gol, presenze, nome) perche' altrimenti i pari merito si scambiano di posto
 * fra un render e l'altro.
 */
export function comparePlayers(sort: SortKey) {
  return (a: PlayerWithStats, b: PlayerWithStats) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'goals' && a.total_goals !== b.total_goals) return b.total_goals - a.total_goals
    if (a.total_appearances !== b.total_appearances) return b.total_appearances - a.total_appearances
    if (a.total_goals !== b.total_goals) return b.total_goals - a.total_goals
    return a.name.localeCompare(b.name)
  }
}
