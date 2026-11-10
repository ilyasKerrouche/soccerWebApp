import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client anonimo senza cookie, per le letture pubbliche (partite, giocatori, presenze).
// Serve dentro unstable_cache, dove cookies() non si puo' chiamare. La cache di fetch di Next
// resta spenta: la freschezza la decide unstable_cache (vedi lib/queries/cached.ts).
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' })

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false }, global: { fetch: noStoreFetch } },
  )
}
