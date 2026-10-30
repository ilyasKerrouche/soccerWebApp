// app/matches/[id]/motmActions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { getSessionAccount } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { upsertVote } from '@/lib/queries/motm'
import { voteError } from '@/lib/motm'

// Il votante viene sempre dalla sessione; chiusura e formazione si rileggono dal DB.
export async function castVote(matchId: string, votedPlayerId: string): Promise<{ error?: string }> {
  try {
    const session = await getSessionAccount()
    const supabase = createAdminClient()
    const [matchRes, lineupRes] = await Promise.all([
      supabase.from('matches').select('motm_closes_at').eq('id', matchId).maybeSingle(),
      supabase.from('match_players').select('player_id').eq('match_id', matchId),
    ])
    if (matchRes.error) throw new Error(matchRes.error.message)
    if (lineupRes.error) throw new Error(lineupRes.error.message)
    if (!matchRes.data) return { error: 'Partita non trovata' }

    const error = voteError({
      account: session?.account ?? null,
      votedId: votedPlayerId,
      lineupIds: (lineupRes.data ?? []).map(r => r.player_id as string),
      closesAt: matchRes.data.motm_closes_at as string | null,
      now: new Date(),
    })
    if (error) return { error }

    await upsertVote(matchId, session!.account!.player_id, votedPlayerId)
    revalidatePath('/matches/' + matchId)
    return {}
  } catch (e) {
    console.error('castVote failed', e)
    return { error: 'Voto non registrato, riprova' }
  }
}
