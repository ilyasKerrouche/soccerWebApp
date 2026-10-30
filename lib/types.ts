// lib/types.ts
import type { PlayerRecord } from '@/lib/rating'

export type Player = {
  id: string
  name: string
  position: string | null
  ovr: number | null
  card_url: string | null
  is_active: boolean
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
  motm_eligible: boolean
  motm_closes_at: string | null
  created_at: string
}

export type PlayerAccount = {
  user_id: string
  player_id: string
  status: 'pending' | 'approved' | 'rejected'
  is_new_player: boolean
  created_at: string
}

export type MotmVote = {
  id: string
  match_id: string
  voter_player_id: string
  voted_player_id: string
  created_at: string
  updated_at: string
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
  // Vittorie, pareggi, sconfitte e form recente. Assente dove non serve.
  record?: PlayerRecord
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

// Statistiche mostrate toccando una card sul campo della home e in "Il tuo riepilogo".
export type PlayerHomeStats = {
  goals: number
  appearances: number
  /** Da 0 a 1, null se non ha mai giocato. */
  winRate: number | null
  motm: number
  form: PlayerRecord['form']
}
