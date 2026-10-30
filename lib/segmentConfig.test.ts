import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

// Next 14 mette in cache per sempre le letture del server se la pagina non dice altrimenti
// (anche con dynamic = 'force-dynamic'). Queste pagine mostrano dati che l'admin modifica: niente cache.
const NO_STORE = /export const fetchCache = 'force-no-store'/

for (const file of ['app/admin/layout.tsx', 'app/matches/[id]/page.tsx']) {
  test(`${file} disattiva la cache delle letture`, () => {
    assert.ok(existsSync(file), `${file} non esiste`)
    assert.match(readFileSync(file, 'utf8'), NO_STORE)
  })
}
