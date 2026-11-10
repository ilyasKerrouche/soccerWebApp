import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plural } from './plural.ts'

test('singolare solo con 1', () => {
  assert.equal(plural(1, 'giocatore', 'giocatori'), '1 giocatore')
  assert.equal(plural(0, 'giocatore', 'giocatori'), '0 giocatori')
  assert.equal(plural(12, 'giocata', 'giocate'), '12 giocate')
})
