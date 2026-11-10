import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  availableSeasons, currentSeason, inSeason, parseSeason, seasonEmptyText, seasonLabel,
  seasonOf, seasonQuery, statsSeasonFor, withSeason,
} from './season.ts'

const NOV_2026 = new Date('2026-11-10T12:00:00Z')
const JAN_2027 = new Date('2027-01-01T00:30:00+01:00') // gia' 2027 a Roma, ancora 2026 in UTC

test('ottobre-dicembre 2025 contano come 2026', () => {
  assert.equal(seasonOf('2025-10-02'), 2026)
  assert.equal(seasonOf('2025-12-31'), 2026)
  assert.equal(seasonOf('2024-05-01'), 2026)
})

test('anno solare', () => {
  assert.equal(seasonOf('2026-12-31'), 2026)
  assert.equal(seasonOf('2027-01-01'), 2027)
})

test('stagione in corso in ora di Roma', () => {
  assert.equal(currentSeason(NOV_2026), 2026)
  assert.equal(currentSeason(JAN_2027), 2027)
  assert.equal(currentSeason(new Date('2025-11-01T12:00:00Z')), 2026)
})

test('inSeason', () => {
  assert.equal(inSeason('2025-10-02', 2026), true)
  assert.equal(inSeason('2027-01-08', 2026), false)
  assert.equal(inSeason('2020-01-01', 'all'), true)
})

test('stagioni disponibili', () => {
  assert.deepEqual(availableSeasons(['2025-10-02', '2026-03-01'], JAN_2027), [2027, 2026])
  assert.deepEqual(availableSeasons([], NOV_2026), [2026])
  assert.deepEqual(availableSeasons(['2027-01-15'], NOV_2026), [2026])
})

test('parametro URL', () => {
  assert.equal(parseSeason(undefined, NOV_2026), 2026)
  assert.equal(parseSeason('sempre', NOV_2026), 'all')
  assert.equal(parseSeason('2026', JAN_2027), 2026)
  for (const bad of ['2019', 'abc', '2099', '2026.5', '']) assert.equal(parseSeason(bad, NOV_2026), 2026)
  assert.equal(parseSeason(['sempre', '2026'], NOV_2026), 'all')
})

test('query e link', () => {
  assert.equal(seasonQuery(2026, NOV_2026), '')
  assert.equal(seasonQuery(2026, JAN_2027), '?stagione=2026')
  assert.equal(seasonQuery('all', NOV_2026), '?stagione=sempre')
  assert.equal(withSeason('/stats', null), '/stats')
  assert.equal(withSeason('/players/abc', '2026'), '/players/abc?stagione=2026')
})

test('card del dettaglio partita mai su una stagione futura', () => {
  assert.equal(statsSeasonFor('2027-01-08', NOV_2026), 2026)
  assert.equal(statsSeasonFor('2025-12-18', JAN_2027), 2026)
})

test('etichette', () => {
  assert.equal(seasonLabel(2027), '2027')
  assert.equal(seasonLabel('all'), 'Sempre')
  assert.equal(seasonEmptyText(2027), 'Stagione 2027 al via: ancora nessuna partita')
})
