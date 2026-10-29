// lib/motm.ts
// Modulo puro: nessun import da Supabase o React, cosi' e' testabile in isolamento.

/** Durata della finestra di voto: 3 giorni. */
export const MOTM_DURATION_MS = 3 * 24 * 60 * 60 * 1000

export type MotmStatus = 'none' | 'open' | 'closed'

/** 'none' se il voto non e' mai stato aperto, altrimenti aperto o chiuso in base a `now`. */
export function motmStatus(closesAt: string | null, now: Date): MotmStatus {
  if (closesAt === null) return 'none'
  return new Date(closesAt).getTime() > now.getTime() ? 'open' : 'closed'
}

/** True quando la partita e' giocata, ha un risultato e il voto non e' ancora stato aperto. */
export function shouldOpenVote(m: {
  motm_eligible: boolean
  motm_closes_at: string | null
  is_upcoming: boolean
  score_a: number | null
  score_b: number | null
}): boolean {
  return (
    m.motm_eligible &&
    m.motm_closes_at === null &&
    !m.is_upcoming &&
    m.score_a !== null &&
    m.score_b !== null
  )
}

export function closesAtFrom(now: Date): string {
  return new Date(now.getTime() + MOTM_DURATION_MS).toISOString()
}

export type VoteRow = { voter_player_id: string; voted_player_id: string }
export type Tally = { winners: string[]; topVotes: number; votersCount: number }

/** Conta i voti validi (votante e votato nella formazione). Vincitori ordinati per id. */
export function tallyMotm(votes: VoteRow[], lineupIds: string[]): Tally {
  const lineup = new Set(lineupIds)
  const valid = votes.filter(
    (v) => lineup.has(v.voter_player_id) && lineup.has(v.voted_player_id),
  )
  const counts = new Map<string, number>()
  for (const v of valid) {
    counts.set(v.voted_player_id, (counts.get(v.voted_player_id) ?? 0) + 1)
  }
  const topVotes = Math.max(0, ...counts.values())
  const winners =
    topVotes === 0
      ? []
      : [...counts.entries()]
          .filter(([, n]) => n === topVotes)
          .map(([id]) => id)
          .sort()
  return { winners, topVotes, votersCount: valid.length }
}

export type VoteCheck = {
  account: { player_id: string; status: string } | null
  votedId: string
  lineupIds: string[]
  closesAt: string | null
  now: Date
}

/** Messaggio d'errore (italiano) se il voto non e' ammesso, altrimenti null. */
export function voteError(c: VoteCheck): string | null {
  if (!c.account || c.account.status !== 'approved') {
    return 'Accedi con un account approvato per votare'
  }
  if (!c.lineupIds.includes(c.account.player_id)) {
    return 'Puoi votare solo le partite in cui hai giocato'
  }
  if (c.votedId === c.account.player_id) return 'Non puoi votare per te stesso'
  if (!c.lineupIds.includes(c.votedId)) return 'Giocatore non presente in questa partita'
  if (motmStatus(c.closesAt, c.now) !== 'open') return 'La votazione è chiusa'
  return null
}

/** Tempo rimanente, arrotondato per difetto al minuto. */
export function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return 'chiusa'
  const totalMin = Math.floor(msLeft / 60_000)
  if (totalMin < 1) return 'meno di 1m'
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const mm = String(totalMin % 60).padStart(2, '0')
  return d >= 1 ? `${d}g ${h}h ${mm}m` : `${h}h ${mm}m`
}
