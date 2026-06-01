'use client'
import type { MatchGoalPoint } from '@/lib/queries/stats'

export default function BarChart({ data }: { data: MatchGoalPoint[] }) {
  const max = Math.max(...data.map((d) => d.total_goals), 1)
  const reversed = [...data].reverse()

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-end gap-1.5 h-20">
        {reversed.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-white/30">{d.total_goals}</span>
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${(d.total_goals / max) * 100}%`,
                minHeight: 4,
                background: d.total_goals === max
                  ? 'rgba(167,139,250,0.7)'
                  : 'rgba(167,139,250,0.25)',
                boxShadow: d.total_goals === max ? '0 0 10px rgba(167,139,250,0.4)' : 'none',
              }}
            />
            <span className="text-[8px] text-white/20 whitespace-nowrap">
              {new Date(d.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
