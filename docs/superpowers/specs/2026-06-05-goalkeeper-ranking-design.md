# Goalkeeper Ranking — Design Spec
**Date:** 2026-06-05

## Overview

Add a goalkeeper ranking system to the Calcetto app. Goalkeepers are identified via the existing `position` field on the `players` table (`position = 'GK'`). For each match, goals conceded are derived from the opposing team's score. The ranking appears on the Stats page and on each goalkeeper's profile page.

---

## 1. Data Model

No DB migration required. The `players` table already has a `position text` column.

**Canonical value:** `position = 'GK'` identifies a goalkeeper. Any other value (including `null`) means a field player.

**Goals conceded calculation (per match):**
- Goalkeeper on `team = 'a'` → conceded = `score_b`
- Goalkeeper on `team = 'b'` → conceded = `score_a`
- Clean sheet = match where conceded = 0

Only completed matches (`is_upcoming = false`) are counted.

**New types in `lib/types.ts`:**
```ts
export type GoalkeeperStats = {
  goals_conceded: number
  clean_sheets: number
  appearances: number
  avg_conceded: number  // goals_conceded / appearances, or 0 if no appearances
}

export type PlayerWithGoalkeeperStats = Player & GoalkeeperStats
```

---

## 2. Admin UI — Toggle Portiere

**File:** `app/admin/players/AdminPlayerRow.tsx`

Add a goalkeeper toggle button (🥅 icon) next to the player name. Tapping it:
- If `position !== 'GK'` → calls action with `position = 'GK'`
- If `position === 'GK'` → calls action with `position = null`

Visual style: icon button, active state highlighted with brand color, inactive dimmed — consistent with existing admin dark UI.

**New server action in `app/admin/players/actions.ts`:**
```ts
export async function updatePlayerPosition(id: string, position: string | null): Promise<void>
```

Uses `createAdminClient()` like existing `updatePlayerName` / `updatePlayerCardUrl`.

---

## 3. Queries

**New function in `lib/queries/players.ts`:**
```ts
export async function getGoalkeeperRanking(): Promise<PlayerWithGoalkeeperStats[]>
```

Logic:
1. Fetch all players with `position = 'GK'`
2. Fetch their `match_players` rows joined with `matches` (to get `score_a`, `score_b`, `is_upcoming`)
3. For each GK, filter only completed matches, compute `goals_conceded` and `clean_sheets`
4. Return sorted by `avg_conceded` ascending (fewer goals conceded = better rank)
5. Players with 0 appearances are included but sorted last

**Updated function `getPlayerProfile()` in `lib/queries/players.ts`:**
- If the player has `position = 'GK'`, compute and include `GoalkeeperStats` in the returned object
- The return type extends to optionally include `goalkeeper_stats?: GoalkeeperStats`

---

## 4. Stats Page

**File:** `app/stats/page.tsx`

New section **"🥅 Classifica portieri"** added after the existing "Presenze" section.

Each row displays:
- Rank number (1st gets 🥇)
- Player name (linked to profile)
- Average goals conceded per match (primary metric, green tint — lower = better)
- Clean sheets count (secondary label below)

The section only renders if at least one goalkeeper exists with at least one appearance.

---

## 5. Player Profile Page

**File:** `app/players/[id]/page.tsx`

If the player is a goalkeeper (`position === 'GK'`), render an additional stats block showing:
- Goals conceded total
- Goals conceded per match (avg)
- Clean sheets

This block appears alongside (not replacing) the existing scorer stats. Goalkeepers can score too.

---

## Files Changed

| File | Change |
|------|--------|
| `lib/types.ts` | Add `GoalkeeperStats`, `PlayerWithGoalkeeperStats` |
| `lib/queries/players.ts` | Add `getGoalkeeperRanking()`, update `getPlayerProfile()` |
| `app/admin/players/actions.ts` | Add `updatePlayerPosition()` |
| `app/admin/players/AdminPlayerRow.tsx` | Add goalkeeper toggle UI |
| `app/stats/page.tsx` | Add goalkeeper ranking section |
| `app/players/[id]/page.tsx` | Add goalkeeper stats block |

---

## Out of Scope

- Tracking which specific player was goalkeeper in each match (one GK per team per match is assumed)
- Historical position changes (position is a current attribute, not per-match)
- Goalkeeper saves or other advanced stats
