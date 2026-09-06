// lib/queries/players.ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeRecord } from '@/lib/rating'
import type { Player, PlayerWithStats, MatchWithPlayers, GoalkeeperStats, PlayerWithGoalkeeperStats } from '@/lib/types'

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
    .select('player_id, goals, team, match:matches(played_at, is_upcoming, score_a, score_b)')
  if (mpErr) throw new Error(mpErr.message)

  type MpRow = {
    player_id: string
    goals: number
    team: 'a' | 'b'
    match: { played_at: string; is_upcoming: boolean; score_a: number | null; score_b: number | null } | null
  }
  const completedMp = (mp as unknown as MpRow[]).filter(r => r.match && !r.match.is_upcoming)

  // Giornata più recente giocata: le partite dello stesso giorno contano come
  // un'unica giornata. Serve a ricostruire la classifica "di prima" per il movimento.
  const matchday = (r: MpRow) => r.match!.played_at.slice(0, 10)
  const lastMatchday = completedMp.reduce((max, r) => (matchday(r) > max ? matchday(r) : max), '')
  const previousMp = completedMp.filter((r) => matchday(r) < lastMatchday)

  return players.map((p) => {
    const rows = completedMp.filter((r) => r.player_id === p.id)
    const total_goals = rows.reduce((sum, r) => sum + r.goals, 0)
    const total_appearances = rows.length

    const prevRows = previousMp.filter((r) => r.player_id === p.id)
    const prev_goals = prevRows.reduce((sum, r) => sum + r.goals, 0)
    const prev_appearances = prevRows.length

    const sorted = [...rows].sort((a, b) =>
      new Date(b.match!.played_at).getTime() - new Date(a.match!.played_at).getTime()
    )
    let scoring_streak = 0
    for (const row of sorted) {
      if (row.goals > 0) scoring_streak++
      else break
    }

    const record = computeRecord(
      rows.map((r) => ({
        team: r.team,
        score_a: r.match!.score_a,
        score_b: r.match!.score_b,
        played_at: r.match!.played_at,
      }))
    )

    return { ...p, total_goals, total_appearances, scoring_streak, prev_goals, prev_appearances, record }
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
  matches: (MatchWithPlayers & { goals: number; own_goals: number })[]
  goalkeeper_stats?: GoalkeeperStats
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
    .select('match_id, goals, own_goals, team')
    .eq('player_id', id)

  const allMp = mpRows ?? []
  const total_goals = allMp.reduce((s, r) => s + r.goals, 0)
  const total_appearances = allMp.length

  // Fetch the full match data for each match
  const matchIds = allMp.map(r => r.match_id)
  let matches: (MatchWithPlayers & { goals: number; own_goals: number })[] = []

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
        own_goals: mp?.own_goals ?? 0,
        playerTeam: mp?.team ?? null,
      }
    })
  }

  let goalkeeper_stats: GoalkeeperStats | undefined
  if (player.position === 'GK' && matches.length > 0) {
    let goals_conceded = 0
    let clean_sheets = 0
    for (const m of matches) {
      const team = (m as unknown as { playerTeam: 'a' | 'b' | null }).playerTeam
      const conceded = team === 'a' ? (m.score_b ?? 0) : (m.score_a ?? 0)
      goals_conceded += conceded
      if (conceded === 0) clean_sheets++
    }
    const appearances = matches.length
    goalkeeper_stats = {
      goals_conceded,
      clean_sheets,
      appearances,
      avg_conceded: Math.round((goals_conceded / appearances) * 10) / 10,
    }
  }

  // Il record si ricava dalle partite gia' caricate: hanno squadra e punteggio,
  // gli stessi dati usati per le statistiche del portiere.
  const record = computeRecord(
    matches
      .map((m) => ({
        team: (m as unknown as { playerTeam: 'a' | 'b' | null }).playerTeam,
        score_a: m.score_a,
        score_b: m.score_b,
        played_at: m.played_at,
      }))
      // Senza squadra non si puo' dire chi ha vinto: meglio escludere che indovinare.
      .filter((r): r is { team: 'a' | 'b'; score_a: number | null; score_b: number | null; played_at: string } => r.team !== null)
  )

  return {
    player: { ...player, total_goals, total_appearances, record },
    matches,
    goalkeeper_stats,
  }
}

export async function getGoalkeeperRanking(): Promise<PlayerWithGoalkeeperStats[]> {
  const supabase = createClient()

  const { data: gkPlayers, error: pErr } = await supabase
    .from('players')
    .select('*')
    .eq('position', 'GK')
  if (pErr) throw new Error(pErr.message)
  if (!gkPlayers || gkPlayers.length === 0) return []

  const gkIds = gkPlayers.map(p => p.id)

  const { data: mpRows, error: mpErr } = await supabase
    .from('match_players')
    .select('player_id, team, match_id')
    .in('player_id', gkIds)
  if (mpErr) throw new Error(mpErr.message)

  const allMp = mpRows ?? []
  const matchIds = Array.from(new Set(allMp.map(r => r.match_id)))

  const matchMap: Record<string, { score_a: number | null; score_b: number | null }> = {}
  if (matchIds.length > 0) {
    const { data: matchData, error: matchErr } = await supabase
      .from('matches')
      .select('id, score_a, score_b')
      .in('id', matchIds)
      .eq('is_upcoming', false)
    if (matchErr) throw new Error(matchErr.message)
    for (const m of matchData ?? []) {
      matchMap[m.id] = { score_a: m.score_a, score_b: m.score_b }
    }
  }

  const completedMp = allMp.filter(r => matchMap[r.match_id] !== undefined)

  const result = gkPlayers.map(p => {
    const playerRows = completedMp.filter(r => r.player_id === p.id)
    const appearances = playerRows.length
    let goals_conceded = 0
    let clean_sheets = 0
    for (const r of playerRows) {
      const m = matchMap[r.match_id]
      const conceded = r.team === 'a' ? (m.score_b ?? 0) : (m.score_a ?? 0)
      goals_conceded += conceded
      if (conceded === 0) clean_sheets++
    }
    const avg_conceded = appearances > 0 ? Math.round((goals_conceded / appearances) * 10) / 10 : 0
    return { ...p, goals_conceded, clean_sheets, appearances, avg_conceded }
  })

  return result.sort((a, b) => {
    if (a.appearances === 0 && b.appearances === 0) return 0
    if (a.appearances === 0) return 1
    if (b.appearances === 0) return -1
    return a.avg_conceded - b.avg_conceded
  })
}
