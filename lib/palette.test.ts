import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// La v2 usa solo la palette della home: i vecchi viola e i fondi quasi neri non devono tornare.
const FORBIDDEN = ['167,139,250', '167, 139, 250', '#a78bfa', '#6366f1', '99,102,241', '#06060f', '#0d0d1f', '#03030a', '#1e1b4b', '#312e81', '#4c1d95', '#1a0533', '#7c3aed', 'glow-violet']
// La card provvisoria ha la sua grafica, gia' approvata anche sul campo della home.
const ALLOWED = new Set([join('components', 'PlaceholderCard.tsx')])

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return files(p)
    return /\.(tsx?|css)$/.test(name) && !name.endsWith('.test.ts') ? [p] : []
  })
}

test('nessun colore della vecchia palette in app/ e components/', () => {
  const offenders = [...files('app'), ...files('components')]
    .filter((f) => !ALLOWED.has(f))
    .filter((f) => {
      const src = readFileSync(f, 'utf8').toLowerCase()
      return FORBIDDEN.some((s) => src.includes(s))
    })
  assert.deepEqual(offenders, [])
})
