'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AvailabilityVote } from '@/lib/types'

export async function toggleVote(
  matchId: string,
  voteDate: string,
  voterName: string
): Promise<AvailabilityVote[]> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('availability_votes')
    .select('id')
    .eq('match_id', matchId)
    .eq('vote_date', voteDate)
    .eq('voter_name', voterName)
    .single()

  if (existing) {
    await supabase.from('availability_votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('availability_votes').insert({ match_id: matchId, vote_date: voteDate, voter_name: voterName })
  }

  const { data } = await supabase
    .from('availability_votes')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  revalidatePath('/')
  return (data ?? []) as AvailabilityVote[]
}

export async function getVotesAction(matchId: string): Promise<AvailabilityVote[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('availability_votes')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
  return (data ?? []) as AvailabilityVote[]
}
