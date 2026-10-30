// app/admin/accounts/actions.ts
'use server'
import { randomInt } from 'crypto'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const GENERIC_ERROR = 'Operazione non riuscita'
const SESSION_ERROR = 'Sessione admin scaduta, accedi di nuovo'
// Alfabeto senza caratteri ambigui (0/O, 1/l/I)
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

// Le action rispondono sempre con un errore leggibile, mai con un'eccezione verso l'error boundary
async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin()
    return true
  } catch {
    return false
  }
}

function revalidateAccounts(playerVisibilityChanged: boolean) {
  revalidatePath('/admin/accounts')
  if (playerVisibilityChanged) {
    revalidatePath('/players')
    revalidatePath('/stats')
    revalidatePath('/')
  }
}

async function getAccount(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('player_accounts')
    .select('player_id, is_new_player')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as { player_id: string; is_new_player: boolean } | null
}

// Elimina anche l'utente auth, cosi' la persona puo' registrarsi di nuovo con la stessa email
async function deleteAuthUser(userId: string) {
  const { error } = await createAdminClient().auth.admin.deleteUser(userId)
  if (error) {
    console.error('deleteUser failed', error)
    throw new Error(error.message)
  }
}

export async function approveAccount(userId: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: SESSION_ERROR }
  const supabase = createAdminClient()
  try {
    const account = await getAccount(userId)
    if (!account) return { error: GENERIC_ERROR }

    const { error } = await supabase
      .from('player_accounts')
      .update({ status: 'approved' })
      .eq('user_id', userId)
    if (error) {
      if (error.code === '23505') return { error: 'Questo giocatore ha già un account collegato' }
      throw new Error(error.message)
    }

    if (account.is_new_player) {
      const { error: pErr } = await supabase
        .from('players')
        .update({ is_active: true })
        .eq('id', account.player_id)
      if (pErr) {
        // Non lasciare l'account approvato con il giocatore ancora nascosto: la richiesta torna in lista
        const { error: rErr } = await supabase
          .from('player_accounts')
          .update({ status: 'pending' })
          .eq('user_id', userId)
        if (rErr) console.error('approveAccount revert failed', rErr)
        throw new Error(pErr.message)
      }
    }
  } catch (e) {
    console.error('approveAccount failed', e)
    return { error: GENERIC_ERROR }
  }
  revalidateAccounts(true)
  return {}
}

export async function rejectAccount(userId: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: SESSION_ERROR }
  const supabase = createAdminClient()
  let isNewPlayer: boolean
  try {
    const account = await getAccount(userId)
    if (!account) return {}
    isNewPlayer = account.is_new_player

    // Prima l'utente auth: la cascata elimina la riga player_accounts. Se fallisce nulla e' cambiato e si puo' riprovare.
    await deleteAuthUser(userId)

    if (account.is_new_player) {
      // Solo se e' ancora inattivo: un giocatore gia' approvato non va toccato
      const { error: pErr } = await supabase
        .from('players')
        .delete()
        .eq('id', account.player_id)
        .eq('is_active', false)
      // Un giocatore inattivo orfano e' innocuo: non blocchiamo l'operazione
      if (pErr) console.error('rejectAccount: player cleanup failed', pErr)
    }
  } catch (e) {
    console.error('rejectAccount failed', e)
    return { error: GENERIC_ERROR }
  }
  revalidateAccounts(isNewPlayer)
  return {}
}

export async function unlinkAccount(userId: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: SESSION_ERROR }
  try {
    // La cascata auth.users -> player_accounts elimina anche la riga
    await deleteAuthUser(userId)
  } catch (e) {
    console.error('unlinkAccount failed', e)
    return { error: GENERIC_ERROR }
  }
  revalidateAccounts(false)
  return {}
}

export async function resetAccountPassword(userId: string): Promise<{ tempPassword?: string; error?: string }> {
  if (!(await isAdmin())) return { error: SESSION_ERROR }
  const tempPassword = Array.from({ length: 12 }, () => PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)]).join('')
  const { error } = await createAdminClient().auth.admin.updateUserById(userId, { password: tempPassword })
  if (error) {
    console.error('resetAccountPassword failed', error)
    return { error: GENERIC_ERROR }
  }
  return { tempPassword }
}
