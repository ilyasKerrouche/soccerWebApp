'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlayerSelector from './PlayerSelector'
import ScorerEntry from './ScorerEntry'
import type { Player, MatchWithPlayers } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number }
type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type SaveData = {
  played_at: string
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  players: { player_id: string; team: 'a' | 'b'; goals: number }[]
}

type Props = {
  players: Player[]
  existing?: MatchWithPlayers
  onSave: (data: SaveData) => Promise<void>
}

export default function MatchForm({ players, existing, onSave }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isUpcoming, setIsUpcoming] = useState(existing?.is_upcoming ?? false)
  const [date, setDate] = useState(
    existing?.played_at ?? new Date().toISOString().split('T')[0]
  )
  const [teamAName, setTeamAName] = useState(existing?.team_a_name ?? 'Team A')
  const [teamBName, setTeamBName] = useState(existing?.team_b_name ?? 'Team B')
  const [scoreA, setScoreA] = useState<number>(existing?.score_a ?? 0)
  const [scoreB, setScoreB] = useState<number>(existing?.score_b ?? 0)

  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(
    existing?.match_players.map((mp) => ({
      player_id: mp.player_id,
      team: mp.team,
    })) ?? []
  )

  const [scorersA, setScorersA] = useState<ScorerRow[]>(
    existing?.match_players
      .filter((mp) => mp.team === 'a' && mp.goals > 0)
      .map((mp) => ({ player_id: mp.player_id, goals: mp.goals })) ?? []
  )
  const [scorersB, setScorersB] = useState<ScorerRow[]>(
    existing?.match_players
      .filter((mp) => mp.team === 'b' && mp.goals > 0)
      .map((mp) => ({ player_id: mp.player_id, goals: mp.goals })) ?? []
  )

  const teamAPlayers = players.filter((p) =>
    selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'a')
  )
  const teamBPlayers = players.filter((p) =>
    selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'b')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const scorerMap = new Map<string, number>()
      ;[...scorersA, ...scorersB].forEach((s) => {
        scorerMap.set(s.player_id, (scorerMap.get(s.player_id) ?? 0) + s.goals)
      })

      await onSave({
        played_at: date,
        team_a_name: teamAName,
        team_b_name: teamBName,
        score_a: isUpcoming ? null : scoreA,
        score_b: isUpcoming ? null : scoreB,
        is_upcoming: isUpcoming,
        players: selectedPlayers.map((sp) => ({
          player_id: sp.player_id,
          team: sp.team,
          goals: scorerMap.get(sp.player_id) ?? 0,
        })),
      })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      alert('Errore nel salvataggio: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand/40'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Upcoming toggle */}
      <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
        <label className="flex-1 text-sm text-white/70">
          Partita futura (senza risultato)
        </label>
        <button
          type="button"
          onClick={() => setIsUpcoming(!isUpcoming)}
          className={`w-11 h-6 rounded-full transition-colors ${
            isUpcoming ? 'bg-brand' : 'bg-white/15'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
              isUpcoming ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">
          Data
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Score */}
      {!isUpcoming && (
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">
            Punteggio
          </label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input
                className={inputClass + ' mb-1.5'}
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                placeholder="Nome team A"
              />
              <input
                type="number"
                min={0}
                value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'}
              />
            </div>
            <span className="text-white/20 text-2xl font-light">–</span>
            <div className="flex-1">
              <input
                className={inputClass + ' mb-1.5'}
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                placeholder="Nome team B"
              />
              <input
                type="number"
                min={0}
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Players */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">
          Giocatori presenti (seleziona team A/B)
        </label>
        <PlayerSelector
          players={players}
          value={selectedPlayers}
          onChange={setSelectedPlayers}
        />
      </div>

      {/* Scorers */}
      {!isUpcoming && (
        <div className="grid grid-cols-2 gap-4">
          <ScorerEntry
            players={teamAPlayers}
            value={scorersA}
            onChange={setScorersA}
            label={`Marcatori ${teamAName}`}
          />
          <ScorerEntry
            players={teamBPlayers}
            value={scorersB}
            onChange={setScorersB}
            label={`Marcatori ${teamBName}`}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-black font-black py-4 rounded-2xl text-base hover:bg-green-400 transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvataggio…' : '💾 Salva partita'}
      </button>
    </form>
  )
}
