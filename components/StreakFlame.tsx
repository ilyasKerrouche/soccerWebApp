/** Serie di gol: la fiamma compare da 3 partite di fila con almeno un gol. */
export const STREAK_MIN = 3

export default function StreakFlame({ streak, withCount = false }: { streak: number; withCount?: boolean }) {
  if (streak < STREAK_MIN) return null
  const label = `In gol da ${streak} partite di fila`
  return (
    <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-[12px] leading-none" title={label} aria-label={label} role="img">
      🔥{withCount && <span className="numeric text-[13px] font-semibold" style={{ color: '#fb923c' }}>{streak}</span>}
    </span>
  )
}
