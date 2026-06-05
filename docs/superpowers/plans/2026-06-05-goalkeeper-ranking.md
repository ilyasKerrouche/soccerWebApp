# Goalkeeper Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un sistema di classifica portieri basato su goal subiti e clean sheet, con toggle admin per identificare i portieri.

**Architecture:** Usiamo il campo `position = 'GK'` già presente nella tabella `players`. I goal subiti vengono calcolati on-the-fly dal punteggio della squadra avversaria in ogni partita. Nessuna migrazione DB.

**Tech Stack:** Next.js 14 (App Router), Supabase, TypeScript, Tailwind CSS

---

## File Map

| File | Azione |
|------|--------|
| `lib/types.ts` | Aggiunge `GoalkeeperStats`, `PlayerWithGoalkeeperStats` |
| `lib/queries/players.ts` | Aggiunge `getGoalkeeperRanking()`, aggiorna `getPlayerProfile()` |
| `app/admin/players/actions.ts` | Aggiunge `updatePlayerPosition()` |
| `app/admin/players/AdminPlayerRow.tsx` | Toggle 🥅 per impostare portiere |
| `app/stats/page.tsx` | Sezione classifica portieri |
| `app/players/[id]/page.tsx` | Blocco stats portiere nel profilo |

---

## Task 1: Aggiungere i tipi TypeScript

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Aggiungere i tipi in `lib/types.ts`**

Aprire `lib/types.ts` e aggiungere in fondo al file:

```ts
export type GoalkeeperStats = {
  goals_conceded: number
  clean_sheets: number
  appearances: number
  avg_conceded: number
}

export type PlayerWithGoalkeeperStats = Player & GoalkeeperStats
```

- [ ] **Step 2: Verificare che TypeScript compili**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add GoalkeeperStats types"
```

---

## Task 2: Server action per aggiornare la posizione

**Files:**
- Modify: `app/admin/players/actions.ts`

- [ ] **Step 1: Aggiungere `updatePlayerPosition` in `app/admin/players/actions.ts`**

Aggiungere alla fine del file (prima dell'ultimo `}`):

```ts
export async function updatePlayerPosition(id: string, position: string | null): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').update({ position }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/players')
  revalidatePath('/stats')
  revalidatePath(`/players/${id}`)
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/admin/players/actions.ts
git commit -m "feat: add updatePlayerPosition server action"
```

---

## Task 3: Toggle portiere nell'admin

**Files:**
- Modify: `app/admin/players/AdminPlayerRow.tsx`

- [ ] **Step 1: Aggiornare `AdminPlayerRow.tsx`**

Sostituire l'intero contenuto del file con:

```tsx
'use client'
import { useState, useTransition } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { savePlayerName, uploadPlayerCard, updatePlayerPosition } from './actions'
import type { Player } from '@/lib/types'

