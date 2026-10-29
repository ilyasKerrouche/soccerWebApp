// lib/queries/accounts.ts
// player_accounts ha RLS senza policy: ogni lettura passa dal service role.
import { createAdminClient } from '@/lib/supabase/admin'
import type { Player, PlayerAccount } from '@/lib/types'

type AccountWithPlayer = PlayerAccount & { email: string; player: Player }

export async function getAccountByUser(userId: string): Promise<PlayerAccount | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('player_accounts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as PlayerAccount | null) ?? null
}

async function listAccountsByStatus(status: PlayerAccount['status']): Promise<AccountWithPlayer[]> {
  const supabase = createAdminClient()
  // Include anche i giocatori non attivi: i nuovi iscritti nascono inattivi
  const { data } = await supabase
    .from('player_accounts')
    .select('*, player:players(*)')
    .eq('status', status)
    .order('created_at', { ascending: true })
  const rows = (data ?? []) as (PlayerAccount & { player: Player })[]

  return Promise.all(
    rows.map(async row => {
      const { data: u } = await supabase.auth.admin.getUserById(row.user_id)
      return { ...row, email: u?.user?.email ?? '' }
    })
  )
}

export function listPendingAccounts() {
  return listAccountsByStatus('pending')
}

export function listApprovedAccounts() {
  return listAccountsByStatus('approved')
}

// Quali tra i giocatori indicati hanno un account approvato (possono votare / essere votati)
export async function getApprovedPlayerIds(playerIds: string[]): Promise<string[]> {
  if (playerIds.length === 0) return []
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('player_accounts')
    .select('player_id')
    .eq('status', 'approved')
    .in('player_id', playerIds)
  return (data ?? []).map(r => r.player_id as string)
}
