// lib/queries/records.ts
import { createPublicClient } from '@/lib/supabase/public'
import { recordNews, type RecordNews, type RMatch } from '@/lib/records'
import { fetchAll } from './paging'

// I record battuti o eguagliati dalla partita `matchId` (vedi recordNews). Legge tutte le partite giocate,
// ma solo le colonne che servono; client senza cookie, cosi' puo' stare in cache (lib/queries/cached.ts).
export async function getRecordNews(matchId: string): Promise<RecordNews[]> {
  const supabase = createPublicClient()
  const matches = await fetchAll<RMatch>((from, to) =>
    supabase
      .from('matches')
      .select('id, played_at, score_a, score_b, is_upcoming, team_a_name, team_b_name, match_players(player_id, team, goals, player:players(id, name))')
      .eq('is_upcoming', false)
      .order('id')
      .range(from, to)
      .returns<RMatch[]>(),
  )
  return recordNews(matches, matchId)
}
