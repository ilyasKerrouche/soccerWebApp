'use server'
import { updateMatch, deleteMatch, createMatch, getMatchById } from '@/lib/queries/matches'
import { redirect } from 'next/navigation'

export async function saveEditMatch(
  id: string,
  data: Parameters<typeof updateMatch>[1]
): Promise<void> {
  await updateMatch(id, data)
}

export async function deleteMatchAction(id: string): Promise<void> {
  await deleteMatch(id)
  redirect('/admin')
}

export async function duplicateMatchAction(id: string): Promise<void> {
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
    })),
  })
  redirect(`/admin/matches/${newId}`)
}
