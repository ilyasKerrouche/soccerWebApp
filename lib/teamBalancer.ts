// lib/teamBalancer.ts
// Modulo puro: divide i giocatori in due squadre equilibrate mantenendo
// l'imprevedibilita' dello shuffle.

export type BalanceInput = {
  id: string
  position: string | null
  rating: number
}

export type BalanceResult = {
  teamA: string[]
  teamB: string[]
  /** Somma dei rating per squadra, per mostrare l'equilibrio raggiunto. */
  ratingA: number
  ratingB: number
}

export const DEFAULT_ATTEMPTS = 200

const sum = (ids: string[], ratingOf: Map<string, number>) =>
  ids.reduce((s, id) => s + (ratingOf.get(id) ?? 0), 0)

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Genera piu' divisioni casuali e tiene la piu' equilibrata.
 *
 * Un greedy ottimale darebbe sempre la stessa identica divisione, rendendo
 * inutile ripremere il pulsante. Provando molte divisioni casuali si ottengono
 * squadre diverse a ogni chiamata ma tutte equilibrate.
 */
export function balanceTeams(players: BalanceInput[], attempts = DEFAULT_ATTEMPTS): BalanceResult {
  const ratingOf = new Map(players.map((p) => [p.id, p.rating]))

  // I portieri vanno uno per parte, ma solo se ce n'e' piu' di uno:
  // un portiere solo torna nel pool comune.
  const keepers = players.filter((p) => p.position === 'GK')
  const fixedA: string[] = []
  const fixedB: string[] = []
  let pool = players

  if (keepers.length >= 2) {
    const [first, second] = shuffled(keepers)
    fixedA.push(first.id)
    fixedB.push(second.id)
    pool = players.filter((p) => p.id !== first.id && p.id !== second.id)
  }

  const poolIds = pool.map((p) => p.id)
  const total = fixedA.length + fixedB.length + poolIds.length
  const targetA = Math.ceil(total / 2) - fixedA.length

  let best: { teamA: string[]; teamB: string[]; gap: number } | null = null

  for (let i = 0; i < attempts; i++) {
    const mixed = shuffled(poolIds)
    const teamA = [...fixedA, ...mixed.slice(0, targetA)]
    const teamB = [...fixedB, ...mixed.slice(targetA)]
    const gap = Math.abs(sum(teamA, ratingOf) - sum(teamB, ratingOf))
    if (!best || gap < best.gap) best = { teamA, teamB, gap }
  }

  const teamA = best?.teamA ?? fixedA
  const teamB = best?.teamB ?? fixedB

  return {
    teamA,
    teamB,
    ratingA: sum(teamA, ratingOf),
    ratingB: sum(teamB, ratingOf),
  }
}
