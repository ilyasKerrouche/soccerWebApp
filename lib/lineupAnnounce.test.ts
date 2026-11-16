import { test } from 'node:test'
import assert from 'node:assert/strict'
import { announceKey, announceOrder, fanSpacing, roleLabel, shouldAnnounce } from './lineupAnnounce.ts'

const base = { teamA: 5, teamB: 5, phase: 'before' as const, seen: false, reducedMotion: false }

test('l annuncio parte quando ci sono entrambe le squadre e non e gia stato visto', () => {
  assert.equal(shouldAnnounce(base), true)
  // senza orario di inizio la fase non si conosce: si annuncia lo stesso
  assert.equal(shouldAnnounce({ ...base, phase: null }), true)
  assert.equal(shouldAnnounce({ ...base, phase: 'live' }), true)
})

test('niente annuncio: una squadra vuota, gia visto, partita finita, o riduci movimento', () => {
  assert.equal(shouldAnnounce({ ...base, teamA: 0 }), false)
  assert.equal(shouldAnnounce({ ...base, teamB: 0 }), false)
  assert.equal(shouldAnnounce({ ...base, seen: true }), false)
  assert.equal(shouldAnnounce({ ...base, phase: 'after' }), false)
  assert.equal(shouldAnnounce({ ...base, reducedMotion: true }), false)
})

test('una chiave per partita', () => {
  assert.equal(announceKey('abc'), 'calcetto:lineup-announced:abc')
})

test('roleLabel: sigle note in italiano, le altre restano come sono', () => {
  assert.equal(roleLabel('GK'), 'Portiere')
  assert.equal(roleLabel(' por '), 'Portiere')
  assert.equal(roleLabel('CB'), 'Difensore')
  assert.equal(roleLabel('cm'), 'Centrocampista')
  assert.equal(roleLabel('COC'), 'Trequartista')
  assert.equal(roleLabel('ATT'), 'Attaccante')
  assert.equal(roleLabel('Jolly'), 'Jolly')
  assert.equal(roleLabel(null), '')
})

test('announceOrder: dal portiere all attacco, a parita resta l ordine dato', () => {
  const p = (name: string, position: string | null) => ({ name, position })
  const out = announceOrder([p('Att', 'ATT'), p('Boh', null), p('Cen1', 'CM'), p('Por', 'GK'), p('Dif', 'DEF'), p('Cen2', 'CM')])
  assert.deepEqual(out.map((x) => x.name), ['Por', 'Dif', 'Cen1', 'Cen2', 'Att', 'Boh'])
})

test('fanSpacing: 40px tra le card, meno se la squadra non ci sta in larghezza', () => {
  assert.equal(fanSpacing(390, 5, 118), 40)
  assert.equal(fanSpacing(320, 8, 118), 26)
  assert.equal(fanSpacing(390, 1, 118), 0)
})
