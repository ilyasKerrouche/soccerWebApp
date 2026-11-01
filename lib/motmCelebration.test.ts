import { test } from 'node:test'
import assert from 'node:assert/strict'
import { celebrationKey, shouldCelebrate } from './motmCelebration.ts'

const now = new Date('2026-11-01T12:00:00Z')
const base = { winnerCount: 1, closesAt: '2026-10-31T17:26:31Z', now, seen: false }

test('si festeggia a voto chiuso da poco, con un vincitore, se non gia visto', () => {
  assert.equal(shouldCelebrate(base), true)
})

test('niente festa: voto aperto, nessun vincitore, gia visto, o chiuso da piu di 7 giorni', () => {
  assert.equal(shouldCelebrate({ ...base, closesAt: '2026-11-01T14:00:00Z' }), false)
  assert.equal(shouldCelebrate({ ...base, closesAt: null }), false)
  assert.equal(shouldCelebrate({ ...base, winnerCount: 0 }), false)
  assert.equal(shouldCelebrate({ ...base, seen: true }), false)
  assert.equal(shouldCelebrate({ ...base, closesAt: '2026-10-24T11:00:00Z' }), false)
})

test('una chiave per partita', () => {
  assert.equal(celebrationKey('abc'), 'calcetto:motm-celebrated:abc')
})
