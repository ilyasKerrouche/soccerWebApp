import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatCount, parseCount } from './countUp.ts'

test('parseCount riconosce interi, decimali con virgola e percentuali', () => {
  assert.deepEqual(parseCount(31), { value: 31, decimals: 0, suffix: '' })
  assert.deepEqual(parseCount('10,2'), { value: 10.2, decimals: 1, suffix: '' })
  assert.deepEqual(parseCount('54%'), { value: 54, decimals: 0, suffix: '%' })
  assert.equal(parseCount('—'), null)
  assert.equal(parseCount('★ 4'), null)
})

test('formatCount scrive come in pagina, con la virgola', () => {
  assert.equal(formatCount({ value: 10.2, decimals: 1, suffix: '' }, 0.5), '5,1')
  assert.equal(formatCount({ value: 54, decimals: 0, suffix: '%' }, 1), '54%')
  assert.equal(formatCount({ value: 31, decimals: 0, suffix: '' }, 0.33), '10')
})
