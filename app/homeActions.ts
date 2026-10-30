// app/homeActions.ts
'use server'
import { cookies } from 'next/headers'
import { getSessionAccount } from '@/lib/session'
import { getMyVote } from '@/lib/queries/motm'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken } from '@/lib/auth'
import type { HomeViewer } from '@/lib/homeText'

const ANON: HomeViewer = { kind: 'anon', playerId: null, inLineup: false, voted: false }

// Chi sta guardando la home: la pagina e' in cache per tutti, i dati personali arrivano da qui.
// Restituisce solo se l'utente ha votato, mai per chi. null se non si riesce a saperlo.
export async function getHomeViewer(matchId: string | null): Promise<HomeViewer | null> {
  try {
    const session = await getSessionAccount()
    if (session?.account?.status === 'approved') {
      const playerId = session.account.player_id
      if (!matchId) return { kind: 'player', playerId, inLineup: false, voted: false }
      const [{ data: row, error }, vote] = await Promise.all([
        createAdminClient().from('match_players').select('id').eq('match_id', matchId).eq('player_id', playerId).maybeSingle(),
        getMyVote(matchId, playerId),
      ])
      if (error) throw new Error(error.message)
      return { kind: 'player', playerId, inLineup: row !== null, voted: vote !== null }
    }
    if (session?.account) return { ...ANON, kind: 'pending' }

    const adminToken = cookies().get('calc_admin')?.value
    if (adminToken && (await verifyAdminToken(adminToken))) return { ...ANON, kind: 'admin' }
    return ANON
  } catch (e) {
    console.error('getHomeViewer failed', e)
    return null
  }
}
