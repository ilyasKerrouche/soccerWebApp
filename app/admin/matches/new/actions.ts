'use server'
import { revalidateTag } from 'next/cache'
import { SEASON_DATA_TAG } from '@/lib/queries/cached'
import { createMatch } from '@/lib/queries/matches'
import { requireAdmin } from '@/lib/auth'

export async function saveNewMatch(
  data: Parameters<typeof createMatch>[0]
): Promise<void> {
  await requireAdmin()
  await createMatch(data)
  revalidateTag(SEASON_DATA_TAG)
}
