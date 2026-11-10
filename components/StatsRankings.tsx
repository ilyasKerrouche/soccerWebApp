'use client'
import { useState } from 'react'
import SeasonLink from './SeasonLink'
import FormDots from './FormDots'
import type { PlayerWithStats, PlayerWithGoalkeeperStats } from '@/lib/types'
import { C, Card } from './ui'
import PillTabs from './PillTabs'
import StreakFlame from './StreakFlame'
import RecordsBoard from './RecordsBoard'
import type { GoldenPair, Records } from '@/lib/records'
import type { Player } from '@/lib/types'

type Props = {
  players: PlayerWithStats[]
  goalkeepers: PlayerWithGoalkeeperStats[]
  motmCounts: Record<string, number>
  records: Records<Player>
  pairs: GoldenPair<Player>[]
}

const TABS = [
  { key: 'marcatori', label: 'Marcatori' },
  { key: 'presenze', label: 'Presenze' },
  { key: 'record', label: 'Record' },
  { key: 'portieri', label: 'Portieri' },
  { key: 'motm', label: 'MOTM' },
] as const

type TabKey = typeof TABS[number]['key']

const pct = (n: number) => `${Math.round(n * 100)}%`

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

/** Riga unica per tutte le classifiche, dentro il riquadro della classifica. */
function Row({
  href,
  rank,
  name,
  form,
  value,
  note,
  leader,
  first,
  streak = 0,
}: {
  href: string
  rank: number
  name: string
  form?: React.ReactNode
  value: React.ReactNode
  note?: string
  leader: boolean
  first: boolean
  streak?: number
}) {
  return (
    <SeasonLink
      href={href}
      className="flex items-center gap-2.5 py-2.5 px-3.5 transition-colors hover:bg-white/[0.03]"
      style={first ? undefined : { borderTop: `1px solid ${C.line}` }}
    >
      <span className={`numeric text-[13px] w-4 text-right ${leader ? 'text-brand font-bold' : 'text-muted'}`}>{rank}</span>
      <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10.5px] flex-shrink-0" style={{ background: C.surf2, color: C.muted }}>
        {initials(name)}
      </span>
      <span className={`flex-1 min-w-0 flex items-center gap-1.5 text-[13.5px] ${leader ? 'font-semibold text-white' : 'font-medium text-white/85'}`}>
        <span className="truncate">{name}</span>
        <StreakFlame streak={streak} withCount />
      </span>
      <span className="flex-shrink-0">{form}</span>
      <span className="text-right flex-shrink-0" style={{ width: 62 }}>
        <span className="numeric text-[19px] font-semibold leading-none block text-white/90">
          {value}
        </span>
        {note && <span className="text-[10px] tabular-nums text-muted block mt-0.5">{note}</span>}
      </span>
    </SeasonLink>
  )
}

export default function StatsRankings({ players, goalkeepers, motmCounts, records, pairs }: Props) {
  const [active, setActive] = useState<TabKey>('marcatori')
  const hasPortieri = goalkeepers.some((g) => g.appearances > 0)
  // Solo chi ha almeno un MOTM; la sezione sparisce se ancora nessuno ne ha.
  const byMotm = players
    .filter((p) => (motmCounts[p.id] ?? 0) >= 1)
    .sort((a, b) => motmCounts[b.id] - motmCounts[a.id] || a.name.localeCompare(b.name))
  const tabs = TABS.filter(
    (t) => (t.key !== 'portieri' || hasPortieri) && (t.key !== 'motm' || byMotm.length > 0),
  )

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)

  return (
    <div>
      <PillTabs tabs={tabs} active={active} onChange={setActive} />
      {active === 'record' ? (
        <div className="mt-4"><RecordsBoard records={records} pairs={pairs} /></div>
      ) : (
      <Card className="mt-2.5 overflow-hidden">

      {active === 'marcatori' && (
        <div className="animate-section">
          {byGoals.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              first={i === 0}
              name={p.name}
              leader={i === 0 && p.total_goals > 0}
              form={<FormDots form={p.record?.form} size={5} />}
              value={p.total_goals}
              streak={p.scoring_streak}
              note={
                p.record && p.record.played > 0
                  ? `${pct(p.record.win_rate)} vinte`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {active === 'presenze' && (
        <div className="animate-section">
          {byAppearances.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              first={i === 0}
              name={p.name}
              leader={i === 0 && p.total_appearances > 0}
              form={<FormDots form={p.record?.form} size={5} />}
              value={p.total_appearances}
              note={p.record && p.record.played > 0 ? `${pct(p.record.win_rate)} vinte` : undefined}
            />
          ))}
        </div>
      )}

      {active === 'portieri' && hasPortieri && (
        <div className="animate-section">
          {goalkeepers.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              first={i === 0}
              name={p.name}
              leader={i === 0 && p.appearances > 0}
              value={p.appearances > 0 ? p.avg_conceded : <span className="text-muted">—</span>}
              note={p.appearances > 0 ? `${p.clean_sheets} inviolate` : 'mai giocato'}
            />
          ))}
        </div>
      )}

      {active === 'motm' && byMotm.length > 0 && (
        <div className="animate-section">
          {byMotm.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              first={i === 0}
              name={p.name}
              leader={i === 0}
              value={<span style={{ color: C.gold }}>★ {motmCounts[p.id]}</span>}
              note="MOTM"
            />
          ))}
        </div>
      )}
      </Card>
      )}
    </div>
  )
}
