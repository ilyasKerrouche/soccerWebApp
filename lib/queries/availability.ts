import { unstable_noStore as noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AvailabilityVote } from '@/lib/types'

export async function getVotesForMatch(matchId: string): Promise<AvailabilityVote[]> {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('availability_votes')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}
