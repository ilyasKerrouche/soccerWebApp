// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''
  // Solo percorsi relativi del sito (no "//host", no URL assoluti)
  const target = /^\/(?![/\\])/.test(next) ? next : '/profilo'

  if (code) {
    const { error } = await createAuthClient().auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${target}`)
  }
  return NextResponse.redirect(`${origin}/accedi`)
}
