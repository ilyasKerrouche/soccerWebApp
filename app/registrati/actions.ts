// app/registrati/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signUpAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const mode = String(formData.get('mode') ?? '')

  if (!email) return { error: 'Inserisci la tua email' }
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri' }
  if (mode !== 'existing' && mode !== 'new') return { error: 'Scegli come registrarti' }

  const playerId = String(formData.get('player_id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const position = String(formData.get('position') ?? '').trim()
  if (mode === 'existing' && !playerId) return { error: 'Scegli il tuo nome dall\'elenco' }
  if (mode === 'new' && !name) return { error: 'Inserisci il tuo nome' }

  const admin = createAdminClient()

  // Non ci si fida dell'elenco lato client: il giocatore deve essere attivo e libero adesso
  if (mode === 'existing') {
    const { data: player, error: pErr } = await admin
      .from('players')
      .select('id')
      .eq('id', playerId)
      .eq('is_active', true)
      .maybeSingle()
    if (pErr) return { error: 'Errore, riprova tra poco' }
    if (!player) return { error: 'Giocatore non disponibile' }

    const { data: taken, error: tErr } = await admin
      .from('player_accounts')
      .select('user_id')
      .eq('player_id', playerId)
      .in('status', ['approved', 'pending'])
      .limit(1)
    if (tErr) return { error: 'Errore, riprova tra poco' }
    if (taken && taken.length > 0) return { error: 'Questo giocatore è già stato collegato a un account' }
  }

  const auth = createAuthClient()
  const { data, error } = await auth.auth.signUp({ email, password })
  if (error || !data.user) {
    return { error: error?.message ?? 'Registrazione non riuscita' }
  }
  const userId = data.user.id

  // Se un passo dopo il signUp fallisce, l'utente auth non deve restare orfano
  const rollback = async (createdPlayerId?: string) => {
    if (createdPlayerId) await admin.from('players').delete().eq('id', createdPlayerId)
    await admin.auth.admin.deleteUser(userId)
    await auth.auth.signOut()
  }

  let linkedPlayerId = playerId
  if (mode === 'new') {
    const { data: created, error: insErr } = await admin
      .from('players')
      .insert({ name, position: position || null, is_active: false })
      .select('id')
      .single()
    if (insErr || !created) {
      await rollback()
      return { error: 'Registrazione non riuscita, riprova' }
    }
    linkedPlayerId = created.id as string
  }

  const { error: accErr } = await admin.from('player_accounts').insert({
    user_id: userId,
    player_id: linkedPlayerId,
    status: 'pending',
    is_new_player: mode === 'new',
  })
  if (accErr) {
    await rollback(mode === 'new' ? linkedPlayerId : undefined)
    return { error: 'Registrazione non riuscita, riprova' }
  }

  redirect('/profilo')
}
