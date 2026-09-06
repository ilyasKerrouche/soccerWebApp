'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlayerSelector from './PlayerSelector'
import ScorerEntry from './ScorerEntry'
import { balanceTeams } from '@/lib/teamBalancer'
import { balancingRating, groupAverage } from '@/lib/rating'
import type { PlayerWithStats, MatchWithPlayers } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number; is_own_goal: boolean }
type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type SaveData = {
  played_at: string
  match_time: string | null
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  players: { player_id: string; team: 'a' | 'b'; goals: number; own_goals: number }[]
}

type Props = {
  players: PlayerWithStats[]
  existing?: MatchWithPlayers
  onSave: (data: SaveData) => Promise<void>
}

const fieldStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const inputClass = 'w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/40 transition-all placeholder-white/25'

export default function MatchForm({ players, existing, onSave }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpcoming, setIsUpcoming] = useState(existing?.is_upcoming ?? false)
  const [date, setDate] = useState(existing?.played_at ?? new Date().toISOString().split('T')[0])
  const [matchTime, setMatchTime] = useState(existing?.match_time?.slice(0, 5) ?? '')
  const [teamAName, setTeamAName] = useState(existing?.team_a_name ?? 'Team A')
  const [teamBName, setTeamBName] = useState(existing?.team_b_name ?? 'Team B')
  const [scoreA, setScoreA] = useState<number>(existing?.score_a ?? 0)
  const [scoreB, setScoreB] = useState<number>(existing?.score_b ?? 0)

  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(
    existing?.match_players.map((mp) => ({ player_id: mp.player_id, team: mp.team })) ?? []
  )
  const [scorersA, setScorersA] = useState<ScorerRow[]>(
    existing?.match_players.filter((mp) => mp.team === 'a' && mp.goals > 0).map((mp) => ({ player_id: mp.player_id, goals: mp.goals, is_own_goal: false })) ?? []
  )
  const [scorersB, setScorersB] = useState<ScorerRow[]>(
    existing?.match_players.filter((mp) => mp.team === 'b' && mp.goals > 0).map((mp) => ({ player_id: mp.player_id, goals: mp.goals, is_own_goal: false })) ?? []
  )

  const teamAPlayers = players.filter((p) => selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'a'))
  const teamBPlayers = players.filter((p) => selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'b'))

  const [balance, setBalance] = useState<{ a: number; b: number } | null>(null)

  const shuffle = () => {
    const ids = selectedPlayers.length > 0
      ? selectedPlayers.map(sp => sp.player_id)
      : players.map(p => p.id)
    const pool = players.filter(p => ids.includes(p.id))

    // La media va calcolata su tutti i giocatori, non solo sui convocati:
    // e' il livello del gruppo, non quello della singola partita.
    const groupAvg = groupAverage(players.map(p => p.record).filter((r): r is NonNullable<typeof r> => !!r))

    const { teamA, teamB, ratingA, ratingB } = balanceTeams(
      pool.map(p => ({ id: p.id, position: p.position, rating: balancingRating(p.record, groupAvg) }))
    )

    setSelectedPlayers([
      ...teamA.map(id => ({ player_id: id, team: 'a' as const })),
      ...teamB.map(id => ({ player_id: id, team: 'b' as const })),
    ])
    setBalance(
      teamA.length > 0 && teamB.length > 0
        ? { a: ratingA / teamA.length, b: ratingB / teamB.length }
        : null
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const goalsMap = new Map<string, number>()
      const ownGoalsMap = new Map<string, number>()

      scorersA.forEach((s) => {
        if (s.is_own_goal) {
          ownGoalsMap.set(s.player_id, (ownGoalsMap.get(s.player_id) ?? 0) + s.goals)
        } else {
          goalsMap.set(s.player_id, (goalsMap.get(s.player_id) ?? 0) + s.goals)
        }
      })
      scorersB.forEach((s) => {
        if (s.is_own_goal) {
          ownGoalsMap.set(s.player_id, (ownGoalsMap.get(s.player_id) ?? 0) + s.goals)
        } else {
          goalsMap.set(s.player_id, (goalsMap.get(s.player_id) ?? 0) + s.goals)
        }
      })

      await onSave({
        played_at: date,
        match_time: matchTime.trim() || null,
        team_a_name: teamAName,
        team_b_name: teamBName,
        score_a: isUpcoming ? null : scoreA,
        score_b: isUpcoming ? null : scoreB,
        is_upcoming: isUpcoming,
        players: selectedPlayers.map((sp) => ({
          player_id: sp.player_id,
          team: sp.team,
          goals: goalsMap.get(sp.player_id) ?? 0,
          own_goals: ownGoalsMap.get(sp.player_id) ?? 0,
        })),
      })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Upcoming toggle */}
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white/80">Partita futura</div>
          <div className="text-xs text-white/35 mt-0.5">Senza risultato finale</div>
        </div>
        <button
          type="button"
          onClick={() => setIsUpcoming(!isUpcoming)}
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isUpcoming ? 'bg-brand' : 'bg-white/15'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isUpcoming ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Date + Time */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2 font-bold">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
            style={fieldStyle}
          />
        </div>
        {isUpcoming && (
          <div className="w-32">
            <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2 font-bold">Orario</label>
            <input
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className={inputClass}
              style={fieldStyle}
              placeholder="--:--"
            />
          </div>
        )}
      </div>

      {/* Teams & Score */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2 font-bold">
          {isUpcoming ? 'Nomi team' : 'Punteggio'}
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex flex-col gap-2">
            <input
              className={inputClass}
              style={fieldStyle}
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="Team A"
            />
            {!isUpcoming && (
              <input
                type="number"
                min={0}
                value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'}
                style={fieldStyle}
              />
            )}
          </div>
          <span className="text-white/25 text-2xl font-light pb-1">–</span>
          <div className="flex-1 flex flex-col gap-2">
            <input
              className={inputClass}
              style={fieldStyle}
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="Team B"
            />
            {!isUpcoming && (
              <input
                type="number"
                min={0}
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'}
                style={fieldStyle}
              />
            )}
          </div>
        </div>
      </div>

      {/* Players */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold">
            Giocatori presenti
          </label>
          {isUpcoming && (
            <button
              type="button"
              onClick={shuffle}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(99,102,241,0.2))', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}
            >
              🔀 Shuffle team
            </button>
          )}
        </div>
        {isUpcoming && balance && (
          <div className="text-[10px] text-white/30 mb-2 tabular-nums">
            Equilibrio: {Math.round(balance.a * 100)}% vs {Math.round(balance.b * 100)}% di rendimento medio
          </div>
        )}
        <PlayerSelector players={players} value={selectedPlayers} onChange={setSelectedPlayers} />
      </div>

      {/* Scorers */}
      {!isUpcoming && (
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-3 font-bold">Marcatori</label>
          <div className="grid grid-cols-2 gap-4">
            <ScorerEntry players={teamAPlayers} value={scorersA} onChange={setScorersA} label={teamAName} />
            <ScorerEntry players={teamBPlayers} value={scorersB} onChange={setScorersB} label={teamBName} />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full font-black py-4 rounded-2xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
      >
        {loading ? 'Salvataggio…' : '💾 Salva partita'}
      </button>
    </form>
  )
}
