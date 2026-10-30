// lib/session.ts
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAccountByUser } from '@/lib/queries/accounts'
import type { Player, PlayerAccount } from '@/lib/types'

export type SessionAccount = {
  userId: string
  email: string
  account: PlayerAccount | null
  player: Player | null
}

// null se non loggato. getUser() valida il token lato Auth (getSession() no).
export async function getSessionAccount(): Promise<SessionAccount | null> {
  const { data: { user } } = await createAuthClient().auth.getUser()
  if (!user) return null

  const account = await getAccountByUser(user.id)
  let player: Player | null = null
  if (account) {
    const { data } = await createAdminClient()
      .from('players')
      .select('*')
      .eq('id', account.player_id)
      .maybeSingle()
    player = (data as Player | null) ?? null
  }
  return { userId: user.id, email: user.email ?? '', account, player }
}
