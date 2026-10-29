// app/password-dimenticata/actions.ts
'use server'
import { headers } from 'next/headers'
import { createAuthClient } from '@/lib/supabase/server'

// Risposta sempre neutra: non rivela se l'email esiste
export async function forgotPasswordAction(formData: FormData): Promise<{ done: boolean }> {
  const email = String(formData.get('email') ?? '').trim()
  if (email) {
    const h = headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
    await createAuthClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${proto}://${host}/auth/callback?next=/reimposta-password`,
    })
  }
  return { done: true }
}
