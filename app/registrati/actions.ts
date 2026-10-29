// app/registrati/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function signUpErrorMessage(error: { code?: string } | null): string {
  switch (error?.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'Esiste già un account con questa email: accedi o recupera la password'
    case 'weak_password':
      return 'Password troppo debole (minimo 8 caratteri)'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Troppi tentativi, riprova tra qualche minuto'
    default:
      console.error('signUp failed', error)
      return 'Registrazione non riuscita, riprova'
  }
}

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
  if (mode === 'new' && name.length > 40) return { error: 'Il nome può avere al massimo 40 caratteri' }
  if (mode === 'new' && position.length > 10) return { error: 'Il ruolo può avere al massimo 10 caratteri' }

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
    return { error: signUpErrorMessage(error) }
  }
  const userId = data.user.id

  // Se un passo dopo il signUp fallisce, l'utente auth non deve restare orfano
  const rollback = async (createdPlayerId?: string) => {
    const { error: outErr } = await auth.auth.signOut()
    if (outErr) console.error('signUp rollback: signOut failed', outErr)
    if (createdPlayerId) {
      const { error: delPlayerErr } = await admin.from('players').delete().eq('id', createdPlayerId)
      if (delPlayerErr) console.error('signUp rollback: delete player failed', delPlayerErr)
    }
    const { error: delUserErr } = await admin.auth.admin.deleteUser(userId)
    if (delUserErr) console.error('signUp rollback: delete user failed', delUserErr)
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
