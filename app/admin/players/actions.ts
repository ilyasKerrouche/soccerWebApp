'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SEASON_DATA_TAG } from '@/lib/queries/cached'
import { requireAdmin } from '@/lib/auth'
import { updatePlayerName, storePlayerCard } from '@/lib/queries/players'
import { cardFileError } from '@/lib/cardFile'
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

export async function uploadPlayerCard(id: string, formData: FormData): Promise<void> {
  await requireAdmin()
  const file = formData.get('card') as File
  if (!file) throw new Error('Nessun file selezionato')
  const error = cardFileError(file)
  if (error) throw new Error(error)
  await storePlayerCard(id, file)

  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidateTag(SEASON_DATA_TAG)
  revalidatePath('/')
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
