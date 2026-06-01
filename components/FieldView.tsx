'use client'
import PlayerCard from './PlayerCard'
import type { MatchWithPlayers } from '@/lib/types'

export default function FieldView({ match }: { match: MatchWithPlayers }) {
  const teamA = match.match_players.filter((mp) => mp.team === 'a')
  const teamB = match.match_players.filter((mp) => mp.team === 'b')

  function chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    )
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: '#1a4731', aspectRatio: '16/9' }}
    >
      {/* Stripe pattern */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(90deg,transparent,transparent 6.25%,rgba(0,0,0,.07) 6.25%,rgba(0,0,0,.07) 12.5%)',
        }}
      />
      {/* Field lines SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 450"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      >
        <rect x="20" y="20" width="760" height="410" rx="4" />
        <line x1="400" y1="20" x2="400" y2="430" />
        <circle cx="400" cy="225" r="60" />
        <circle cx="400" cy="225" r="3" fill="rgba(255,255,255,0.15)" />
        <rect x="20" y="135" width="120" height="180" />
        <rect x="660" y="135" width="120" height="180" />
        <rect x="20" y="175" width="50" height="100" />
        <rect x="730" y="175" width="50" height="100" />
      </svg>
      {/* Players */}
      <div className="absolute inset-0 flex">
        {[
          { players: teamA, label: match.team_a_name },
          { players: teamB, label: match.team_b_name },
        ].map(({ players, label }) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 relative"
          >
            <span className="absolute top-2 text-[9px] font-bold tracking-widest uppercase text-white/25">
              {label}
            </span>
            {chunk(players, 2).map((row, i) => (
              <div key={i} className="flex gap-1.5 justify-center">
                {row.map((mp) => (
                  <PlayerCard
                    key={mp.player_id}
                    player={mp.player}
                    width={58}
                    className="shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
