import { test } from 'node:test'
import assert from 'node:assert/strict'

// Le letture pubbliche stanno dentro unstable_cache: la freschezza la decide quella cache
// (60 secondi o revalidateTag), non la cache di fetch di Next, che le terrebbe per sempre.
test('il client pubblico non usa la cache di fetch di Next', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  const seen: (RequestInit | undefined)[] = []
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    seen.push(init)
    return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  try {
    const { createPublicClient } = await import('./public.ts')
    await createPublicClient().from('matches').select('played_at')
    assert.ok(seen.length > 0, 'nessuna richiesta fatta')
    for (const init of seen) assert.equal(init?.cache, 'no-store')
  } finally {
    globalThis.fetch = realFetch
  }
})
