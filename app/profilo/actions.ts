// app/profilo/actions.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SEASON_DATA_TAG } from '@/lib/queries/cached'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { getSessionAccount } from '@/lib/session'
import { storePlayerCard } from '@/lib/queries/players'
import { cardFileError, UNSUPPORTED_FORMAT } from '@/lib/cardFile'

export async function uploadMyCard(formData: FormData): Promise<{ error?: string }> {
  const session = await getSessionAccount()
  if (!session?.account) return { error: 'Devi accedere per caricare la card' }
  if (session.account.status !== 'approved') {
    return { error: 'Il tuo account non è ancora stato approvato' }
  }

  const file = formData.get('card')
  if (!(file instanceof File)) return { error: 'Nessun file selezionato' }
  const fileError = cardFileError(file)
  if (fileError) return { error: fileError }

  try {
    await storePlayerCard(session.account.player_id, file)
  } catch (e) {
    // Il controllo sui primi byte e' un errore dell'utente; il resto (storage, DB) resta nei log
    if (e instanceof Error && e.message === UNSUPPORTED_FORMAT) return { error: UNSUPPORTED_FORMAT }
    console.error('uploadMyCard failed', e)
    return { error: 'Caricamento non riuscito, riprova' }
  }

  revalidatePath('/')
  revalidatePath('/players')
  revalidatePath('/players/[id]', 'page')
  revalidatePath('/profilo')
  revalidateTag(SEASON_DATA_TAG)
  return {}
}

export type HeaderCard =
  | { status: 'admin' }
  | { status: 'approved'; name: string }
  | { status: 'pending' }

// Chi c'e' nell'header (BottomTabBar). Null se non loggato o senza account.
// L'admin ha la precedenza. Finche' l'admin non approva, il nome del giocatore richiesto non viene mostrato come proprio.
export async function getHeaderCard(): Promise<HeaderCard | null> {
  const adminToken = cookies().get('calc_admin')?.value
  if (adminToken && (await verifyAdminToken(adminToken))) return { status: 'admin' }

  const session = await getSessionAccount()
  if (!session?.account || !session.player) return null
  if (session.account.status !== 'approved') return { status: 'pending' }
  return { status: 'approved', name: session.player.name.trim().split(/\s+/)[0] }
}
