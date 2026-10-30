import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Next 14 mette in cache per sempre le GET fatte dal server, anche nelle pagine force-dynamic.
// Il client service role legge dati privati e che cambiano (account, voti, MOTM): deve leggere sempre dal DB.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' })

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: noStoreFetch } },
  )
}
