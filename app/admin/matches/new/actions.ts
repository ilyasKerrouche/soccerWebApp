'use server'
import { createMatch } from '@/lib/queries/matches'
import { requireAdmin } from '@/lib/auth'

export async function saveNewMatch(
  data: Parameters<typeof createMatch>[0]
): Promise<void> {
  await requireAdmin()
  await createMatch(data)
}
