// app/profilo/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
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
  return {}
}

export type HeaderCard =
  | { status: 'approved'; name: string; card_url: string | null; position: string | null }
  | { status: 'pending' }

// Dati minimi per l'ingresso nell'header (BottomTabBar). Null se non loggato o senza account.
// Finche' l'admin non approva, la card del giocatore richiesto non viene mostrata come propria.
export async function getHeaderCard(): Promise<HeaderCard | null> {
  const session = await getSessionAccount()
  if (!session?.account || !session.player) return null
  if (session.account.status !== 'approved') return { status: 'pending' }
  const { name, card_url, position } = session.player
  return { status: 'approved', name, card_url, position }
}
