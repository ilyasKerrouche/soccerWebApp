// app/profilo/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { getSessionAccount } from '@/lib/session'
import { storePlayerCard } from '@/lib/queries/players'
import { cardFileError } from '@/lib/cardFile'

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
    return { error: e instanceof Error ? e.message : 'Caricamento non riuscito' }
  }

  revalidatePath('/')
  revalidatePath('/players')
  revalidatePath('/players/[id]', 'page')
  revalidatePath('/profilo')
  return {}
}

// Dati minimi per l'ingresso nell'header (BottomTabBar). Null se non loggato o senza account.
export async function getHeaderCard(): Promise<{
  name: string
  card_url: string | null
  position: string | null
} | null> {
  const session = await getSessionAccount()
  if (!session?.account || !session.player) return null
  const { name, card_url, position } = session.player
  return { name, card_url, position }
}
