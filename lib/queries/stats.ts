// lib/queries/stats.ts
import { createClient } from '@/lib/supabase/server'

export type GlobalStats = {
  total_matches: number
  total_goals: number
  total_players: number
  wins_a: number
  wins_b: number
  avg_goals_per_match: number
}

export type MatchGoalPoint = {
  played_at: string
  total_goals: number
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('score_a, score_b, is_upcoming')
    .eq('is_upcoming', false)

  const { count: total_players } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  const played = matches ?? []
  const total_matches = played.length
  const total_goals = played.reduce((s, m) => s + (m.score_a ?? 0) + (m.score_b ?? 0), 0)
  const wins_a = played.filter((m) => (m.score_a ?? 0) > (m.score_b ?? 0)).length
  const wins_b = played.filter((m) => (m.score_b ?? 0) > (m.score_a ?? 0)).length

  return {
    total_matches,
    total_goals,
    total_players: total_players ?? 0,
    wins_a,
    wins_b,
    avg_goals_per_match: total_matches > 0 ? Math.round((total_goals / total_matches) * 10) / 10 : 0,
  }
}

export async function getRecentGoalsPerMatch(limit = 8): Promise<MatchGoalPoint[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('played_at, score_a, score_b')
    .eq('is_upcoming', false)
    .order('played_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((m) => ({
    played_at: m.played_at,
    total_goals: (m.score_a ?? 0) + (m.score_b ?? 0),
  }))
}
