import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  motmStatus,
  shouldOpenVote,
  closesAtFrom,
  tallyMotm,
  voteError,
  formatCountdown,
  winningTeam,
  missingVoters,
  type LineupEntry,
} from './motm.ts'

const now = new Date('2026-10-29T20:00:00Z')

test('motmStatus', () => {
  assert.equal(motmStatus(null, now), 'none')
  assert.equal(motmStatus(new Date(now.getTime() + 60_000).toISOString(), now), 'open')
  assert.equal(motmStatus(new Date(now.getTime() - 1).toISOString(), now), 'closed')
})

test('shouldOpenVote', () => {
  const base = { motm_eligible: true, motm_closes_at: null, is_upcoming: false, score_a: 2, score_b: 1 }
  assert.equal(shouldOpenVote(base), true)
  assert.equal(shouldOpenVote({ ...base, motm_eligible: false }), false)
  assert.equal(shouldOpenVote({ ...base, motm_closes_at: '2026-11-01T20:00:00.000Z' }), false)
  assert.equal(shouldOpenVote({ ...base, is_upcoming: true }), false)
  assert.equal(shouldOpenVote({ ...base, score_b: null }), false)
  assert.equal(shouldOpenVote({ ...base, score_a: 0, score_b: 0 }), true)
})

test('closesAtFrom adds 2 hours', () => {
  assert.equal(closesAtFrom(now), '2026-10-29T22:00:00.000Z')
})

// Formazione di prova: a1, a2, a3 nella squadra A; b1, b2, b3 nella B.
const lineup: LineupEntry[] = [
  ...['a1', 'a2', 'a3'].map((id) => ({ player_id: id, team: 'a' as const })),
  ...['b1', 'b2', 'b3'].map((id) => ({ player_id: id, team: 'b' as const })),
]
const v = (voter: string, voted: string, at = '2026-10-29T20:00:00Z') => ({
  voter_player_id: voter,
  voted_player_id: voted,
  updated_at: at,
})

test('tallyMotm: nessun voto, nessun vincitore', () => {
  assert.deepEqual(tallyMotm([], lineup, null), { winners: [], topVotes: 0, votersCount: 0, counts: {} })
})

test('tallyMotm: vince chi ha piu voti', () => {
  assert.deepEqual(tallyMotm([v('a1', 'b1'), v('a2', 'b1'), v('b1', 'a1')], lineup, null), {
    winners: ['b1'],
    topVotes: 2,
    votersCount: 3,
    counts: { b1: 2, a1: 1 },
  })
})

test('tallyMotm: ignora i voti di chi non e in formazione', () => {
  assert.deepEqual(tallyMotm([v('x', 'b1'), v('a1', 'y')], lineup, null), {
    winners: [],
    topVotes: 0,
    votersCount: 0,
    counts: {},
  })
})

test('tallyMotm: a pari voti vince chi era nella squadra vincente', () => {
  // a1 ha anche piu voti dagli avversari ed e arrivato prima: conta comunque la squadra
  const votes = [v('b2', 'a1', '2026-10-29T20:01:00Z'), v('a1', 'b1', '2026-10-29T20:05:00Z')]
  assert.deepEqual(tallyMotm(votes, lineup, 'b').winners, ['b1'])
  assert.deepEqual(tallyMotm(votes, lineup, 'a').winners, ['a1'])
})

test('tallyMotm: tra compagni a pari voti vince chi ha piu voti dagli avversari', () => {
  // a1: un voto da un compagno e uno da un avversario. a2: due voti da avversari.
  const votes = [
    v('a3', 'a1', '2026-10-29T20:01:00Z'),
    v('b1', 'a1', '2026-10-29T20:02:00Z'),
    v('b2', 'a2', '2026-10-29T20:03:00Z'),
    v('b3', 'a2', '2026-10-29T20:04:00Z'),
  ]
  assert.deepEqual(tallyMotm(votes, lineup, 'a'), { winners: ['a2'], topVotes: 2, votersCount: 4, counts: { a1: 2, a2: 2 } })
})

test('tallyMotm: in una partita pari si passa ai voti dagli avversari', () => {
  const votes = [v('a2', 'a1', '2026-10-29T20:01:00Z'), v('a1', 'b1', '2026-10-29T20:05:00Z')]
  assert.deepEqual(tallyMotm(votes, lineup, null).winners, ['b1'])
})

test('tallyMotm: se e ancora pari vince chi ha raggiunto prima quel numero di voti', () => {
  // a1 e a2: un voto da un compagno e uno da un avversario ciascuno.
  // L ultimo voto di a2 arriva alle 20:03, quello di a1 alle 20:04.
  const votes = [
    v('a3', 'a1', '2026-10-29T20:01:00Z'),
    v('b1', 'a1', '2026-10-29T20:04:00Z'),
    v('a1', 'a2', '2026-10-29T20:02:00Z'),
    v('b2', 'a2', '2026-10-29T20:03:00Z'),
  ]
  assert.deepEqual(tallyMotm(votes, lineup, 'a').winners, ['a2'])
})

test('tallyMotm: il vincitore e sempre uno solo, anche a parita totale', () => {
  const votes = [v('b1', 'a2'), v('b2', 'a1')]
  assert.deepEqual(tallyMotm(votes, lineup, 'a').winners, ['a1'])
})

test('missingVoters: chi puo votare e non l ha ancora fatto, nell ordine dato', () => {
  assert.deepEqual(missingVoters([v('a1', 'b1'), v('b2', 'a1')], ['a1', 'a2', 'b1', 'b2']), ['a2', 'b1'])
  assert.deepEqual(missingVoters([], ['a1']), ['a1'])
  assert.deepEqual(missingVoters([v('a1', 'b1')], ['a1']), [])
})

test('winningTeam', () => {
  assert.equal(winningTeam(3, 1), 'a')
  assert.equal(winningTeam(1, 3), 'b')
  assert.equal(winningTeam(2, 2), null)
  assert.equal(winningTeam(null, null), null)
})

test('voteError', () => {
  const ok = {
    account: { player_id: 'a', status: 'approved' },
    votedId: 'b',
    lineupIds: ['a', 'b'],
    closesAt: new Date(now.getTime() + 60_000).toISOString(),
    now,
  }
  const login = 'Accedi con un account approvato per votare'
  assert.equal(voteError({ ...ok, account: null }), login)
  assert.equal(voteError({ ...ok, account: { player_id: 'a', status: 'pending' } }), login)
  assert.equal(
    voteError({ ...ok, account: { player_id: 'z', status: 'approved' } }),
    'Puoi votare solo le partite in cui hai giocato',
  )
  assert.equal(voteError({ ...ok, votedId: 'a' }), 'Non puoi votare per te stesso')
  assert.equal(voteError({ ...ok, votedId: 'q' }), 'Giocatore non presente in questa partita')
  assert.equal(voteError({ ...ok, closesAt: null }), 'La votazione è chiusa')
  assert.equal(
    voteError({ ...ok, closesAt: new Date(now.getTime() - 1).toISOString() }),
    'La votazione è chiusa',
  )
  assert.equal(voteError(ok), null)
})

test('formatCountdown', () => {
  assert.equal(formatCountdown((2 * 86400 + 14 * 3600 + 3 * 60) * 1000), '2g 14h 03m')
  assert.equal(formatCountdown((5 * 3600 + 7 * 60) * 1000), '5h 07m')
  assert.equal(formatCountdown(59_000), 'meno di 1m')
  assert.equal(formatCountdown(0), 'chiusa')
  assert.equal(formatCountdown(-5000), 'chiusa')
})
