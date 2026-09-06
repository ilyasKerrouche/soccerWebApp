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
  match_time: string | null
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
  own_goals: number
}

export type MatchWithPlayers = Match & {
  match_players: (MatchPlayer & { player: Player })[]
}

export type PlayerWithStats = Player & {
  total_goals: number
  total_appearances: number
  scoring_streak: number
  // Statistiche congelate a prima dell'ultima giornata giocata, usate per
  // calcolare il movimento in classifica. Assenti fuori dalla classifica.
  prev_goals?: number
  prev_appearances?: number
}

export type AvailabilityVote = {
  id: string
  match_id: string
  vote_date: string
  voter_name: string
  created_at: string
}

export type GoalkeeperStats = {
  goals_conceded: number
  clean_sheets: number
  appearances: number
  avg_conceded: number
}

export type PlayerWithGoalkeeperStats = Player & GoalkeeperStats
