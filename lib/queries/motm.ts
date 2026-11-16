// lib/queries/motm.ts
// motm_votes ha RLS senza policy: ogni accesso passa dal service role.
// Questi dati non vanno mai restituiti ai client: chi ha votato chi e' privato.
import { createAdminClient } from '@/lib/supabase/admin'
import { tallyMotm, winningTeam, type LineupEntry, type VoteRow } from '@/lib/motm'
import { inSeason, type SeasonKey } from '@/lib/season'
import { fetchAll } from './paging'

export async function getVotesForMatch(matchId: string): Promise<VoteRow[]> {
  const supabase = createAdminClient()
  return fetchAll<VoteRow>((from, to) =>
    supabase
      .from('motm_votes')
      .select('voter_player_id, voted_player_id, updated_at')
      .eq('match_id', matchId)
      .order('id')
      .range(from, to),
  )
}

export async function getMyVote(matchId: string, voterPlayerId: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from('motm_votes')
    .select('voted_player_id')
    .eq('match_id', matchId)
    .eq('voter_player_id', voterPlayerId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.voted_player_id as string | undefined) ?? null
}

export async function upsertVote(
  matchId: string,
  voterPlayerId: string,
  votedPlayerId: string,
): Promise<void> {
  const { error } = await createAdminClient()
    .from('motm_votes')
    .upsert(
      {
        match_id: matchId,
        voter_player_id: voterPlayerId,
        voted_player_id: votedPlayerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'match_id,voter_player_id' },
    )
  if (error) throw new Error(error.message)
}

// Vincitore (al massimo uno per partita, vedi tallyMotm) delle sole partite con voto chiuso. Senza matchIds
// copre tutte le partite chiuse (nessuna lista id nell'URL). Poche query in
// tutto, indipendentemente dal numero di partite.
async function computeWinners(matchIds?: string[], season: SeasonKey = 'all', at: Date = new Date()): Promise<Record<string, string[]>> {
  if (matchIds && matchIds.length === 0) return {}
  const supabase = createAdminClient()
  const now = at.toISOString()

  // lte: chiuso dall'istante esatto della scadenza, come motmStatus
  const closedAll = await fetchAll<{ id: string; played_at: string; score_a: number | null; score_b: number | null }>((from, to) => {
    let q = supabase.from('matches').select('id, played_at, score_a, score_b').lte('motm_closes_at', now)
    if (matchIds) q = q.in('id', matchIds)
    return q.order('id').range(from, to)
  })
  const closed = closedAll.filter(m => inSeason(m.played_at, season))
  const closedIds = closed.map(m => m.id)
  if (closedIds.length === 0) return {}
  const closedSet = new Set(closedIds)

  // Con una lista esplicita si filtra in query; altrimenti si legge tutto e si
  // scartano in memoria le partite non chiuse.
  const [votes, lineup] = await Promise.all([
    fetchAll<VoteRow & { match_id: string }>((from, to) => {
      let q = supabase.from('motm_votes').select('match_id, voter_player_id, voted_player_id, updated_at')
      if (matchIds) q = q.in('match_id', closedIds)
      return q.order('id').range(from, to)
    }),
    fetchAll<LineupEntry & { match_id: string }>((from, to) => {
      let q = supabase.from('match_players').select('match_id, player_id, team')
      if (matchIds) q = q.in('match_id', closedIds)
      return q.order('id').range(from, to)
    }),
  ])

  const votesBy: Record<string, VoteRow[]> = {}
  for (const v of votes) if (closedSet.has(v.match_id)) (votesBy[v.match_id] ??= []).push(v)
  const lineupBy: Record<string, LineupEntry[]> = {}
  for (const l of lineup) if (closedSet.has(l.match_id)) (lineupBy[l.match_id] ??= []).push(l)

  const result: Record<string, string[]> = {}
  for (const m of closed) {
    result[m.id] = tallyMotm(votesBy[m.id] ?? [], lineupBy[m.id] ?? [], winningTeam(m.score_a, m.score_b)).winners
  }
  return result
}

export function getMotmWinnersByMatch(matchIds: string[]): Promise<Record<string, string[]>> {
  return computeWinners(matchIds)
}

// match_id -> vincitori per tutte le partite chiuse, senza lista id nell'URL.
export function getAllMotmWinners(): Promise<Record<string, string[]>> {
  return computeWinners()
}

// player_id -> numero di MOTM vinti.
export async function getMotmCounts(season: SeasonKey = 'all', at: Date = new Date()): Promise<Record<string, number>> {
  const winners = await computeWinners(undefined, season, at)
  const counts: Record<string, number> = {}
  for (const ids of Object.values(winners)) {
    for (const id of ids) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

export type MotmCountsSnapshot = {
  counts: Record<string, number>
  /** Quando chiude il prossimo voto ancora aperto: da li' in poi questi conteggi sono vecchi. null se nessuno e' aperto. */
  staleAt: string | null
}

// Conteggi da tenere in cache: un voto che si chiude da solo non passa da nessun salvataggio,
// quindi chi li riusa deve sapere fino a quando valgono (vedi cachedMotmCounts).
export async function getMotmCountsSnapshot(season: SeasonKey = 'all'): Promise<MotmCountsSnapshot> {
  const at = new Date()
  const [counts, next] = await Promise.all([
    getMotmCounts(season, at),
    createAdminClient()
      .from('matches')
      .select('motm_closes_at')
      .gt('motm_closes_at', at.toISOString())
      .order('motm_closes_at', { ascending: true })
      .limit(1),
  ])
  if (next.error) throw new Error(next.error.message)
  return { counts, staleAt: (next.data?.[0]?.motm_closes_at as string | undefined) ?? null }
}
