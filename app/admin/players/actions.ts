'use server'
import { revalidatePath } from 'next/cache'
import { updatePlayerName, updatePlayerCardUrl } from '@/lib/queries/players'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createPlayer(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string)?.trim()
  const position = (formData.get('position') as string)?.trim() || null
  const ovr = formData.get('ovr') ? Number(formData.get('ovr')) : null
  if (!name) throw new Error('Nome obbligatorio')
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').insert({ name, position, ovr })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
  revalidatePath('/stats')
}

export async function savePlayerName(id: string, name: string): Promise<void> {
  await updatePlayerName(id, name.trim())
  revalidatePath('/admin/players')
  revalidatePath('/stats')
}

export async function uploadPlayerCard(id: string, formData: FormData): Promise<void> {
  const file = formData.get('card') as File
  if (!file || file.size === 0) throw new Error('Nessun file selezionato')

  const supabase = createAdminClient()
  const ext = file.name.split('.').pop()
  const path = `${id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('player-cards')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from('player-cards').getPublicUrl(path)
  await updatePlayerCardUrl(id, data.publicUrl)

  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidatePath('/')
}
