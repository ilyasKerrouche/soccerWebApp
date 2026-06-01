'use client'
import type { Player } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number }

type Props = {
  players: Player[]
  value: ScorerRow[]
  onChange: (v: ScorerRow[]) => void
  label: string
}

const fieldStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
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
      <div className="text-xs font-bold text-brand/80 mb-2 truncate">{label}</div>
      <div className="flex flex-col gap-2">
        {value.map((row, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-xl p-2.5" style={fieldStyle}>
            <select
              value={row.player_id}
              onChange={(e) => update(i, 'player_id', e.target.value)}
              className="w-full rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <button type="button" onClick={() => update(i, 'goals', Math.max(0, row.goals - 1))} className="text-white/60 w-6 h-6 flex items-center justify-center text-lg hover:text-white transition-colors">−</button>
                <span className="text-sm font-black w-4 text-center text-brand">{row.goals}</span>
                <button type="button" onClick={() => update(i, 'goals', row.goals + 1)} className="text-white/60 w-6 h-6 flex items-center justify-center text-lg hover:text-white transition-colors">+</button>
              </div>
              <button type="button" onClick={() => remove(i)} className="text-white/25 hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center transition-colors">×</button>
            </div>
          </div>
        ))}
      </div>
      {players.length > 0 && (
        <button
          type="button"
          onClick={add}
          className="text-brand/60 text-xs flex items-center gap-1 mt-2 hover:text-brand transition-colors"
        >
          ＋ marcatore
        </button>
      )}
      {players.length === 0 && (
        <div className="text-[10px] text-white/25 mt-1 italic">Seleziona prima i giocatori</div>
      )}
    </div>
  )
}
