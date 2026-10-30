import { test } from 'node:test'
import assert from 'node:assert/strict'

test('il client service role non usa la cache di fetch di Next', async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  const seen: (RequestInit | undefined)[] = []
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    seen.push(init)
    return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  try {
    const { createAdminClient } = await import('./admin.ts')
    await createAdminClient().from('player_accounts').select('*')
    assert.ok(seen.length > 0, 'nessuna richiesta fatta')
    for (const init of seen) assert.equal(init?.cache, 'no-store')
  } finally {
    globalThis.fetch = realFetch
  }
})
