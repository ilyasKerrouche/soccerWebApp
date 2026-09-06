// lib/rating.ts
// Modulo puro: nessun import da Supabase o React, cosi' e' testabile in isolamento.

export type Result = 'W' | 'D' | 'L'

export type PlayerRecord = {
  wins: number
  draws: number
  losses: number
  played: number
  /** Win rate reale, pareggio come mezza vittoria. 0 se non ha mai giocato. */
  win_rate: number
  /** Ultimi risultati, dal piu' recente. Massimo FORM_LENGTH elementi. */
  form: Result[]
}

export type ResultRow = {
  team: 'a' | 'b'
  score_a: number | null
  score_b: number | null
  played_at: string
}

export const FORM_LENGTH = 5

/** Peso della media di gruppo nel rating di bilanciamento. */
export const SHRINKAGE_K = 5

const EMPTY_RECORD: PlayerRecord = { wins: 0, draws: 0, losses: 0, played: 0, win_rate: 0, form: [] }

function resultFor(row: ResultRow): Result | null {
  // Una partita registrata ma senza risultato non conta.
  if (row.score_a === null || row.score_b === null) return null
  const own = row.team === 'a' ? row.score_a : row.score_b
  const other = row.team === 'a' ? row.score_b : row.score_a
  if (own > other) return 'W'
  if (own < other) return 'L'
  return 'D'
}

export function computeRecord(rows: ResultRow[]): PlayerRecord {
  const played = rows
    .map((row) => ({ result: resultFor(row), played_at: row.played_at }))
    .filter((r): r is { result: Result; played_at: string } => r.result !== null)

  if (played.length === 0) return { ...EMPTY_RECORD, form: [] }

  const wins = played.filter((r) => r.result === 'W').length
  const draws = played.filter((r) => r.result === 'D').length
  const losses = played.filter((r) => r.result === 'L').length

  const form = [...played]
    .sort((a, b) => b.played_at.localeCompare(a.played_at))
    .slice(0, FORM_LENGTH)
    .map((r) => r.result)

  return {
    wins,
    draws,
    losses,
    played: played.length,
    win_rate: (wins + 0.5 * draws) / played.length,
    form,
  }
}

/** Media dei win rate di chi ha almeno una presenza. 0.5 se non ha giocato nessuno. */
export function groupAverage(records: PlayerRecord[]): number {
  const active = records.filter((r) => r.played > 0)
  if (active.length === 0) return 0.5
  return active.reduce((sum, r) => sum + r.win_rate, 0) / active.length
}

/**
 * Win rate tirato verso la media del gruppo in proporzione a quante poche
 * partite ha il giocatore. Chi non ha mai giocato vale esattamente la media,
 * cosi' entra nel bilanciamento come un giocatore medio e non come il peggiore.
 */
export function balancingRating(record: PlayerRecord | undefined, groupAvg: number, k = SHRINKAGE_K): number {
  if (!record || record.played === 0) return groupAvg
  const raw = record.wins + 0.5 * record.draws
  return (raw + k * groupAvg) / (record.played + k)
}
