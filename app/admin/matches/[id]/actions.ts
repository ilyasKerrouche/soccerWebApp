'use server'
import { updateMatch, deleteMatch } from '@/lib/queries/matches'
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
