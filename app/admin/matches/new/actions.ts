'use server'
import { createMatch } from '@/lib/queries/matches'

export async function saveNewMatch(
  data: Parameters<typeof createMatch>[0]
): Promise<void> {
  await createMatch(data)
}
