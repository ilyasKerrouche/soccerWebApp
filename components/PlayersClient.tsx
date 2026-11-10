'use client'
import { useState } from 'react'
import SeasonLink from './SeasonLink'
import PodiumView from './PodiumView'
import PlayerCard from './PlayerCard'
import PageHeader from './PageHeader'
import FormDots from './FormDots'
import StreakFlame from './StreakFlame'
import { comparePlayers, type SortKey } from '@/lib/ranking'
import type { PlayerWithStats } from '@/lib/types'

const SORTS = [
  { key: 'goals', label: 'Gol' },
  { key: 'appearances', label: 'Presenze' },
  { key: 'name', label: 'A–Z' },
] as const

type Props = {
  initialPlayers: PlayerWithStats[]
  /** Selettore della stagione, accanto al titolo. */
  picker: React.ReactNode
  /** Stagione senza partite: al posto della lista si mostra solo questo testo. */
  emptyText: string | null
}

export default function PlayersClient({ initialPlayers, picker, emptyText }: Props) {
  const [sort, setSort] = useState<SortKey>('goals')

  const sorted = [...initialPlayers].sort(comparePlayers(sort))

  // Con l'ordine alfabetico un podio non ha senso: e' un elenco, non una classifica.
  const isRanking = sort !== 'name'
  const podium = isRanking ? sorted.slice(0, 3) : []
  const rest = isRanking ? sorted.slice(3) : sorted

  return (
    <main className="pb-6 px-4">
      <PageHeader
        eyebrow={`${initialPlayers.length} giocatori`}
        title="Giocatori"
        aside={picker}
      />

      {emptyText ? (
        <p className="text-[13px] text-center py-10 text-muted">{emptyText}</p>
      ) : (
      <>

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
              <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full" style={{ background: '#5b9cff' }} />
            )}
          </button>
        ))}
      </div>

      {isRanking && <PodiumView players={podium} />}

      <div className={isRanking ? 'mt-2' : ''}>
        {rest.map((p, i) => (
          <SeasonLink
            key={p.id}
            href={`/players/${p.id}`}
            className="flex items-center gap-2.5 py-2 px-1 rule transition-colors hover:bg-white/[0.025]"
          >
            <span className="numeric text-[13px] w-5 text-right text-white/25">{isRanking ? i + 4 : i + 1}</span>
            <span className="w-8 flex-shrink-0">
              <PlayerCard player={p} width={32} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-white/85">
                <span className="truncate">{p.name}</span>
                {sort === 'goals' && <StreakFlame streak={p.scoring_streak} withCount />}
              </span>
              {p.position && <span className="block text-[10px] text-white/30">{p.position}</span>}
            </span>
            <span className="flex-shrink-0">
              <FormDots form={p.record?.form} size={5} />
            </span>
            <span className="text-right flex-shrink-0" style={{ width: 54 }}>
              <span className="numeric text-[20px] font-semibold text-white/70 leading-none block">
                {sort === 'appearances' ? p.total_appearances : p.total_goals}
              </span>
              <span className="text-[9px] text-white/25 block mt-0.5">
                {sort === 'appearances' ? 'presenze' : 'gol'}
              </span>
            </span>
          </SeasonLink>
        ))}
      </div>
      </>
      )}
    </main>
  )
}
