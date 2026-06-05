# Collapsible Stats Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere le sezioni di classifica nella pagina Stats collassabili tramite chip filtro, con solo "Marcatori" attivo di default.

**Architecture:** La `app/stats/page.tsx` rimane server component e continua a fetchare i dati. Le tre sezioni di classifica (marcatori, presenze, portieri) vengono estratte in un nuovo `components/StatsRankings.tsx` client component che gestisce lo stato dei chip con `useState`. Hero, podio e box stagione rimangono server-rendered.

**Tech Stack:** Next.js 14 App Router, React `useState`, TypeScript, Tailwind CSS

---

## File Map

| File | Azione |
|------|--------|
| `components/StatsRankings.tsx` | Crea: client component con chip toggle + sezioni classifiche |
| `app/stats/page.tsx` | Modifica: rimuove le 3 sezioni classifica, aggiunge `<StatsRankings />` |

---

## Task 1: Creare il componente StatsRankings

**Files:**
- Create: `components/StatsRankings.tsx`

- [ ] **Step 1: Creare `components/StatsRankings.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { PlayerWithStats, PlayerWithGoalkeeperStats } from '@/lib/types'

type Props = {
  players: PlayerWithStats[]
  goalkeepers: PlayerWithGoalkeeperStats[]
}

const CHIPS = [
  { key: 'marcatori', label: '🥇 Marcatori' },
  { key: 'presenze', label: '👟 Presenze' },
  { key: 'portieri', label: '🥅 Portieri' },
] as const

type ChipKey = typeof CHIPS[number]['key']

export default function StatsRankings({ players, goalkeepers }: Props) {
  const [active, setActive] = useState<Set<ChipKey>>(new Set(['marcatori']))

  const hasPortieri = goalkeepers.some(g => g.appearances > 0)

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)

  const toggle = (key: ChipKey) => {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const chipStyle = (key: ChipKey): React.CSSProperties => active.has(key)
    ? { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa' }
    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }

  return (
    <div className="flex flex-col gap-6">
      {/* Chips */}
      <div className="flex gap-2 flex-wrap">
        {CHIPS.filter(c => c.key !== 'portieri' || hasPortieri).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="rounded-full px-3 py-1 text-[10px] font-bold transition-all"
            style={chipStyle(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Classifica marcatori */}
      {active.has('marcatori') && (
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">🥇 Classifica marcatori</div>
          <div className="flex flex-col gap-1.5">
            {byGoals.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-brand/25" style={{
                background: i === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <div className="text-right">
                  <div className={`text-lg font-black leading-none ${i === 0 ? 'text-brand' : 'text-white/50'}`}>{p.total_goals}</div>
                  <div className="text-[9px] text-white/25">
                    {p.total_appearances > 0
                      ? `${(p.total_goals / p.total_appearances).toFixed(1)} media`
                      : 'goal'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Presenze */}
      {active.has('presenze') && (
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">👟 Presenze</div>
          <div className="flex flex-col gap-1.5">
            {byAppearances.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-accent/25" style={{
                background: i === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <div className="text-right">
                  <div className={`text-lg font-black leading-none ${i === 0 ? 'text-accent' : 'text-white/50'}`}>{p.total_appearances}</div>
                  <div className="text-[9px] text-white/25">presenze</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Portieri */}
      {active.has('portieri') && hasPortieri && (
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">🥅 Classifica portieri</div>
          <div className="flex flex-col gap-1.5">
            {goalkeepers.map((p, i) => (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-green-400/25" style={{
                background: i === 0 ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                  {i === 0 ? '🥇' : i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <div className="text-right">
                  {p.appearances > 0 ? (
                    <>
                      <div className={`text-lg font-black leading-none ${i === 0 ? 'text-green-400' : 'text-white/50'}`}>
                        {p.avg_conceded}
                      </div>
                      <div className="text-[9px] text-white/25">
                        gol/partita · {p.clean_sheets} CS
                      </div>
                    </>
                  ) : (
                    <div className="text-[9px] text-white/25">nessuna partita</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/StatsRankings.tsx
git commit -m "feat: add StatsRankings client component with chip toggle"
```

---

## Task 2: Aggiornare la stats page

**Files:**
- Modify: `app/stats/page.tsx`

- [ ] **Step 1: Leggere il file corrente**

Leggere `/Users/ilyaskerrouche/Documents/App/Calcetto/app/stats/page.tsx` per vedere lo stato attuale.

- [ ] **Step 2: Sostituire l'intero contenuto di `app/stats/page.tsx`**

```tsx
import Link from 'next/link'
import { getPlayersWithStats, getGoalkeeperRanking } from '@/lib/queries/players'
import { getGlobalStats } from '@/lib/queries/stats'
import PodiumView from '@/components/PodiumView'
import StatsRankings from '@/components/StatsRankings'

export const revalidate = 60

export default async function StatsPage() {
  const [globalStats, players, goalkeepers] = await Promise.all([
    getGlobalStats(),
    getPlayersWithStats(),
    getGoalkeeperRanking(),
  ])

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const top3 = byGoals.slice(0, 3)

  return (
    <main className="pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
        <div className="absolute -top-10 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-black">📊 Statistiche</h1>
          <div className="text-sm text-white/40 mt-1">Stagione 2025/26 · {globalStats.total_matches} partite</div>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6">

        {/* Podio */}
        {top3.length > 0 && (
          <section>
            <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-4 font-bold">🏆 Top marcatori</div>
            <PodiumView players={top3} />
          </section>
        )}

        {/* Stagione boxes */}
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">Stagione</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: globalStats.total_matches, lbl: 'Partite giocate' },
              { val: globalStats.total_goals, lbl: 'Goal totali' },
              { val: globalStats.wins_a, lbl: 'Vittorie Team A' },
              { val: globalStats.wins_b, lbl: 'Vittorie Team B' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-3xl font-black text-brand leading-none">{val}</div>
                <div className="text-[9px] text-white/35 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Classifiche con chip toggle */}
        <StatsRankings players={players} goalkeepers={goalkeepers} />

      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: build completata senza errori.

- [ ] **Step 5: Commit**

```bash
git add app/stats/page.tsx
git commit -m "feat: use StatsRankings component in stats page"
```

---

## Checklist finale

- [ ] `npx tsc --noEmit` — zero errori
- [ ] `npm run build` — build ok
- [ ] Aprire `/stats` nel browser: solo chip "Marcatori" attivo di default
- [ ] Click su "Presenze" → sezione presenze appare
- [ ] Click su "Marcatori" → sezione marcatori sparisce
- [ ] Chip "Portieri" appare solo se esiste almeno un portiere con partite
