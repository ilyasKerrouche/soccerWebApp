/**
 * Bacheca dei record e coppie d'oro (scheda "Record" delle Statistiche).
 * Funzioni pure sulle partite gia' caricate con le formazioni: nessuna query qui.
 * Contano solo le partite giocate con il risultato inserito.
 */

type MinPlayer = { id: string; name: string }

export type RMatch<P extends MinPlayer = MinPlayer> = {
  id: string
  played_at: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  team_a_name: string
  team_b_name: string
  match_players: { player_id: string; team: 'a' | 'b'; goals: number; player: P }[]
}

/** Quanti detentori si mostrano a pari merito; gli altri sono solo contati. */
const MAX_HOLDERS = 3

export type MatchRecord = {
  value: number
  matches: { id: string; played_at: string; team_a_name: string; team_b_name: string; score_a: number; score_b: number }[]
  more: number
}
export type PlayerRecord<P> = { value: number; holders: { player: P; matchId?: string; played_at?: string }[]; more: number }

export type Records<P> = {
  biggestWin: MatchRecord | null
  mostGoalsMatch: MatchRecord | null
  mostGoalsInMatch: PlayerRecord<P> | null
  longestScoringStreak: PlayerRecord<P> | null
  longestWinStreak: PlayerRecord<P> | null
  /** Chi ha piu' partite con esattamente 2, 3, 4 gol, e con 5 o piu' (manita). */
  multi: {
    braces: PlayerRecord<P> | null
    hatTricks: PlayerRecord<P> | null
    pokers: PlayerRecord<P> | null
    manitas: PlayerRecord<P> | null
  }
}

type Played<P extends MinPlayer> = RMatch<P> & { score_a: number; score_b: number }

const playedOnly = <P extends MinPlayer>(ms: RMatch<P>[]): Played<P>[] =>
  ms
    .filter((m): m is Played<P> => !m.is_upcoming && m.score_a !== null && m.score_b !== null)
    .sort((a, b) => a.played_at.localeCompare(b.played_at) || a.id.localeCompare(b.id))

/** Il massimo e chi lo raggiunge; 0 non e' un record. */
function top<T>(items: T[], value: (t: T) => number, order: (a: T, b: T) => number) {
  const best = items.reduce((mx, t) => Math.max(mx, value(t)), 0)
  if (best <= 0) return null
  const all = items.filter((t) => value(t) === best).sort(order)
  return { value: best, list: all.slice(0, MAX_HOLDERS), more: Math.max(0, all.length - MAX_HOLDERS) }
}

const newestFirst = (a: { played_at?: string }, b: { played_at?: string }) => (b.played_at ?? '').localeCompare(a.played_at ?? '')

function matchRecord<P extends MinPlayer>(ms: Played<P>[], value: (m: Played<P>) => number): MatchRecord | null {
  const t = top(ms, value, newestFirst)
  if (!t) return null
  return {
    value: t.value,
    matches: t.list.map(({ id, played_at, team_a_name, team_b_name, score_a, score_b }) => ({ id, played_at, team_a_name, team_b_name, score_a, score_b })),
    more: t.more,
  }
}

/** Per ogni giocatore, le sue partite in ordine di data, con gol ed esito. */
function perPlayer<P extends MinPlayer>(ms: Played<P>[]) {
  const map = new Map<string, { player: P; games: { matchId: string; played_at: string; goals: number; result: number }[] }>()
  for (const m of ms) {
    for (const mp of m.match_players) {
      const diff = mp.team === 'a' ? m.score_a - m.score_b : m.score_b - m.score_a
      const entry = map.get(mp.player_id) ?? { player: mp.player, games: [] }
      entry.games.push({ matchId: m.id, played_at: m.played_at, goals: mp.goals, result: Math.sign(diff) })
      map.set(mp.player_id, entry)
    }
  }
  return Array.from(map.values())
}

function longestRun<T>(xs: T[], ok: (x: T) => boolean) {
  let best = 0
  let cur = 0
  for (const x of xs) {
    cur = ok(x) ? cur + 1 : 0
    best = Math.max(best, cur)
  }
  return best
}

