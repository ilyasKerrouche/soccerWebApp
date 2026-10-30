// app/password-dimenticata/actions.ts
'use server'
import { createAuthClient } from '@/lib/supabase/server'

// Mai dagli header della richiesta (host-header poisoning): l'origine arriva dalla configurazione
function siteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (url) return url.replace(/\/+$/, '')
  return process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null
}

// Risposta sempre neutra: non rivela se l'email esiste
export async function forgotPasswordAction(formData: FormData): Promise<{ done: boolean }> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { done: true }

  const base = siteUrl()
  if (!base) {
    console.error('NEXT_PUBLIC_SITE_URL non impostata: reset password non inviato')
    return { done: true }
  }
  const { error } = await createAuthClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/auth/callback?next=/reimposta-password`,
  })
  if (error) console.error('resetPasswordForEmail failed', error)
  return { done: true }
}
