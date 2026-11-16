import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialScorerRows, pruneScorerRows } from './scorerRows.ts'

const lineup = [
  { player_id: 'p1', team: 'a' as const, goals: 2, own_goals: 0 },
  { player_id: 'p2', team: 'a' as const, goals: 0, own_goals: 1 },
  { player_id: 'p3', team: 'a' as const, goals: 1, own_goals: 2 },
  { player_id: 'p4', team: 'a' as const, goals: 0, own_goals: 0 },
  { player_id: 'p5', team: 'b' as const, goals: 3, own_goals: 0 },
]

test('modificando una partita gli autogol non si perdono', () => {
  assert.deepEqual(initialScorerRows(lineup, 'a'), [
    { player_id: 'p1', goals: 2, is_own_goal: false },
    { player_id: 'p2', goals: 1, is_own_goal: true },
    { player_id: 'p3', goals: 1, is_own_goal: false },
    { player_id: 'p3', goals: 2, is_own_goal: true },
  ])
  assert.deepEqual(initialScorerRows(lineup, 'b'), [{ player_id: 'p5', goals: 3, is_own_goal: false }])
})

test('chi esce dalla squadra perde le sue righe marcatore', () => {
  const rows = initialScorerRows(lineup, 'a')
  assert.deepEqual(pruneScorerRows(rows, ['p1', 'p4']), [{ player_id: 'p1', goals: 2, is_own_goal: false }])
})

test('se non cambia nulla restituisce lo stesso array', () => {
  const rows = initialScorerRows(lineup, 'a')
  assert.equal(pruneScorerRows(rows, ['p1', 'p2', 'p3', 'p4']), rows)
})
