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

// Le pagine admin leggono con il client pubblico (senza cookie): senza force-dynamic Next prova a
// generarle statiche in build e la lettura no-store fa fallire la build ("Dynamic server usage").
test('app/admin/layout.tsx rende dinamiche le pagine admin', () => {
  assert.match(readFileSync('app/admin/layout.tsx', 'utf8'), /export const dynamic = 'force-dynamic'/)
})

// La Home legge anche con il client pubblico: dinamica in modo esplicito, non per caso
// (oggi lo e' perche' altre letture usano i cookie). I dati restano in cache in lib/queries/cached.ts.
test('app/page.tsx e\' dinamica in modo esplicito', () => {
  assert.match(readFileSync('app/page.tsx', 'utf8'), /export const dynamic = 'force-dynamic'/)
})
