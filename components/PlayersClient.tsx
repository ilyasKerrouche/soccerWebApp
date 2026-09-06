'use client'
import { useState } from 'react'
import Link from 'next/link'
import PodiumView from './PodiumView'
import PlayerCard from './PlayerCard'
import PageHeader from './PageHeader'
import FormDots from './FormDots'
import RankDelta, { buildRankDeltas, comparePlayers, type SortKey } from './RankDelta'
import type { PlayerWithStats } from '@/lib/types'

const SORTS = [
  { key: 'goals', label: 'Gol' },
  { key: 'appearances', label: 'Presenze' },
  { key: 'name', label: 'A–Z' },
] as const

export default function PlayersClient({ initialPlayers }: { initialPlayers: PlayerWithStats[] }) {
  const [sort, setSort] = useState<SortKey>('goals')

  const sorted = [...initialPlayers].sort(comparePlayers(sort))
  const deltas = buildRankDeltas(initialPlayers, sort)

  // Con l'ordine alfabetico un podio non ha senso: e' un elenco, non una classifica.
  const isRanking = sort !== 'name'
  const podium = isRanking ? sorted.slice(0, 3) : []
  const rest = isRanking ? sorted.slice(3) : sorted

  return (
    <main className="pb-6 px-4">
      <PageHeader
        eyebrow="Stagione 2025/26"
        title="Giocatori"
        aside={<span className="text-[13px] text-white/30">{initialPlayers.length}</span>}
      />

      <div className="flex rule mt-4 mb-1">
        {SORTS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`flex-1 min-w-0 pb-2 pt-3 text-[11.5px] whitespace-nowrap transition-colors relative ${
              sort === key ? 'text-white font-semibold' : 'text-white/35 font-medium hover:text-white/60'
            }`}
          >
            {label}
            {sort === key && (
              <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full" style={{ background: '#a78bfa' }} />
            )}
          </button>
        ))}
      </div>

      {isRanking && <PodiumView players={podium} deltas={deltas} />}

      <div className={isRanking ? 'mt-2' : ''}>
        {rest.map((p, i) => (
          <Link
            key={p.id}
            href={`/players/${p.id}`}
            className="flex items-center gap-2.5 py-2 px-1 rule transition-colors hover:bg-white/[0.025]"
          >
            <span className="numeric text-xs w-5 text-right text-white/25">{isRanking ? i + 4 : i + 1}</span>
            <span className="w-6 flex justify-center flex-shrink-0">
              <RankDelta delta={deltas.get(p.id) ?? null} isNew={isRanking && (p.record?.played ?? 0) === 0} />
            </span>
            <span className="w-8 flex-shrink-0">
              <PlayerCard player={p} width={32} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium text-white/85 truncate">{p.name}</span>
              {p.position && <span className="block text-[10px] text-white/30">{p.position}</span>}
            </span>
            <span className="flex-shrink-0">
              <FormDots form={p.record?.form} size={5} />
            </span>
            <span className="text-right flex-shrink-0" style={{ width: 54 }}>
              <span className="numeric text-[17px] font-semibold text-white/70 leading-none block">
                {sort === 'appearances' ? p.total_appearances : p.total_goals}
              </span>
              <span className="numeric text-[9px] text-white/25 block mt-0.5">
                {sort === 'appearances' ? 'presenze' : 'gol'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