function playerRecord<P extends MinPlayer>(rows: { player: P; value: number }[]): PlayerRecord<P> | null {
  const t = top(rows, (r) => r.value, (a, b) => a.player.name.localeCompare(b.player.name))
  return t && { value: t.value, holders: t.list.map((r) => ({ player: r.player })), more: t.more }
}

/** Chi ha piu' partite con un certo numero di gol. */
function countGames<P extends MinPlayer>(players: ReturnType<typeof perPlayer<P>>, ok: (goals: number) => boolean) {
  return playerRecord(players.map((p) => ({ player: p.player, value: p.games.filter((x) => ok(x.goals)).length })))
}

export function computeRecords<P extends MinPlayer>(matches: RMatch<P>[]): Records<P> {
  const ms = playedOnly(matches)
  const players = perPlayer(ms)

  const single = ms.flatMap((m) => m.match_players.map((mp) => ({ player: mp.player, value: mp.goals, matchId: m.id, played_at: m.played_at })))
  const g = top(single, (s) => s.value, (a, b) => newestFirst(a, b) || a.player.name.localeCompare(b.player.name))

  return {
    biggestWin: matchRecord(ms, (m) => Math.abs(m.score_a - m.score_b)),
    mostGoalsMatch: matchRecord(ms, (m) => m.score_a + m.score_b),
    mostGoalsInMatch: g && {
      value: g.value,
      holders: g.list.map(({ player, matchId, played_at }) => ({ player, matchId, played_at })),
      more: g.more,
    },
    longestScoringStreak: playerRecord(players.map((p) => ({ player: p.player, value: longestRun(p.games, (x) => x.goals > 0) }))),
    longestWinStreak: playerRecord(players.map((p) => ({ player: p.player, value: longestRun(p.games, (x) => x.result > 0) }))),
    multi: {
      braces: countGames(players, (g) => g === 2),
      hatTricks: countGames(players, (g) => g === 3),
      pokers: countGames(players, (g) => g === 4),
      manitas: countGames(players, (g) => g >= 5),
    },
  }
}

export type GoldenPair<P> = { a: P; b: P; games: number; wins: number; draws: number; winRate: number }

/**
 * Le coppie che vincono di piu' quando giocano nella stessa squadra.
 * Ordine "prudente": come se ogni coppia avesse una vittoria e una sconfitta in piu',
 * cosi' chi ha giocato poco insieme non scavalca chi ha giocato tanto. A schermo va la percentuale vera.
 */
export function goldenPairs<P extends MinPlayer>(
  matches: RMatch<P>[],
  { minGames = 5, limit = 5 }: { minGames?: number; limit?: number } = {},
): GoldenPair<P>[] {
  const map = new Map<string, GoldenPair<P>>()
  for (const m of playedOnly(matches)) {
    for (const team of ['a', 'b'] as const) {
      const mates = m.match_players.filter((mp) => mp.team === team).sort((x, y) => x.player_id.localeCompare(y.player_id))
      const diff = team === 'a' ? m.score_a - m.score_b : m.score_b - m.score_a
      for (let i = 0; i < mates.length; i++) {
        for (let j = i + 1; j < mates.length; j++) {
          const key = `${mates[i].player_id}|${mates[j].player_id}`
          const p = map.get(key) ?? { a: mates[i].player, b: mates[j].player, games: 0, wins: 0, draws: 0, winRate: 0 }
          p.games++
          if (diff > 0) p.wins++
          if (diff === 0) p.draws++
          map.set(key, p)
        }
      }
    }
  }
  const prudent = (p: GoldenPair<P>) => (p.wins + 1) / (p.games + 2)
  return Array.from(map.values())
    .filter((p) => p.games >= minGames)
    .map((p) => ({ ...p, winRate: p.wins / p.games }))
    .sort((x, y) => prudent(y) - prudent(x) || y.games - x.games || `${x.a.name}${x.b.name}`.localeCompare(`${y.a.name}${y.b.name}`))
    .slice(0, limit)
}
