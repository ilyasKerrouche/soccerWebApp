// lib/queries/motm.ts
// motm_votes ha RLS senza policy: ogni accesso passa dal service role.
// Questi dati non vanno mai restituiti ai client: chi ha votato chi e' privato.
import { createAdminClient } from '@/lib/supabase/admin'
import { tallyMotm, type VoteRow } from '@/lib/motm'

export async function getVotesForMatch(matchId: string): Promise<VoteRow[]> {
  const { data, error } = await createAdminClient()
    .from('motm_votes')
    .select('voter_player_id, voted_player_id')
    .eq('match_id', matchId)
  if (error) throw new Error(error.message)
  return (data ?? []) as VoteRow[]
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

// Vincitori (id giocatore) delle sole partite con voto chiuso. Tre query in
// tutto, indipendentemente dal numero di partite.
export async function getMotmWinnersByMatch(matchIds: string[]): Promise<Record<string, string[]>> {
  if (matchIds.length === 0) return {}
  const supabase = createAdminClient()

  const { data: closed, error: e1 } = await supabase
    .from('matches')
    .select('id')
    .in('id', matchIds)
    .lt('motm_closes_at', new Date().toISOString())
  if (e1) throw new Error(e1.message)
  const closedIds = (closed ?? []).map(m => m.id as string)
  if (closedIds.length === 0) return {}

  const [votesRes, lineupRes] = await Promise.all([
    supabase.from('motm_votes').select('match_id, voter_player_id, voted_player_id').in('match_id', closedIds),
    supabase.from('match_players').select('match_id, player_id').in('match_id', closedIds),
  ])
  if (votesRes.error) throw new Error(votesRes.error.message)
  if (lineupRes.error) throw new Error(lineupRes.error.message)

  const votesBy: Record<string, VoteRow[]> = {}
  for (const v of votesRes.data ?? []) (votesBy[v.match_id] ??= []).push(v as VoteRow)
  const lineupBy: Record<string, string[]> = {}
  for (const l of lineupRes.data ?? []) (lineupBy[l.match_id] ??= []).push(l.player_id as string)

  const result: Record<string, string[]> = {}
  for (const id of closedIds) {
    result[id] = tallyMotm(votesBy[id] ?? [], lineupBy[id] ?? []).winners
  }
  return result
}
