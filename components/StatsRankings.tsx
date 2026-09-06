'use client'
import { useState } from 'react'
import Link from 'next/link'
import FormDots from './FormDots'
import type { PlayerWithStats, PlayerWithGoalkeeperStats } from '@/lib/types'

type Props = {
  players: PlayerWithStats[]
  goalkeepers: PlayerWithGoalkeeperStats[]
}

const TABS = [
  { key: 'marcatori', label: 'Marcatori' },
  { key: 'presenze', label: 'Presenze' },
  { key: 'rendimento', label: 'Rendimento' },
  { key: 'portieri', label: 'Portieri' },
] as const

type TabKey = typeof TABS[number]['key']

const pct = (n: number) => `${Math.round(n * 100)}%`

/**
 * Riga unica per tutte le classifiche: niente card, solo un filetto di
 * separazione. Cosi' l'unico oggetto in rilievo della schermata resta la card
 * del giocatore sul podio.
 */
function Row({
  href,
  rank,
  name,
  form,
  value,
  note,
  leader,
}: {
  href: string
  rank: number
  name: string
  form?: React.ReactNode
  value: React.ReactNode
  note?: string
  leader: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 py-2.5 px-1 rule transition-colors hover:bg-white/[0.025]"
    >
      <span className={`numeric text-xs w-4 text-right ${leader ? 'text-brand' : 'text-white/25'}`}>{rank}</span>
      <span className={`flex-1 min-w-0 text-[13px] truncate ${leader ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
        {name}
      </span>
      <span className="flex-shrink-0">{form}</span>
      <span className="text-right flex-shrink-0" style={{ width: 62 }}>
        <span className={`numeric text-[17px] font-semibold leading-none block ${leader ? 'text-brand' : 'text-white/70'}`}>
          {value}
        </span>
        {note && <span className="numeric text-[9px] text-white/25 block mt-0.5">{note}</span>}
      </span>
    </Link>
  )
}

export default function StatsRankings({ players, goalkeepers }: Props) {
  const [active, setActive] = useState<TabKey>('marcatori')
  const hasPortieri = goalkeepers.some((g) => g.appearances > 0)
  const tabs = TABS.filter((t) => t.key !== 'portieri' || hasPortieri)

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)

  // Chi non ha ancora giocato va in fondo: uno 0% sembrerebbe un giudizio.
  const byRecord = [...players].sort((a, b) => {
    const pa = a.record?.played ?? 0
    const pb = b.record?.played ?? 0
    if (pa === 0 || pb === 0) return pa === pb ? a.name.localeCompare(b.name) : pa === 0 ? 1 : -1
    const wa = a.record?.win_rate ?? 0
    const wb = b.record?.win_rate ?? 0
    return wa !== wb ? wb - wa : pb - pa
  })

  return (
    <div>
      {/* Controllo segmentato: un filetto continuo, l'attivo si accende sotto. */}
      <div className="flex rule mb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 min-w-0 pb-2 pt-3 text-[11.5px] whitespace-nowrap transition-colors relative ${
              active === key ? 'text-white font-semibold' : 'text-white/35 font-medium hover:text-white/60'
            }`}
          >
            {label}
            {active === key && (
              <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full" style={{ background: '#a78bfa' }} />
            )}
          </button>
        ))}
      </div>

      {active === 'marcatori' && (
        <div className="animate-section">
          {byGoals.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              name={p.name}
              leader={i === 0 && p.total_goals > 0}
              form={<FormDots form={p.record?.form} size={5} />}
              value={p.total_goals}
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
              name={p.name}
              leader={i === 0 && p.total_appearances > 0}
              form={<FormDots form={p.record?.form} size={5} />}
              value={p.total_appearances}
              note={p.record && p.record.played > 0 ? `${pct(p.record.win_rate)} vinte` : undefined}
            />
          ))}
        </div>
      )}

      {active === 'rendimento' && (
        <div className="animate-section">
          {byRecord.map((p, i) => {
            const rec = p.record
            const played = (rec?.played ?? 0) > 0
            return (
              <Row
                key={p.id}
                href={`/players/${p.id}`}
                rank={i + 1}
                name={p.name}
                leader={i === 0 && played}
                form={<FormDots form={rec?.form} size={5} />}
                value={played && rec ? pct(rec.win_rate) : <span className="text-white/15">—</span>}
                note={played && rec ? `${rec.wins}V ${rec.draws}N ${rec.losses}P` : 'mai giocato'}
              />
            )
          })}
        </div>
      )}

      {active === 'portieri' && hasPortieri && (
        <div className="animate-section">
          {goalkeepers.map((p, i) => (
            <Row
              key={p.id}
              href={`/players/${p.id}`}
              rank={i + 1}
              name={p.name}
              leader={i === 0 && p.appearances > 0}
              value={p.appearances > 0 ? p.avg_conceded : <span className="text-white/15">—</span>}
              note={p.appearances > 0 ? `${p.clean_sheets} inviolate` : 'mai giocato'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
