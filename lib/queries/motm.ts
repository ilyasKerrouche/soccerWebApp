// lib/queries/motm.ts
// motm_votes ha RLS senza policy: ogni accesso passa dal service role.
// Questi dati non vanno mai restituiti ai client: chi ha votato chi e' privato.
import { createAdminClient } from '@/lib/supabase/admin'
import { tallyMotm, type VoteRow } from '@/lib/motm'
import { inSeason, type SeasonKey } from '@/lib/season'

const PAGE = 1000

// PostgREST taglia le risposte a 1000 righe: si legge a pagine finche' una e' corta.
async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) return rows
  }
}

export async function getVotesForMatch(matchId: string): Promise<VoteRow[]> {
  const supabase = createAdminClient()
  return fetchAll<VoteRow>((from, to) =>
    supabase
      .from('motm_votes')
      .select('voter_player_id, voted_player_id')
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

// Vincitori (id giocatore) delle sole partite con voto chiuso. Senza matchIds
// copre tutte le partite chiuse (nessuna lista id nell'URL). Poche query in
// tutto, indipendentemente dal numero di partite.
async function computeWinners(matchIds?: string[], season: SeasonKey = 'all'): Promise<Record<string, string[]>> {
  if (matchIds && matchIds.length === 0) return {}
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const closedAll = await fetchAll<{ id: string; played_at: string }>((from, to) => {
    let q = supabase.from('matches').select('id, played_at').lt('motm_closes_at', now)
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
      let q = supabase.from('motm_votes').select('match_id, voter_player_id, voted_player_id')
      if (matchIds) q = q.in('match_id', closedIds)
      return q.order('id').range(from, to)
    }),
    fetchAll<{ match_id: string; player_id: string }>((from, to) => {
      let q = supabase.from('match_players').select('match_id, player_id')
      if (matchIds) q = q.in('match_id', closedIds)
      return q.order('id').range(from, to)
    }),
  ])

  const votesBy: Record<string, VoteRow[]> = {}
  for (const v of votes) if (closedSet.has(v.match_id)) (votesBy[v.match_id] ??= []).push(v)
  const lineupBy: Record<string, string[]> = {}
  for (const l of lineup) if (closedSet.has(l.match_id)) (lineupBy[l.match_id] ??= []).push(l.player_id)

  const result: Record<string, string[]> = {}
  for (const id of closedIds) {
    result[id] = tallyMotm(votesBy[id] ?? [], lineupBy[id] ?? []).winners
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

// player_id -> numero di MOTM vinti (un co-MOTM conta 1 per ciascun vincitore).
export async function getMotmCounts(season: SeasonKey = 'all'): Promise<Record<string, number>> {
  const winners = await computeWinners(undefined, season)
  const counts: Record<string, number> = {}
  for (const ids of Object.values(winners)) {
    for (const id of ids) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}
