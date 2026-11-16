import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLedText, buildUpcomingLedText, teamTopScorers, toPlayerHomeStats, sortScorers, topScorers, voteCta, countdownParts, formatRomeDay, formatRomeTime, romeInstant, matchPhase, type LedInput, type HomeViewer } from './homeText.ts'

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

test('romeInstant converte giorno e ora italiani in un istante', () => {
  assert.equal(romeInstant('2026-11-05', '21:00:00').toISOString(), '2026-11-05T20:00:00.000Z') // ora solare
  assert.equal(romeInstant('2026-07-10', '21:00').toISOString(), '2026-07-10T19:00:00.000Z') // ora legale
})

test('sortScorers: piu gol prima, a parita in ordine alfabetico (come il LED)', () => {
  const s = sortScorers([{ name: 'Simone', goals: 1 }, { name: 'Marco', goals: 2 }, { name: 'Andrea', goals: 1 }], (x) => x)
  assert.deepEqual(s.map((x) => x.name), ['Marco', 'Andrea', 'Simone'])
})

test('topScorers: niente giocatori a 0 gol, massimo n, stesso ordine', () => {
  const players = [{ name: 'Zeno', total_goals: 3 }, { name: 'Bea', total_goals: 0 }, { name: 'Ada', total_goals: 3 }, { name: 'Ugo', total_goals: 1 }]
  assert.deepEqual(topScorers(players, 2).map((p) => p.name), ['Ada', 'Zeno'])
  assert.deepEqual(topScorers(players, 5).map((p) => p.name), ['Ada', 'Zeno', 'Ugo'])
  assert.deepEqual(topScorers([{ name: 'Bea', total_goals: 0 }], 5), [])
})

test('buildUpcomingLedText: prossima partita con giorno, ora e squadre', () => {
  assert.equal(
    buildUpcomingLedText({ teamA: 'Bianchi', teamB: 'Neri', playedAt: '2026-11-06', time: '21:00:00' }),
    'PROSSIMA PARTITA  ·  VENERDÌ 6 NOVEMBRE · ORE 21:00  ·  BIANCHI – NERI',
  )
  assert.equal(
    buildUpcomingLedText({ teamA: 'Bianchi', teamB: 'Neri', playedAt: '2026-11-06', time: null }),
    'PROSSIMA PARTITA  ·  VENERDÌ 6 NOVEMBRE  ·  BIANCHI – NERI',
  )
})

test('teamTopScorers: i migliori marcatori di ogni squadra, pari merito compresi, mai a 0 gol', () => {
  const mps = [
    { player_id: 'a1', team: 'a' as const, goals: 2 },
    { player_id: 'a2', team: 'a' as const, goals: 2 },
    { player_id: 'a3', team: 'a' as const, goals: 1 },
    { player_id: 'b1', team: 'b' as const, goals: 0 },
  ]
  assert.deepEqual([...teamTopScorers(mps)].sort(), ['a1', 'a2'])
})

test('toPlayerHomeStats: statistiche per card con MOTM', () => {
  const s = toPlayerHomeStats(
    [{ id: 'p', total_goals: 4, total_appearances: 5, record: { played: 4, win_rate: 0.5, form: ['W'] } }],
    { p: 2 },
  )
  assert.deepEqual(s.p, { goals: 4, appearances: 5, winRate: 0.5, motm: 2, form: ['W'] })
  assert.equal(toPlayerHomeStats([{ id: 'q', total_goals: 0, total_appearances: 0, record: undefined }], {}).q.winRate, null)
})

// 5 novembre 2026, ora solare: le 21:00 italiane sono le 20:00 UTC
const phaseAt = (utc: string, end: string | null = '22:00', start: string | null = '21:00') =>
  matchPhase({ date: '2026-11-05', start, end }, new Date(utc))

test('matchPhase: prima dell inizio si aspetta', () => {
  assert.equal(phaseAt('2026-11-05T19:59:59Z'), 'before')
})

test('matchPhase: live dall orario di inizio fino a quello di fine', () => {
  assert.equal(phaseAt('2026-11-05T20:00:00Z'), 'live')
  assert.equal(phaseAt('2026-11-05T20:59:59Z'), 'live')
  assert.equal(phaseAt('2026-11-05T21:00:00Z'), 'after')
})

test('matchPhase: senza orario di fine non e mai live', () => {
  assert.equal(phaseAt('2026-11-05T19:00:00Z', null), 'before')
  assert.equal(phaseAt('2026-11-05T20:30:00Z', null), 'after')
})

test('matchPhase: senza orario di inizio non si sa nulla', () => {
  assert.equal(phaseAt('2026-11-05T20:30:00Z', '22:00', null), null)
})

test('matchPhase: una fine prima dell inizio vuol dire dopo mezzanotte', () => {
  // dalle 23:30 alle 00:30 italiane
  assert.equal(phaseAt('2026-11-05T23:00:00Z', '00:30', '23:30'), 'live')
  assert.equal(phaseAt('2026-11-05T23:30:00Z', '00:30', '23:30'), 'after')
})
