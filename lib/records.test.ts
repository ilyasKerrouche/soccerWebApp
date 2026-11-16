import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeRecords, goldenPairs, recordNews, recordNewsFresh, recordNewsLine, type RMatch } from './records.ts'

const P = (id: string) => ({ id, name: id.toUpperCase() })

// m(id, data, gol A, gol B, [giocatore, squadra, gol]...)
function m(id: string, date: string, a: number | null, b: number | null, lineup: [string, 'a' | 'b', number][]): RMatch<{ id: string; name: string }> {
  return {
    id, played_at: date, score_a: a, score_b: b, is_upcoming: false,
    team_a_name: 'Viola', team_b_name: 'Azzurri',
    match_players: lineup.map(([pid, team, goals]) => ({ player_id: pid, team, goals, player: P(pid) })),
  }
}

const matches = [
  m('m1', '2026-01-01', 3, 1, [['x', 'a', 2], ['y', 'a', 1], ['z', 'b', 1]]),
  m('m2', '2026-01-08', 2, 2, [['x', 'a', 1], ['y', 'b', 2], ['z', 'a', 1]]),
  m('m3', '2026-01-15', 7, 2, [['x', 'a', 3], ['y', 'a', 0], ['z', 'b', 2]]),
  m('m4', '2026-01-22', 0, 1, [['x', 'a', 0], ['y', 'a', 0], ['z', 'b', 1]]),
  m('m5', '2026-01-29', 4, 0, [['x', 'a', 2], ['y', 'a', 2]]),
]

test('vittoria piu larga e partita con piu gol', () => {
  const r = computeRecords(matches)
  assert.equal(r.biggestWin?.value, 5)
  assert.deepEqual(r.biggestWin?.matches.map((x) => x.id), ['m3'])
  assert.equal(r.mostGoalsMatch?.value, 9)
  assert.deepEqual(r.mostGoalsMatch?.matches.map((x) => x.id), ['m3'])
})

test('piu gol in una partita: un solo detentore con la sua partita', () => {
  const r = computeRecords(matches)
  assert.equal(r.mostGoalsInMatch?.value, 3)
  assert.deepEqual(r.mostGoalsInMatch?.holders.map((h) => [h.player.id, h.matchId]), [['x', 'm3']])
})

test('serie di gol piu lunga di sempre, anche se poi si e interrotta', () => {
  // x: 2,1,3,0,2 -> 3 ; z: 1,1,2,1 (non gioca m5) -> 4
  const r = computeRecords(matches)
  assert.equal(r.longestScoringStreak?.value, 4)
  assert.deepEqual(r.longestScoringStreak?.holders.map((h) => h.player.id), ['z'])
})

test('serie di vittorie: il pareggio la interrompe', () => {
  // x: V,N,V,S,V -> 1 ; y: V,N(squadra b 2-2),V,S,V -> 1 ; z: S,N,S,V -> 1
  const r = computeRecords([
    ...matches,
    m('m6', '2026-02-05', 1, 0, [['x', 'a', 0]]),
    m('m7', '2026-02-12', 1, 0, [['x', 'a', 1]]),
  ])
  // x: ... S, V, V, V -> 3
  assert.equal(r.longestWinStreak?.value, 3)
  assert.deepEqual(r.longestWinStreak?.holders.map((h) => h.player.id), ['x'])
})

test('doppiette e triplette contate a parte: esattamente 2, esattamente 3', () => {
  // doppiette: x m1, m5 -> 2 ; y m2, m5 -> 2 ; z m3 -> 1. triplette: x m3 -> 1
  const r = computeRecords(matches)
  assert.equal(r.multi.braces?.value, 2)
  assert.deepEqual(r.multi.braces?.holders.map((h) => h.player.id), ['x', 'y'])
  assert.equal(r.multi.hatTricks?.value, 1)
  assert.deepEqual(r.multi.hatTricks?.holders.map((h) => h.player.id), ['x'])
  assert.equal(r.multi.pokers, null)
  assert.equal(r.multi.manitas, null)
})

test('poker esattamente 4, manita da 5 in su', () => {
  const r = computeRecords([
    m('a', '2026-01-01', 4, 0, [['x', 'a', 4]]),
    m('b', '2026-01-08', 5, 0, [['y', 'a', 5]]),
    m('c', '2026-01-15', 6, 0, [['y', 'a', 6]]),
  ])
  assert.deepEqual([r.multi.pokers?.value, r.multi.pokers?.holders[0].player.id], [1, 'x'])
  assert.deepEqual([r.multi.manitas?.value, r.multi.manitas?.holders[0].player.id], [2, 'y'])
  assert.equal(r.multi.braces, null)
  assert.equal(r.multi.hatTricks, null)
})