export default function AdminPlayerRow({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [isGK, setIsGK] = useState(player.position === 'GK')
  const [pending, startTransition] = useTransition()
  const [uploadPending, startUpload] = useTransition()
  const [gkPending, startGK] = useTransition()
  const [success, setSuccess] = useState(false)

  const saveName = () => {
    if (!name.trim() || name === player.name) { setEditing(false); return }
    startTransition(async () => {
      await savePlayerName(player.id, name)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  const handleCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('card', file)
    startUpload(async () => {
      await uploadPlayerCard(player.id, fd)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  const toggleGK = () => {
    const newPosition = isGK ? null : 'GK'
    startGK(async () => {
      await updatePlayerPosition(player.id, newPosition)
      setIsGK(!isGK)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    })
  }

  return (
    <div className="glass rounded-2xl p-3 flex items-center gap-3">
      {/* Card preview + upload */}
      <label className="relative cursor-pointer flex-shrink-0 group">
        <div className="w-10 h-14 rounded-lg overflow-hidden">
          <PlayerCard player={player} width={40} />
        </div>
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] text-white font-bold text-center leading-tight px-1">{uploadPending ? '…' : '📷'}</span>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleCard} disabled={uploadPending} />
      </label>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(player.name); setEditing(false) } }}
            className="w-full bg-white/10 border border-brand/30 rounded-lg px-2 py-1 text-sm font-bold outline-none text-white"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm font-bold text-left w-full hover:text-brand transition-colors">
            {name}
            <span className="text-white/20 text-[10px] ml-1.5">✏️</span>
          </button>
        )}
        {isGK && <div className="text-[9px] text-brand/60 mt-0.5 font-bold">Portiere</div>}
      </div>

      {/* Toggle GK */}
      <button
        onClick={toggleGK}
        disabled={gkPending}
        title={isGK ? 'Rimuovi portiere' : 'Imposta come portiere'}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all text-base"
        style={{
          background: isGK ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isGK ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}`,
          opacity: gkPending ? 0.5 : 1,
        }}
      >
        🥅
      </button>

      {/* Status */}
      {(pending || uploadPending || gkPending) && <span className="text-[10px] text-white/40 animate-pulse">salvo…</span>}
      {success && <span className="text-[10px] text-win">✓</span>}
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
git add app/admin/players/AdminPlayerRow.tsx
git commit -m "feat: add goalkeeper toggle in admin player row"
```

---

## Task 4: Query `getGoalkeeperRanking`

**Files:**
- Modify: `lib/queries/players.ts`

- [ ] **Step 1: Aggiungere import del nuovo tipo in `lib/queries/players.ts`**

Modificare la riga di import dei tipi da:

```ts
import type { Player, PlayerWithStats, MatchWithPlayers } from '@/lib/types'
```

a:

```ts
import type { Player, PlayerWithStats, MatchWithPlayers, GoalkeeperStats, PlayerWithGoalkeeperStats } from '@/lib/types'
```

- [ ] **Step 2: Aggiungere `getGoalkeeperRanking()` in fondo a `lib/queries/players.ts`**

```ts
export async function getGoalkeeperRanking(): Promise<PlayerWithGoalkeeperStats[]> {
  const supabase = createClient()

  const { data: gkPlayers, error: pErr } = await supabase
    .from('players')
    .select('*')
    .eq('position', 'GK')
  if (pErr) throw new Error(pErr.message)
  if (!gkPlayers || gkPlayers.length === 0) return []

  const gkIds = gkPlayers.map(p => p.id)

  const { data: mpRows, error: mpErr } = await supabase
    .from('match_players')
    .select('player_id, team, match_id')
    .in('player_id', gkIds)
  if (mpErr) throw new Error(mpErr.message)

  const allMp = mpRows ?? []
  const matchIds = [...new Set(allMp.map(r => r.match_id))]

  const matchMap: Record<string, { score_a: number | null; score_b: number | null }> = {}
  if (matchIds.length > 0) {
    const { data: matchData } = await supabase
      .from('matches')
      .select('id, score_a, score_b')
      .in('id', matchIds)
      .eq('is_upcoming', false)
    for (const m of matchData ?? []) {
      matchMap[m.id] = { score_a: m.score_a, score_b: m.score_b }
    }
  }

  const completedMp = allMp.filter(r => matchMap[r.match_id] !== undefined)

  const result = gkPlayers.map(p => {
    const playerRows = completedMp.filter(r => r.player_id === p.id)
    const appearances = playerRows.length
    let goals_conceded = 0
    let clean_sheets = 0
    for (const r of playerRows) {
      const m = matchMap[r.match_id]
      const conceded = r.team === 'a' ? (m.score_b ?? 0) : (m.score_a ?? 0)
      goals_conceded += conceded
      if (conceded === 0) clean_sheets++
    }
    const avg_conceded = appearances > 0 ? Math.round((goals_conceded / appearances) * 10) / 10 : 0
    return { ...p, goals_conceded, clean_sheets, appearances, avg_conceded }
  })

  return result.sort((a, b) => {
    if (a.appearances === 0 && b.appearances === 0) return 0
    if (a.appearances === 0) return 1
    if (b.appearances === 0) return -1
    return a.avg_conceded - b.avg_conceded
  })
}
```

- [ ] **Step 3: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/players.ts
git commit -m "feat: add getGoalkeeperRanking query"
```

---

## Task 5: Aggiornare `getPlayerProfile` per includere le stats da portiere

**Files:**
- Modify: `lib/queries/players.ts`

- [ ] **Step 1: Aggiornare il tipo di ritorno di `getPlayerProfile`**

Modificare la signature della funzione da:

```ts
export async function getPlayerProfile(id: string): Promise<{
  player: PlayerWithStats
  matches: (MatchWithPlayers & { goals: number })[]
} | null> {
```

a:

```ts
export async function getPlayerProfile(id: string): Promise<{
  player: PlayerWithStats
  matches: (MatchWithPlayers & { goals: number })[]
  goalkeeper_stats?: GoalkeeperStats
} | null> {
```

- [ ] **Step 2: Aggiungere il calcolo delle stats portiere in `getPlayerProfile`**

Trovare il blocco finale della funzione che fa `return { player: ..., matches }` e sostituirlo con:

```ts
  let goalkeeper_stats: GoalkeeperStats | undefined
  if (player.position === 'GK' && matches.length > 0) {
    let goals_conceded = 0
    let clean_sheets = 0
    for (const m of matches) {
      const team = (m as unknown as { playerTeam: 'a' | 'b' | null }).playerTeam
      const conceded = team === 'a' ? (m.score_b ?? 0) : (m.score_a ?? 0)
      goals_conceded += conceded
      if (conceded === 0) clean_sheets++
    }
    const appearances = matches.length
    goalkeeper_stats = {
      goals_conceded,
      clean_sheets,
      appearances,
      avg_conceded: Math.round((goals_conceded / appearances) * 10) / 10,
    }
  }

  return {
    player: { ...player, total_goals, total_appearances },
    matches,
    goalkeeper_stats,
  }
```

- [ ] **Step 3: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/players.ts
git commit -m "feat: include goalkeeper_stats in getPlayerProfile"
```

---

## Task 6: Sezione classifica portieri nella Stats page

**Files:**
- Modify: `app/stats/page.tsx`

- [ ] **Step 1: Aggiornare `app/stats/page.tsx`**

Aggiungere import di `getGoalkeeperRanking`:

```ts
import { getPlayersWithStats, getGoalkeeperRanking } from '@/lib/queries/players'
```

Aggiungere la call parallela nel body:

```ts
  const [globalStats, players, goalkeepers] = await Promise.all([
    getGlobalStats(),
    getPlayersWithStats(),
    getGoalkeeperRanking(),
  ])
```

Aggiungere la sezione classifica portieri dopo la sezione "Presenze" (prima della chiusura del `</div>` principale):

```tsx
        {/* Classifica portieri */}
        {goalkeepers.length > 0 && goalkeepers.some(g => g.appearances > 0) && (
          <section>
            <div className="text-[10px] tracking-[2px] uppercase text-white/25 mb-2 font-bold">🥅 Classifica portieri</div>
            <div className="flex flex-col gap-1.5">
              {goalkeepers.map((p, i) => (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" style={{
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
```

- [ ] **Step 2: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add app/stats/page.tsx
git commit -m "feat: add goalkeeper ranking section to stats page"
```

---

## Task 7: Blocco stats portiere nel profilo giocatore

**Files:**
- Modify: `app/players/[id]/page.tsx`

- [ ] **Step 1: Aggiornare `app/players/[id]/page.tsx`**

Aggiornare la destructuring del risultato per includere `goalkeeper_stats`:

```ts
  const { player, matches, goalkeeper_stats } = data
```

Aggiungere il blocco stats portiere subito dopo il `div` con i stat hero (goal / presenze / media), dentro la `div` con `relative z-10`, dopo la sezione `flex items-end gap-5`:

```tsx
            {goalkeeper_stats && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[9px] text-brand/50 font-bold uppercase tracking-wider mb-2">Stats portiere</div>
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="text-xl font-black text-green-400 leading-none">{goalkeeper_stats.avg_conceded}</div>
                    <div className="text-[9px] text-white/35 mt-0.5">gol/partita</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-xl font-black text-white/70 leading-none">{goalkeeper_stats.goals_conceded}</div>
                    <div className="text-[9px] text-white/35 mt-0.5">gol subiti</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-xl font-black text-white/70 leading-none">{goalkeeper_stats.clean_sheets}</div>
                    <div className="text-[9px] text-white/35 mt-0.5">clean sheet</div>
                  </div>
                </div>
              </div>
            )}
```

Posizionare questo blocco subito dopo il `</div>` che chiude il `flex items-end gap-5` (dopo la card + stats hero), sempre dentro la `div relative z-10`.

- [ ] **Step 2: Verificare TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Build finale**

```bash
npm run build
```

Expected: build completata senza errori.

- [ ] **Step 4: Commit finale**

```bash
git add app/players/[id]/page.tsx
git commit -m "feat: add goalkeeper stats block in player profile"
```

---

## Checklist finale

- [ ] `npx tsc --noEmit` — zero errori
- [ ] `npm run lint` — zero warning
- [ ] `npm run build` — build ok
- [ ] Testare manualmente: impostare un giocatore come portiere dall'admin
- [ ] Verificare che la classifica portieri appaia nella pagina stats
- [ ] Verificare che il profilo del portiere mostri il blocco stats portiere
