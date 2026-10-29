import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  motmStatus,
  shouldOpenVote,
  closesAtFrom,
  tallyMotm,
  voteError,
  formatCountdown,
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

test('closesAtFrom adds 3 days', () => {
  assert.equal(closesAtFrom(now), '2026-11-01T20:00:00.000Z')
})

test('tallyMotm', () => {
  assert.deepEqual(tallyMotm([], ['a', 'b']), { winners: [], topVotes: 0, votersCount: 0 })
  const v = (a: string, b: string) => ({ voter_player_id: a, voted_player_id: b })
  assert.deepEqual(tallyMotm([v('a', 'b'), v('c', 'b'), v('b', 'a')], ['a', 'b', 'c']), {
    winners: ['b'],
    topVotes: 2,
    votersCount: 3,
  })
  assert.deepEqual(tallyMotm([v('b', 'a'), v('a', 'b')], ['a', 'b']), {
    winners: ['a', 'b'],
    topVotes: 1,
    votersCount: 2,
  })
  assert.deepEqual(tallyMotm([v('x', 'b'), v('a', 'y')], ['a', 'b']), {
    winners: [],
    topVotes: 0,
    votersCount: 0,
  })
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