test('pari merito: tutti i detentori, al massimo 3, il resto contato', () => {
  const tie = [1, 2, 3, 4].map((i) => m(`t${i}`, `2026-03-0${i}`, 2, 0, [[`p${i}`, 'a', 2]]))
  const r = computeRecords(tie)
  assert.equal(r.mostGoalsInMatch?.value, 2)
  assert.equal(r.mostGoalsInMatch?.holders.length, 3)
  assert.equal(r.mostGoalsInMatch?.more, 1)
  // le partite piu recenti prima
  assert.deepEqual(r.mostGoalsInMatch?.holders.map((h) => h.matchId), ['t4', 't3', 't2'])
})

test('senza partite giocate nessun record; partite future e senza risultato ignorate', () => {
  const r = computeRecords([
    { ...m('f', '2026-05-01', null, null, [['x', 'a', 0]]), is_upcoming: true },
    m('n', '2026-04-01', null, null, [['x', 'a', 3]]),
  ])
  assert.equal(r.biggestWin, null)
  assert.equal(r.mostGoalsMatch, null)
  assert.equal(r.mostGoalsInMatch, null)
  assert.equal(r.longestScoringStreak, null)
  assert.equal(r.longestWinStreak, null)
  assert.deepEqual(r.multi, { braces: null, hatTricks: null, pokers: null, manitas: null })
})

test('solo pareggi: nessuna vittoria piu larga', () => {
  const r = computeRecords([m('d', '2026-01-01', 1, 1, [['x', 'a', 1], ['y', 'b', 1]])])
  assert.equal(r.biggestWin, null)
  assert.equal(r.mostGoalsMatch?.value, 2)
})

test('coppie: solo compagni di squadra, con la soglia di partite insieme', () => {
  // x+y insieme in m1(V), m3(V), m4(S), m5(V) = 4 ; x+z insieme solo in m2(N)
  const pairs = goldenPairs(matches, { minGames: 4 })
  assert.equal(pairs.length, 1)
  const [p] = pairs
  assert.deepEqual([p.a.id, p.b.id].sort(), ['x', 'y'])
  assert.equal(p.games, 4)
  assert.equal(p.wins, 3)
  assert.equal(p.draws, 0)
  assert.equal(p.winRate, 0.75)
  assert.equal(goldenPairs(matches, { minGames: 5 }).length, 0)
})

test('coppie: ordine prudente, chi ha giocato di piu insieme sale a pari percentuale', () => {
  const many: RMatch<{ id: string; name: string }>[] = []
  let d = 1
  const day = () => `2026-0${Math.floor(d / 28) + 1}-${String((d++ % 28) + 1).padStart(2, '0')}`
  // a+b: 4 su 6 (67%) ; c+d: 7 su 10 (70%) ; e+f: 2 su 2 (100%, ma sotto soglia se minGames 3)
  for (let i = 0; i < 6; i++) many.push(m(`ab${i}`, day(), i < 4 ? 1 : 0, i < 4 ? 0 : 1, [['a', 'a', 0], ['b', 'a', 0]]))
  for (let i = 0; i < 10; i++) many.push(m(`cd${i}`, day(), i < 7 ? 1 : 0, i < 7 ? 0 : 1, [['c', 'a', 0], ['d', 'a', 0]]))
  for (let i = 0; i < 2; i++) many.push(m(`ef${i}`, day(), 1, 0, [['e', 'a', 0], ['f', 'a', 0]]))
  const pairs = goldenPairs(many, { minGames: 3 })
  assert.deepEqual(pairs.map((p) => [p.a.id, p.b.id].sort().join('')), ['cd', 'ab'])
  // (4+1)/(6+2)=62.5% < (7+1)/(10+2)=66.7%
})

test('coppie: limite sul numero restituito', () => {
  const many = ['ab', 'cd', 'ef'].flatMap((k) =>
    [0, 1].map((i) => m(`${k}${i}`, `2026-01-0${i + 1}`, 1, 0, [[k[0], 'a', 0], [k[1], 'a', 0]])),
  )
  assert.equal(goldenPairs(many, { minGames: 2, limit: 2 }).length, 2)
})

// ── Novita' sui record dopo l'ultima partita ──
// Prima di m6: vittoria piu' larga 5 (m3), partita con piu' gol 9 (m3), piu' gol in una partita 3 (x in m3)
const m6 = m('m6', '2026-02-05', 8, 1, [['x', 'a', 5], ['y', 'a', 3], ['z', 'b', 0]])

test('recordNews: record battuti prima, poi quelli eguagliati', () => {
  assert.deepEqual(recordNews([...matches, m6], 'm6'), [
    { kind: 'biggestWin', value: 7, beaten: true, players: [] },
    { kind: 'mostGoalsInMatch', value: 5, beaten: true, players: ['X'] },
    { kind: 'mostGoalsMatch', value: 9, beaten: false, players: [] },
  ])
})

