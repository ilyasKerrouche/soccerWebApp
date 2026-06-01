// lib/types.ts

export type Player = {
  id: string
  name: string
  position: string | null
  ovr: number | null
  card_url: string | null
  created_at: string
}

export type Match = {
  id: string
  played_at: string
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  created_at: string
}

export type MatchPlayer = {
  id: string
  match_id: string
  player_id: string
  team: 'a' | 'b'
  goals: number
}

export type MatchWithPlayers = Match & {
  match_players: (MatchPlayer & { player: Player })[]
}

export type PlayerWithStats = Player & {
  total_goals: number
  total_appearances: number
}
