import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client anonimo senza cookie, per le letture pubbliche (partite, giocatori, presenze).
// Serve dentro unstable_cache, dove cookies() non si puo' chiamare. Li' la freschezza la decide
// unstable_cache (vedi lib/queries/cached.ts) e la cache di fetch e' gia' spenta da Next; il no-store
// serve per le letture fatte fuori da unstable_cache (es. pagine admin), che Next terrebbe per sempre.
// Attenzione: una lettura no-store in una pagina statica fa fallire la build, la pagina deve essere dinamica.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' })

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false }, global: { fetch: noStoreFetch } },
  )
}
