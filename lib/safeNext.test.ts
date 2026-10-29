import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeNext } from './safeNext.ts'

const FB = '/profilo'

test('accetta percorsi relativi del sito', () => {
  assert.equal(safeNext('/profilo', FB), '/profilo')
  assert.equal(safeNext('/matches/1?x=2', FB), '/matches/1?x=2')
})

test('normalizza in modo sicuro', () => {
  assert.equal(safeNext('/a/../profilo', FB), '/profilo')
})

test('rifiuta tutto il resto', () => {
  for (const bad of ['//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', 'https://evil.com', 'javascript:alert(1)', '/.//evil.com', '/a/..//evil.com', '/..//evil.com', '/%2e//evil.com', '', undefined, ['/a']]) {
    assert.equal(safeNext(bad, FB), FB, String(bad))
  }
})
