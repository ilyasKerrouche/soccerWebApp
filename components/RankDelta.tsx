import type { PlayerWithStats } from '@/lib/types'

export type SortKey = 'goals' | 'appearances' | 'name'

// Comparatore unico per classifica attuale e precedente. Il tiebreak deterministico
// e' essenziale: senza, i pari merito si scambiano di posto tra i due ordinamenti
// e comparirebbero frecce inesistenti.
export function comparePlayers(sort: SortKey, prev = false) {
  const goals = (p: PlayerWithStats) => (prev ? p.prev_goals ?? 0 : p.total_goals)
  const apps = (p: PlayerWithStats) => (prev ? p.prev_appearances ?? 0 : p.total_appearances)
  return (a: PlayerWithStats, b: PlayerWithStats) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'goals' && goals(a) !== goals(b)) return goals(b) - goals(a)
    if (apps(a) !== apps(b)) return apps(b) - apps(a)
    if (goals(a) !== goals(b)) return goals(b) - goals(a)
    return a.name.localeCompare(b.name)
  }
}

// delta > 0 = salito, delta < 0 = sceso, null = nessun movimento da mostrare
export function buildRankDeltas(players: PlayerWithStats[], sort: SortKey): Map<string, number | null> {
  const deltas = new Map<string, number | null>()
  if (sort === 'name') {
    for (const p of players) deltas.set(p.id, null)
    return deltas
  }
  const current = [...players].sort(comparePlayers(sort))
  const previous = [...players].sort(comparePlayers(sort, true))
  const prevIndex = new Map(previous.map((p, i) => [p.id, i]))
  current.forEach((p, i) => {
    // Chi non aveva ancora giocato prima dell'ultima giornata non "sale": entra.
    deltas.set(p.id, (p.prev_appearances ?? 0) === 0 ? null : (prevIndex.get(p.id) ?? i) - i)
  })
  return deltas
}

type Props = {
  delta: number | null
  isNew?: boolean
  /** Nelle liste il trattino tiene ferma la colonna; dove non c'e' colonna e' solo rumore. */
  hideEmpty?: boolean
  className?: string
}

export default function RankDelta({ delta, isNew = false, hideEmpty = false, className = '' }: Props) {
  if (isNew) {
    if (hideEmpty) return null
    return (
      <span
        className={`text-[8px] font-black tracking-wide px-1.5 py-0.5 rounded ${className}`}
        style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}
      >
        NEW
      </span>
    )
  }
  if (delta === null || delta === 0) {
    if (hideEmpty) return null
    return <span className={`text-[10px] text-white/20 ${className}`}>–</span>
  }

  const up = delta > 0
  return (
    <span
      className={`text-[10px] font-black leading-none tabular-nums ${className}`}
      style={{ color: up ? '#4ade80' : '#f87171' }}
      title={`${up ? 'Salito' : 'Sceso'} di ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'posizione' : 'posizioni'}`}
    >
      {up ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  )
}
