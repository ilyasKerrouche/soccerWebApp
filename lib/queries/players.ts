// lib/queries/players.ts
import { createClient } from '@/lib/supabase/server'
import type { Player, PlayerWithStats } from '@/lib/types'

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
