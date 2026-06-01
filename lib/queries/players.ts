// lib/queries/players.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Player, PlayerWithStats, MatchWithPlayers } from '@/lib/types'

export async function getAllPlayers(): Promise<Player[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getPlayersWithStats(): Promise<PlayerWithStats[]> {
  const supabase = createClient()

  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (pErr) throw new Error(pErr.message)

  const { data: mp, error: mpErr } = await supabase
    .from('match_players')
    .select('player_id, goals')
  if (mpErr) throw new Error(mpErr.message)

  return players.map((p) => {
    const rows = mp.filter((r) => r.player_id === p.id)
    return {
      ...p,
      total_goals: rows.reduce((sum, r) => sum + r.goals, 0),
      total_appearances: rows.length,
    }
  })
}

export async function updatePlayerName(id: string, name: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updatePlayerCardUrl(id: string, card_url: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').update({ card_url }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getPlayerProfile(id: string): Promise<{
  player: PlayerWithStats
  matches: (MatchWithPlayers & { goals: number })[]
} | null> {
  const supabase = createClient()

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !player) return null

  // Fetch player's match_players rows
  const { data: mpRows } = await supabase
    .from('match_players')
    .select('match_id, goals, team')
    .eq('player_id', id)

  const allMp = mpRows ?? []
  const total_goals = allMp.reduce((s, r) => s + r.goals, 0)
  const total_appearances = allMp.length

  // Fetch the full match data for each match
  const matchIds = allMp.map(r => r.match_id)
  let matches: (MatchWithPlayers & { goals: number })[] = []

  if (matchIds.length > 0) {
    const { data: matchData } = await supabase
      .from('matches')
      .select('*, match_players(*, player:players(*))')
      .in('id', matchIds)
      .eq('is_upcoming', false)
      .order('played_at', { ascending: false })

    matches = (matchData ?? []).map(m => {
      const mp = allMp.find(r => r.match_id === m.id)
      return {
        ...(m as unknown as MatchWithPlayers),
        goals: mp?.goals ?? 0,
        playerTeam: mp?.team ?? null,
      }
    })
  }

  return {
    player: { ...player, total_goals, total_appearances },
    matches,
  }
}
