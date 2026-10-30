import { test } from 'node:test'
import assert from 'node:assert/strict'
import { holoSlots, isGoalkeeper } from './holoLayout.ts'

test('isGoalkeeper riconosce le sigle del portiere', () => {
  for (const p of ['GK', 'gk', 'POR', 'Portiere', ' P ']) assert.equal(isGoalkeeper(p), true, p)
  for (const p of ['CM', 'ST', 'DIF', '', null]) assert.equal(isGoalkeeper(p), false, String(p))
})

test('5 giocatori con portiere: il portiere va in porta, gli altri in due file da due', () => {
  const slots = holoSlots(['CM', 'ST', 'GK', 'CB', 'CB'], 'a')
  assert.deepEqual(slots[2], { x: 50, y: 92 })
  const outfield = [slots[0], slots[1], slots[3], slots[4]]
  // due file distinte, ognuna con due giocatori ai lati
  assert.equal(new Set(outfield.map((s) => s.y)).size, 2)
  assert.deepEqual(outfield.map((s) => s.x).sort((a, b) => a - b), [28, 28, 72, 72])
  for (const s of outfield) assert.ok(s.y > 50 && s.y < 92, `y ${s.y} nella propria meta' campo`)
})

test('la squadra b e\' specchiata nella meta\' alta', () => {
  const a = holoSlots(['GK', 'CB', 'CB'], 'a')
  const b = holoSlots(['GK', 'CB', 'CB'], 'b')
  assert.deepEqual(b, a.map((s) => ({ x: 100 - s.x, y: 100 - s.y })))
  for (const s of b) assert.ok(s.y < 50)
})

test('senza portiere tutti in file da due; l\'ultimo da solo va al centro', () => {
  const slots = holoSlots(['CM', 'ST', 'CB'], 'a')
  assert.equal(slots[2].x, 50)
  assert.notEqual(slots[0].y, slots[2].y)
})

test('nessun giocatore, nessuno slot', () => {
  assert.deepEqual(holoSlots([], 'a'), [])
})
