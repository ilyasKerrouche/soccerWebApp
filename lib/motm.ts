// lib/motm.ts
// Modulo puro: nessun import da Supabase o React, cosi' e' testabile in isolamento.

/** Durata della finestra di voto: 2 ore dal momento in cui si inserisce il risultato. */
export const MOTM_DURATION_MS = 2 * 60 * 60 * 1000

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

export type Team = 'a' | 'b'
/** `updated_at` serve solo all'ultimo spareggio: chi non lo passa viene trattato come arrivato per ultimo. */
export type VoteRow = { voter_player_id: string; voted_player_id: string; updated_at?: string | null }
export type LineupEntry = { player_id: string; team: Team }
/**
 * `winners` ha al massimo un elemento: a pari voti decide lo spareggio di `tallyMotm`.
 * `counts` e' player_id -> voti ricevuti, solo per chi ne ha almeno uno.
 */
export type Tally = { winners: string[]; topVotes: number; votersCount: number; counts: Record<string, number> }

/** Squadra che ha vinto la partita, null se pari o senza risultato. */
export function winningTeam(scoreA: number | null, scoreB: number | null): Team | null {
  if (scoreA === null || scoreB === null || scoreA === scoreB) return null
  return scoreA > scoreB ? 'a' : 'b'
}

/** Tiene solo i candidati con il punteggio piu' alto. */
function best(ids: string[], score: (id: string) => number): string[] {
  const top = Math.max(...ids.map(score))
  return ids.filter((id) => score(id) === top)
}

/**
 * Conta i voti validi (votante e votato nella formazione) e sceglie un solo MOTM.
 * A pari voti si guarda, in ordine: chi era nella squadra vincente, chi ha preso
 * piu' voti dagli avversari, chi ha raggiunto per primo quel numero di voti.
 * Se resta ancora un pari (voti nello stesso istante) decide l'id, cosi' il
 * risultato e' sempre lo stesso a ogni ricalcolo.
 */
export function tallyMotm(votes: VoteRow[], lineup: LineupEntry[], winner: Team | null): Tally {
  const teamOf = new Map(lineup.map((l) => [l.player_id, l.team]))
  const valid = votes.filter(
    (v) => teamOf.has(v.voter_player_id) && teamOf.has(v.voted_player_id),
  )
  const counts: Record<string, number> = {}
  const fromOpponents: Record<string, number> = {}
  const reachedAt: Record<string, number> = {}
  for (const v of valid) {
    const id = v.voted_player_id
    counts[id] = (counts[id] ?? 0) + 1
    if (teamOf.get(v.voter_player_id) !== teamOf.get(id)) {
      fromOpponents[id] = (fromOpponents[id] ?? 0) + 1
    }
    const at = v.updated_at ? new Date(v.updated_at).getTime() : Infinity
    reachedAt[id] = Math.max(reachedAt[id] ?? -Infinity, at)
  }
  const topVotes = Math.max(0, ...Object.values(counts))
  if (topVotes === 0) return { winners: [], topVotes, votersCount: valid.length, counts }

  let tied = Object.keys(counts).filter((id) => counts[id] === topVotes)
  tied = best(tied, (id) => (teamOf.get(id) === winner ? 1 : 0))
  tied = best(tied, (id) => fromOpponents[id] ?? 0)
  tied = best(tied, (id) => -reachedAt[id])
  return { winners: [tied.sort()[0]], topVotes, votersCount: valid.length, counts }
}

/** Chi puo' votare (`eligibleIds`) e non l'ha ancora fatto, nello stesso ordine. */
export function missingVoters(votes: VoteRow[], eligibleIds: string[]): string[] {
  const voted = new Set(votes.map((v) => v.voter_player_id))
  return eligibleIds.filter((id) => !voted.has(id))
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
