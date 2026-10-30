import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLedText, voteCta, countdownParts, formatRomeDay, formatRomeTime, type LedInput, type HomeViewer } from './homeText.ts'

const base: LedInput = { teamA: 'Viola', teamB: 'Azzurri', scoreA: 5, scoreB: 3, motmNames: [], scorers: [], next: null }

test('buildLedText completo', () => {
  const txt = buildLedText({
    ...base,
    motmNames: ['Marco'],
    scorers: [{ name: 'Mattia', goals: 1 }, { name: 'Simone', goals: 2 }, { name: 'Marco', goals: 2 }],
    next: { playedAt: '2026-11-05', time: '21:00:00' },
  })
  assert.equal(txt, 'VIOLA 5 – 3 AZZURRI  ·  ★ MOTM MARCO  ·  MARCO ×2  SIMONE ×2  MATTIA  ·  PROSSIMA PARTITA · GIOVEDÌ 5 NOVEMBRE · ORE 21:00')
})

test('buildLedText co-MOTM', () => {
  assert.ok(buildLedText({ ...base, motmNames: ['Marco', 'Luca'] }).includes('★ MOTM MARCO & LUCA'))
})

test('buildLedText senza parti opzionali non lascia separatori', () => {
  assert.equal(buildLedText(base), 'VIOLA 5 – 3 AZZURRI')
})

test('buildLedText prossima partita senza orario', () => {
  assert.equal(buildLedText({ ...base, next: { playedAt: '2026-11-05', time: null } }), 'VIOLA 5 – 3 AZZURRI  ·  PROSSIMA PARTITA · GIOVEDÌ 5 NOVEMBRE')
})

test('voteCta per ogni tipo di visitatore', () => {
  const v = (o: Partial<HomeViewer>): HomeViewer => ({ kind: 'player', playerId: 'p', inLineup: true, voted: false, ...o })
  assert.equal(voteCta(null), 'accedi')
  assert.equal(voteCta(v({ kind: 'anon', playerId: null })), 'accedi')
  assert.equal(voteCta(v({ kind: 'admin', playerId: null })), 'vedi')
  assert.equal(voteCta(v({ kind: 'pending', playerId: null })), 'vedi')
  assert.equal(voteCta(v({ inLineup: false })), 'vedi')
  assert.equal(voteCta(v({})), 'vota')
  assert.equal(voteCta(v({ voted: true })), 'cambia')
})

test('countdownParts', () => {
  assert.equal(countdownParts(0), null)
  assert.equal(countdownParts(-1), null)
  assert.deepEqual(countdownParts(((1 * 86400) + (4 * 3600) + (5 * 60) + 30) * 1000), { d: 1, h: 4, m: 5 })
  assert.deepEqual(countdownParts(59_000), { d: 0, h: 0, m: 0 })
})

test('orari in Europe/Rome', () => {
  assert.equal(formatRomeDay('2026-10-29'), 'giovedì 29 ottobre')
  assert.equal(formatRomeTime('21:00:00'), '21:00')
  assert.equal(formatRomeTime(null), null)
})
