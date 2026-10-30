// app/reimposta-password/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'

export async function resetPasswordAction(formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { error: 'La password deve avere almeno 8 caratteri' }
  const { error } = await createAuthClient().auth.updateUser({ password })
  if (error) return { error: 'Link scaduto o non valido: richiedine uno nuovo' }
  redirect('/profilo')
}
