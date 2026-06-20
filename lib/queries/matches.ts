// lib/queries/matches.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Match, MatchWithPlayers } from '@/lib/types'

export async function getAllMatches(): Promise<Match[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('played_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getAllMatchesWithPlayers(): Promise<MatchWithPlayers[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_players(*, player:players(*))')
    .order('played_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as MatchWithPlayers[]
}

export async function getMatchById(id: string): Promise<MatchWithPlayers> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_players(*, player:players(*))')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as MatchWithPlayers
}

export async function getLastMatch(): Promise<MatchWithPlayers | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('*, match_players(*, player:players(*))')
    .eq('is_upcoming', false)
    .order('played_at', { ascending: false })
    .limit(1)
    .single()
  return (data as MatchWithPlayers) ?? null
}

export async function getNextMatch(): Promise<MatchWithPlayers | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('*, match_players(*, player:players(*))')
    .eq('is_upcoming', true)
    .order('played_at', { ascending: true })
    .limit(1)
    .single()
  return (data as MatchWithPlayers) ?? null
}

export async function createMatch(formData: {
  played_at: string
  match_time?: string | null
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  players: { player_id: string; team: 'a' | 'b'; goals: number; own_goals: number }[]
}): Promise<string> {
  'use server'
  const supabase = createAdminClient()

  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      played_at: formData.played_at,
      match_time: formData.match_time ?? null,
      team_a_name: formData.team_a_name,
      team_b_name: formData.team_b_name,
      score_a: formData.score_a,
      score_b: formData.score_b,
      is_upcoming: formData.is_upcoming,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  if (formData.players.length > 0) {
    const { error: mpErr } = await supabase.from('match_players').insert(
      formData.players.map((p) => ({ ...p, match_id: match.id }))
    )
    if (mpErr) throw new Error(mpErr.message)
  }

  return match.id
}

export async function updateMatch(
  id: string,
  formData: {
    played_at: string
    match_time?: string | null
    team_a_name: string
    team_b_name: string
    score_a: number | null
    score_b: number | null
    is_upcoming: boolean
    players: { player_id: string; team: 'a' | 'b'; goals: number; own_goals: number }[]
  }
): Promise<void> {
  'use server'
  const supabase = createAdminClient()

  const { error } = await supabase.from('matches').update({
    played_at: formData.played_at,
    match_time: formData.match_time ?? null,
    team_a_name: formData.team_a_name,
    team_b_name: formData.team_b_name,
    score_a: formData.score_a,
    score_b: formData.score_b,
    is_upcoming: formData.is_upcoming,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  await supabase.from('match_players').delete().eq('match_id', id)

  if (formData.players.length > 0) {
    const { error: mpErr } = await supabase.from('match_players').insert(
      formData.players.map((p) => ({ ...p, match_id: id }))
    )
    if (mpErr) throw new Error(mpErr.message)
  }
}

export async function deleteMatch(id: string): Promise<void> {
  'use server'
  const supabase = createAdminClient()
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
