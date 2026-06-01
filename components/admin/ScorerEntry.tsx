'use client'
import type { Player } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number }

type Props = {
  players: Player[]
  value: ScorerRow[]
  onChange: (v: ScorerRow[]) => void
  label: string
}

export default function ScorerEntry({ players, value, onChange, label }: Props) {
  const add = () => {
    if (players.length === 0) return
    onChange([...value, { player_id: players[0].id, goals: 1 }])
  }

  const update = (index: number, field: keyof ScorerRow, val: string | number) => {
    onChange(value.map((row, i) => (i === index ? { ...row, [field]: val } : row)))
  }

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">{label}</div>
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <select
            value={row.player_id}
            onChange={(e) => update(i, 'player_id', e.target.value)}
            className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-xl px-2 py-1.5">
            <button
              type="button"
              onClick={() => update(i, 'goals', Math.max(0, row.goals - 1))}
              className="text-white/50 text-lg w-6 h-6 flex items-center justify-center"
            >
              −
            </button>
            <span className="text-sm font-bold w-5 text-center">{row.goals}</span>
            <button
              type="button"
              onClick={() => update(i, 'goals', row.goals + 1)}
              className="text-white/50 text-lg w-6 h-6 flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-white/25 hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-brand/70 text-xs flex items-center gap-1 mt-1 hover:text-brand transition-colors"
      >
        ＋ Aggiungi marcatore
      </button>
    </div>
  )
}
