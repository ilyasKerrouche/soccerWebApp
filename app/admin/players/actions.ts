'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SEASON_DATA_TAG } from '@/lib/queries/cached'
import { requireAdmin } from '@/lib/auth'
import { updatePlayerName, storePlayerCard } from '@/lib/queries/players'
import { cardFileError, UNSUPPORTED_FORMAT } from '@/lib/cardFile'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createPlayer(formData: FormData): Promise<void> {
  await requireAdmin()
  const name = (formData.get('name') as string)?.trim()
  const position = (formData.get('position') as string)?.trim() || null
  const ovr = formData.get('ovr') ? Number(formData.get('ovr')) : null
  if (!name) throw new Error('Nome obbligatorio')
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').insert({ name, position, ovr })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidateTag(SEASON_DATA_TAG)
}

export async function savePlayerName(id: string, name: string): Promise<void> {
  await requireAdmin()
  await updatePlayerName(id, name.trim())
  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidateTag(SEASON_DATA_TAG)
}

// Gli errori sul file tornano come testo: in produzione il messaggio di un'eccezione non arriva al client
export async function uploadPlayerCard(id: string, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()
  const file = formData.get('card')
  if (!(file instanceof File)) return { error: 'Nessun file selezionato' }
  const error = cardFileError(file)
  if (error) return { error }
  try {
    await storePlayerCard(id, file)
  } catch (e) {
    if (e instanceof Error && e.message === UNSUPPORTED_FORMAT) return { error: UNSUPPORTED_FORMAT }
    throw e
  }

  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidateTag(SEASON_DATA_TAG)
  revalidatePath('/')
  return {}
}

export async function updatePlayerPosition(id: string, position: string | null): Promise<void> {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').update({ position }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidateTag(SEASON_DATA_TAG)
  revalidatePath(`/players/${id}`)
}
