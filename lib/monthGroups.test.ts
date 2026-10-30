import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dayParts, groupByMonth } from './monthGroups.ts'

const m = (played_at: string) => ({ played_at })

test('raggruppa per mese mantenendo l ordine', () => {
  const g = groupByMonth([m('2026-10-29'), m('2026-10-22'), m('2026-09-30')])
  assert.deepEqual(g.map((x) => [x.key, x.label, x.items.length]), [['2026-10', 'Ottobre', 2], ['2026-09', 'Settembre', 1]])
})

test('a cavallo d anno l anno compare solo sui mesi di un altro anno', () => {
  const g = groupByMonth([m('2026-01-08'), m('2025-12-18')])
  assert.deepEqual(g.map((x) => x.label), ['Gennaio', 'Dicembre 2025'])
})

test('lista vuota', () => {
  assert.deepEqual(groupByMonth([]), [])
})

test('giorno e giorno della settimana in ora italiana', () => {
  assert.deepEqual(dayParts('2026-10-29'), { day: 29, weekday: 'gio' })
})
