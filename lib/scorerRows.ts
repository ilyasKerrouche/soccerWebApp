// lib/scorerRows.ts
// Modulo puro: le righe "marcatori" del form partita (components/admin/MatchForm.tsx).

export type ScorerRow = { player_id: string; goals: number; is_own_goal: boolean }

type LineupRow = { player_id: string; team: 'a' | 'b'; goals: number; own_goals: number }

/** Righe iniziali di una squadra quando si modifica una partita: i gol e, separati, gli autogol. */
export function initialScorerRows(lineup: LineupRow[], team: 'a' | 'b'): ScorerRow[] {
  return lineup
    .filter((mp) => mp.team === team)
    .flatMap((mp) => [
      ...(mp.goals > 0 ? [{ player_id: mp.player_id, goals: mp.goals, is_own_goal: false }] : []),
      ...(mp.own_goals > 0 ? [{ player_id: mp.player_id, goals: mp.own_goals, is_own_goal: true }] : []),
    ])
}

/** Toglie le righe di chi non e' (piu') in quella squadra: altrimenti i gol finirebbero a un nome non mostrato. */
export function pruneScorerRows(rows: ScorerRow[], teamPlayerIds: string[]): ScorerRow[] {
  const ids = new Set(teamPlayerIds)
  const kept = rows.filter((r) => ids.has(r.player_id))
  return kept.length === rows.length ? rows : kept
}