test('recordNews: una partita normale non fa notizia', () => {
  assert.deepEqual(recordNews(matches, 'm5', { minHistory: 0 }), [])
})

test('recordNews: una serie fa notizia la prima volta che supera il vecchio record', () => {
  // Prima di m4 il record e' 3 di fila (x in m1..m3). In m4 x resta a secco e z arriva a 4.
  assert.deepEqual(recordNews(matches.slice(0, 4), 'm4', { minHistory: 0 }), [
    { kind: 'longestScoringStreak', value: 4, beaten: true, players: ['Z'] },
  ])
})

test('recordNews: una serie record ancora aperta non fa notizia a ogni partita', () => {
  // z era gia' a 4 (record suo, gia' annunciato): arrivare a 5 non e' un nuovo avviso
  const last = m('m5b', '2026-01-29', 1, 1, [['x', 'a', 1], ['z', 'b', 1]])
  assert.deepEqual(recordNews([...matches.slice(0, 4), last], 'm5b', { minHistory: 0 }), [])
})

test('recordNews: una serie che raggiunge il record di un altro lo eguaglia', () => {
  // z si ferma a 4 (m1..m4). x segna in m5, m6x, m7x, m8x: alla quarta eguaglia, alla quinta supera
  const more = [
    m('m6x', '2026-02-05', 1, 0, [['x', 'a', 1], ['z', 'b', 0]]),
    m('m7x', '2026-02-12', 1, 0, [['x', 'a', 1]]),
    m('m8x', '2026-02-19', 1, 0, [['x', 'a', 1]]),
    m('m9x', '2026-02-26', 0, 1, [['x', 'b', 1]]),
  ]
  const scoring = (id: string, upTo: number) => recordNews([...matches, ...more.slice(0, upTo)], id, { minHistory: 0 }).filter((n) => n.kind === 'longestScoringStreak')
  assert.deepEqual(scoring('m7x', 2), [])
  assert.deepEqual(scoring('m8x', 3), [{ kind: 'longestScoringStreak', value: 4, beaten: false, players: ['X'] }])
  assert.deepEqual(scoring('m9x', 4), [{ kind: 'longestScoringStreak', value: 5, beaten: true, players: ['X'] }])
})

test('recordNews: una serie corta non fa notizia anche se eguaglia il record', () => {
  // record di vittorie di fila fermo a 1: eguagliarlo non e' una notizia
  const r = recordNews(matches, 'm5', { minHistory: 0 })
  assert.equal(r.some((n) => n.kind === 'longestWinStreak'), false)
})

test('recordNews: solo per l ultima partita giocata, e solo con abbastanza storia', () => {
  assert.deepEqual(recordNews([...matches, m6], 'm3'), [])
  assert.deepEqual(recordNews([...matches, m6], 'boh'), [])
  // di base servono almeno 5 partite prima: con 2 sole, niente
  assert.deepEqual(recordNews([matches[0], matches[1], m6], 'm6'), [])
  assert.equal(recordNews([matches[0], matches[1], m6], 'm6', { minHistory: 2 }).length > 0, true)
})

test('recordNewsLine: stesse parole della bacheca dei record', () => {
  assert.equal(recordNewsLine({ kind: 'biggestWin', value: 7, beaten: true, players: [] }), 'Vittoria più larga: 7 gol di scarto')
  assert.equal(recordNewsLine({ kind: 'mostGoalsMatch', value: 9, beaten: false, players: [] }), 'Partita con più gol: 9 gol in tutto')
  assert.equal(recordNewsLine({ kind: 'mostGoalsInMatch', value: 5, beaten: true, players: ['Marco'] }), 'Più gol in una partita: 5 gol · Marco')
  assert.equal(recordNewsLine({ kind: 'longestScoringStreak', value: 5, beaten: true, players: ['Zeno'] }), 'Serie di gol: 5 partite di fila in gol · Zeno')
  assert.equal(recordNewsLine({ kind: 'longestWinStreak', value: 6, beaten: false, players: ['Aldo', 'Bea'] }), 'Serie di vittorie: 6 vittorie di fila · Aldo, Bea')
})

test('recordNewsFresh: l avviso vale per una settimana dal giorno della partita', () => {
  const now = new Date('2026-11-16T10:00:00Z')
  assert.equal(recordNewsFresh('2026-11-13', now), true)
  assert.equal(recordNewsFresh('2026-11-09', now), true)
  assert.equal(recordNewsFresh('2026-11-08', now), false)
  // una data futura inserita per errore non fa partire nulla
  assert.equal(recordNewsFresh('2026-11-20', now), false)
})
