// app/accedi/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safeNext'

export async function signInAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const { error } = await createAuthClient().auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email o password errati' }
  redirect(safeNext(formData.get('next'), '/profilo'))
}

export async function signOutAction(): Promise<void> {
  // Solo questo dispositivo: le altre sessioni dell'utente restano attive
  await createAuthClient().auth.signOut({ scope: 'local' })
  redirect('/')
}
