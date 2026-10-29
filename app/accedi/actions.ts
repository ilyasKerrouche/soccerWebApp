// app/accedi/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'

// Solo percorsi relativi del sito: "/x" sì, "//host" e URL assoluti no (open redirect)
function safeNext(next: string): string {
  return /^\/(?![/\\])/.test(next) ? next : '/profilo'
}

export async function signInAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const { error } = await createAuthClient().auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email o password errati' }
  redirect(safeNext(String(formData.get('next') ?? '')))
}

export async function signOutAction(): Promise<void> {
  await createAuthClient().auth.signOut()
  redirect('/')
}
