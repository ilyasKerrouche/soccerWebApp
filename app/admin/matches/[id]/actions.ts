'use server'
import { revalidateTag } from 'next/cache'
import { SEASON_DATA_TAG } from '@/lib/queries/cached'
import { updateMatch, deleteMatch, createMatch, getMatchById } from '@/lib/queries/matches'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export async function saveEditMatch(
  id: string,
  data: Parameters<typeof updateMatch>[1]
): Promise<void> {
  await requireAdmin()
  await updateMatch(id, data)
  revalidateTag(SEASON_DATA_TAG)
}

export async function deleteMatchAction(id: string): Promise<void> {
  await requireAdmin()
  await deleteMatch(id)
  revalidateTag(SEASON_DATA_TAG)
  redirect('/admin')
}

export async function duplicateMatchAction(id: string): Promise<void> {
  await requireAdmin()
  const match = await getMatchById(id)
  const newId = await createMatch({
    played_at: new Date().toISOString().split('T')[0],
    team_a_name: match.team_a_name,
    team_b_name: match.team_b_name,
    score_a: null,
    score_b: null,
    is_upcoming: true,
    players: match.match_players.map(mp => ({
      player_id: mp.player_id,
      team: mp.team,
      goals: 0,
      own_goals: 0,
    })),
  })
  revalidateTag(SEASON_DATA_TAG)
  redirect(`/admin/matches/${newId}`)
}
