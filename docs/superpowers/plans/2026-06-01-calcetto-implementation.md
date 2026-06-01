# Calcetto Web App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack calcetto tracking web app with Next.js 14, Supabase, and Tailwind, deployable on Vercel.

**Architecture:** Next.js App Router with Server Components for data fetching, Server Actions for mutations, Supabase as PostgreSQL backend. Auth is a single admin password verified server-side, session stored as a signed JWT in an httpOnly cookie.

**Tech Stack:** Next.js 14 (App Router), Supabase JS (`@supabase/ssr`), Tailwind CSS v3, `jose` for JWT, TypeScript.

---

## File map

```
app/
  layout.tsx                        # Root layout: dark bg, bottom tab bar
  page.tsx                          # Home
  matches/
    page.tsx                        # Matches list
    [id]/page.tsx                   # Match detail
  players/page.tsx                  # Players + podium
  stats/page.tsx                    # Stats + charts
  admin/
    login/page.tsx                  # Login form
    page.tsx                        # Admin dashboard
    matches/
      new/page.tsx                  # New match form
      [id]/page.tsx                 # Edit match form

components/
  BottomTabBar.tsx                  # Fixed bottom navigation (Client)
  PlayerCard.tsx                    # FIFA card <img> wrapper
  FieldView.tsx                     # SVG field + cards overlay (Client)
  MatchCard.tsx                     # Match summary row
  PodiumView.tsx                    # Top-3 podium (Client, sorts client-side)
  BarChart.tsx                      # Goal-per-match bars (Client)
  admin/
    PlayerSelector.tsx              # Toggle-grid for player presence (Client)
    ScorerEntry.tsx                 # Select + +/− counter row (Client)
    MatchForm.tsx                   # Full match form (Client)

lib/
  supabase/
    client.ts                       # Browser Supabase client
    server.ts                       # Server Supabase client (uses next/headers)
  queries/
    players.ts                      # Player reads
    matches.ts                      # Match reads
    stats.ts                        # Aggregated stats
  auth.ts                           # JWT create/verify helpers
  types.ts                          # Shared TypeScript types

middleware.ts                       # Protect /admin/* routes
supabase/migrations/001_initial.sql # DB schema
```

---

## Task 1: Project bootstrap

**Files:**
- Create: `package.json` (via CLI)
- Create: `.env.local`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Expected: project created with `app/`, `components/`, `public/`, `tailwind.config.ts`.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr jose
```

- [ ] **Step 3: Create `.env.local`**

```bash
# .env.local  (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
ADMIN_PASSWORD=your_secret_password
ADMIN_SECRET=a_random_32_char_string_for_jwt
```

Replace values with your actual Supabase project credentials (found in Supabase dashboard → Settings → API).

- [ ] **Step 4: Update `tailwind.config.ts` to include custom colors**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#4ade80',
        'brand-dim': 'rgba(74,222,128,0.15)',
        accent: '#a78bfa',
        'accent-dim': 'rgba(139,92,246,0.15)',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.07)',
        bg: '#0a0f0a',
        'bg-indigo': '#0d0d1a',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Set global styles in `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0f0a;
  color: white;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
```

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap Next.js 14 + Supabase + Tailwind"
```

---

## Task 2: Database schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/001_initial.sql

create extension if not exists "uuid-ossp";

create table players (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  position   text,
  ovr        integer,
  card_url   text,
  created_at timestamptz default now()
);

create table matches (
  id           uuid primary key default uuid_generate_v4(),
  played_at    date not null,
  team_a_name  text not null default 'Team A',
  team_b_name  text not null default 'Team B',
  score_a      integer,
  score_b      integer,
  is_upcoming  boolean not null default false,
  created_at   timestamptz default now()
);

create table match_players (
  id         uuid primary key default uuid_generate_v4(),
  match_id   uuid not null references matches(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  team       text not null check (team in ('a','b')),
  goals      integer not null default 0,
  unique(match_id, player_id)
);

-- Indexes for common queries
create index on match_players(player_id);
create index on match_players(match_id);
create index on matches(played_at desc);
```

- [ ] **Step 2: Run migration on Supabase**

In Supabase dashboard → SQL Editor, paste and run the SQL above.

Verify: go to Table Editor and confirm all three tables exist.

- [ ] **Step 3: Upload player card images to Supabase Storage**

In Supabase dashboard:
1. Storage → Create bucket `player-cards` (set to Public)
2. Upload each JPEG from `Card players/` folder
3. For each image, copy the public URL
4. In Table Editor → `players`, insert one row per player with `name`, `position`, `ovr`, and `card_url` (the public URL)

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "chore: add initial DB schema migration"
```

---

## Task 3: TypeScript types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write shared types**

```ts
// lib/types.ts

export type Player = {
  id: string
  name: string
  position: string | null
  ovr: number | null
  card_url: string | null
  created_at: string
}

export type Match = {
  id: string
  played_at: string
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  created_at: string
}

export type MatchPlayer = {
  id: string
  match_id: string
  player_id: string
  team: 'a' | 'b'
  goals: number
}

export type MatchWithPlayers = Match & {
  match_players: (MatchPlayer & { player: Player })[]
}

export type PlayerWithStats = Player & {
  total_goals: number
  total_appearances: number
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "chore: add shared TypeScript types"
```

---

## Task 4: Supabase client setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Write browser client**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Write server client**

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/
git commit -m "chore: add Supabase client wrappers"
```

---

## Task 5: Query layer — players

**Files:**
- Create: `lib/queries/players.ts`

- [ ] **Step 1: Write player queries**

```ts
// lib/queries/players.ts
import { createClient } from '@/lib/supabase/server'
import type { Player, PlayerWithStats } from '@/lib/types'

export async function getAllPlayers(): Promise<Player[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getPlayersWithStats(): Promise<PlayerWithStats[]> {
  const supabase = createClient()

  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (pErr) throw new Error(pErr.message)

  const { data: mp, error: mpErr } = await supabase
    .from('match_players')
    .select('player_id, goals')
  if (mpErr) throw new Error(mpErr.message)

  return players.map((p) => {
    const rows = mp.filter((r) => r.player_id === p.id)
    return {
      ...p,
      total_goals: rows.reduce((sum, r) => sum + r.goals, 0),
      total_appearances: rows.length,
    }
  })
}
```

- [ ] **Step 2: Verify by calling in the Next.js dev server**

```bash
npm run dev
```

Open `http://localhost:3000` — no errors in terminal. (Full UI comes later.)

- [ ] **Step 3: Commit**

```bash
git add lib/queries/players.ts
git commit -m "feat: add player query functions"
```

---

## Task 6: Query layer — matches

**Files:**
- Create: `lib/queries/matches.ts`

- [ ] **Step 1: Write match queries**

```ts
// lib/queries/matches.ts
import { createClient } from '@/lib/supabase/server'
import type { Match, MatchWithPlayers } from '@/lib/types'

export async function getAllMatches(): Promise<Match[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('played_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getMatchById(id: string): Promise<MatchWithPlayers> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*, match_players(*, player:players(*))')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as MatchWithPlayers
}

export async function getLastMatch(): Promise<Match | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('is_upcoming', false)
    .order('played_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export async function getNextMatch(): Promise<Match | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('is_upcoming', true)
    .order('played_at', { ascending: true })
    .limit(1)
    .single()
  return data ?? null
}

// Server Actions for mutations
'use server'

export async function createMatch(formData: {
  played_at: string
  team_a_name: string
  team_b_name: string
  score_a: number | null
  score_b: number | null
  is_upcoming: boolean
  players: { player_id: string; team: 'a' | 'b'; goals: number }[]
}): Promise<string> {
  const supabase = createClient()

  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      played_at: formData.played_at,
      team_a_name: formData.team_a_name,
      team_b_name: formData.team_b_name,
      score_a: formData.score_a,
      score_b: formData.score_b,
      is_upcoming: formData.is_upcoming,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  if (formData.players.length > 0) {
    const { error: mpErr } = await supabase.from('match_players').insert(
      formData.players.map((p) => ({ ...p, match_id: match.id }))
    )
    if (mpErr) throw new Error(mpErr.message)
  }

  return match.id
}

export async function updateMatch(
  id: string,
  formData: {
    played_at: string
    team_a_name: string
    team_b_name: string
    score_a: number | null
    score_b: number | null
    is_upcoming: boolean
    players: { player_id: string; team: 'a' | 'b'; goals: number }[]
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('matches').update({
    played_at: formData.played_at,
    team_a_name: formData.team_a_name,
    team_b_name: formData.team_b_name,
    score_a: formData.score_a,
    score_b: formData.score_b,
    is_upcoming: formData.is_upcoming,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  await supabase.from('match_players').delete().eq('match_id', id)

  if (formData.players.length > 0) {
    const { error: mpErr } = await supabase.from('match_players').insert(
      formData.players.map((p) => ({ ...p, match_id: id }))
    )
    if (mpErr) throw new Error(mpErr.message)
  }
}

export async function deleteMatch(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/queries/matches.ts
git commit -m "feat: add match query and mutation functions"
```

---

## Task 7: Query layer — stats

**Files:**
- Create: `lib/queries/stats.ts`

- [ ] **Step 1: Write stats queries**

```ts
// lib/queries/stats.ts
import { createClient } from '@/lib/supabase/server'

export type GlobalStats = {
  total_matches: number
  total_goals: number
  total_players: number
  wins_a: number
  wins_b: number
  avg_goals_per_match: number
}

export type MatchGoalPoint = {
  played_at: string
  total_goals: number
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('score_a, score_b, is_upcoming')
    .eq('is_upcoming', false)

  const { count: total_players } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  const played = matches ?? []
  const total_matches = played.length
  const total_goals = played.reduce((s, m) => s + (m.score_a ?? 0) + (m.score_b ?? 0), 0)
  const wins_a = played.filter((m) => (m.score_a ?? 0) > (m.score_b ?? 0)).length
  const wins_b = played.filter((m) => (m.score_b ?? 0) > (m.score_a ?? 0)).length

  return {
    total_matches,
    total_goals,
    total_players: total_players ?? 0,
    wins_a,
    wins_b,
    avg_goals_per_match: total_matches > 0 ? Math.round((total_goals / total_matches) * 10) / 10 : 0,
  }
}

export async function getRecentGoalsPerMatch(limit = 8): Promise<MatchGoalPoint[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('played_at, score_a, score_b')
    .eq('is_upcoming', false)
    .order('played_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((m) => ({
    played_at: m.played_at,
    total_goals: (m.score_a ?? 0) + (m.score_b ?? 0),
  }))
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/queries/stats.ts
git commit -m "feat: add stats query functions"
```

---

## Task 8: Auth — JWT helpers + middleware + login page

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Write auth helpers**

```ts
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET!)

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Write middleware**

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET!)

export async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    const token = req.cookies.get('calc_admin')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    try {
      await jwtVerify(token, secret())
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 3: Write login Server Action**

```ts
// app/admin/login/actions.ts
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminToken } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1')
  }
  const token = await createAdminToken()
  cookies().set('calc_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect('/admin')
}
```

- [ ] **Step 4: Write login page**

```tsx
// app/admin/login/page.tsx
import { loginAction } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0f0a' }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-center mb-2">⚽ Calcetto</h1>
        <p className="text-center text-sm text-white/40 mb-8">Accesso admin</p>

        <form action={loginAction} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="Password admin"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-brand/50"
          />
          {searchParams.error && (
            <p className="text-red-400 text-sm text-center">Password errata</p>
          )}
          <button
            type="submit"
            className="w-full bg-brand text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Test auth flow manually**

```bash
npm run dev
```

1. Go to `http://localhost:3000/admin` → should redirect to `/admin/login`
2. Enter wrong password → should stay on login with `?error=1`
3. Enter correct password (from `.env.local`) → should redirect to `/admin` (404 for now, that's fine)

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts middleware.ts app/admin/login/
git commit -m "feat: add admin auth with JWT cookie and middleware"
```

---

## Task 9: Root layout + BottomTabBar

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/BottomTabBar.tsx`

- [ ] **Step 1: Write BottomTabBar component**

```tsx
// components/BottomTabBar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/matches', label: 'Partite', icon: '⚽' },
  { href: '/players', label: 'Giocatori', icon: '👥' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/7 pb-safe"
      style={{ background: 'rgba(10,15,10,0.96)', backdropFilter: 'blur(16px)', paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href}
            className={`flex-1 flex flex-col items-center gap-1 pt-2 text-xs transition-colors ${active ? 'text-brand' : 'text-white/30'}`}>
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Update root layout**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import BottomTabBar from '@/components/BottomTabBar'

export const metadata: Metadata = {
  title: '⚽ Calcetto',
  description: 'Traccia le partite del gruppo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="pb-20">
        {children}
        <BottomTabBar />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Go to `http://localhost:3000` — bottom tab bar should appear with 4 tabs. Clicking tabs should navigate (pages not built yet, 404 is fine).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/BottomTabBar.tsx
git commit -m "feat: add root layout and BottomTabBar"
```

---

## Task 10: Shared UI components

**Files:**
- Create: `components/PlayerCard.tsx`
- Create: `components/FieldView.tsx`
- Create: `components/MatchCard.tsx`

- [ ] **Step 1: Write PlayerCard**

```tsx
// components/PlayerCard.tsx
import Image from 'next/image'
import type { Player } from '@/lib/types'

type Props = {
  player: Player
  width?: number
  className?: string
}

export default function PlayerCard({ player, width = 80, className = '' }: Props) {
  if (!player.card_url) {
    return (
      <div className={`rounded-lg bg-white/10 flex items-center justify-center text-white/30 text-xs ${className}`}
        style={{ width, aspectRatio: '0.72' }}>
        {player.name[0]}
      </div>
    )
  }
  return (
    <div className={`rounded-lg overflow-hidden flex-shrink-0 ${className}`} style={{ width }}>
      <Image src={player.card_url} alt={player.name} width={width} height={Math.round(width / 0.72)}
        className="w-full block" unoptimized />
    </div>
  )
}
```

- [ ] **Step 2: Write FieldView**

```tsx
// components/FieldView.tsx
'use client'
import PlayerCard from './PlayerCard'
import type { MatchWithPlayers } from '@/lib/types'

export default function FieldView({ match }: { match: MatchWithPlayers }) {
  const teamA = match.match_players.filter((mp) => mp.team === 'a')
  const teamB = match.match_players.filter((mp) => mp.team === 'b')

  const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#1a4731', aspectRatio: '16/9' }}>
      {/* Stripe pattern */}
      <div className="absolute inset-0" style={{
        background: 'repeating-linear-gradient(90deg,transparent,transparent 6.25%,rgba(0,0,0,.07) 6.25%,rgba(0,0,0,.07) 12.5%)'
      }} />
      {/* Field lines SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
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
        {[{ players: teamA, label: match.team_a_name }, { players: teamB, label: match.team_b_name }].map(({ players, label }) => (
          <div key={label} className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 relative">
            <span className="absolute top-2 text-[9px] font-bold tracking-widest uppercase text-white/25">{label}</span>
            {chunk(players, 2).map((row, i) => (
              <div key={i} className="flex gap-1.5 justify-center">
                {row.map((mp) => (
                  <PlayerCard key={mp.player_id} player={mp.player} width={58}
                    className="shadow-lg hover:-translate-y-1 transition-transform cursor-pointer" />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write MatchCard**

```tsx
// components/MatchCard.tsx
import Link from 'next/link'
import type { Match } from '@/lib/types'

export default function MatchCard({ match }: { match: Match }) {
  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  if (match.is_upcoming) {
    return (
      <Link href={`/matches/${match.id}`}
        className="block p-4 rounded-2xl border border-white/7 bg-white/4 hover:border-brand/25 transition-colors">
        <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-white/10 text-white/60 px-3 py-1 rounded-full mb-2">
          📅 In programma
        </span>
        <div className="font-bold">{date}</div>
      </Link>
    )
  }

  const winner = (match.score_a ?? 0) > (match.score_b ?? 0) ? match.team_a_name : match.team_b_name
  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)

  return (
    <Link href={`/matches/${match.id}`}
      className="flex items-center gap-3 p-4 rounded-2xl border border-white/7 bg-white/4 hover:border-brand/25 transition-colors">
      <div className="text-center min-w-[80px]">
        <div className="text-2xl font-black tracking-tight">
          <span className={aWins ? 'text-brand' : 'text-white/60'}>{match.score_a}</span>
          <span className="text-white/20 mx-1">–</span>
          <span className={!aWins ? 'text-brand' : 'text-white/60'}>{match.score_b}</span>
        </div>
        <div className="text-[10px] text-white/30 mt-0.5">{match.team_a_name} vs {match.team_b_name}</div>
      </div>
      <div className="flex-1">
        <div className="text-[11px] text-white/35 mb-1">{date}</div>
        <div className="text-sm font-bold text-brand">🏆 {winner}</div>
      </div>
      <span className="text-white/20 text-lg">›</span>
    </Link>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/
git commit -m "feat: add PlayerCard, FieldView, MatchCard components"
```

---

## Task 11: Home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write Home page**

```tsx
// app/page.tsx
import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import { getLastMatch, getNextMatch } from '@/lib/queries/matches'
import { getGlobalStats } from '@/lib/queries/stats'
import PlayerCard from '@/components/PlayerCard'

export const revalidate = 60

export default async function HomePage() {
  const [stats, lastMatch, nextMatch, players] = await Promise.all([
    getGlobalStats(),
    getLastMatch(),
    getNextMatch(),
    getPlayersWithStats(),
  ])

  const topScorers = [...players]
    .sort((a, b) => b.total_goals - a.total_goals)
    .slice(0, 4)

  const lastMatchDate = lastMatch
    ? new Date(lastMatch.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const nextMatchDate = nextMatch
    ? new Date(nextMatch.played_at).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const lastMatchWinner = lastMatch
    ? ((lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0) ? lastMatch.team_a_name : lastMatch.team_b_name)
    : null

  return (
    <main className="px-4 pb-4">
      {/* Header */}
      <div className="pt-7 pb-4">
        <div className="text-2xl font-black">⚽ <span className="text-brand">Calcetto</span></div>
        <div className="text-xs text-white/30 mt-1">Stagione 2025/26</div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { val: stats.total_matches, lbl: 'Partite' },
          { val: stats.total_goals, lbl: 'Goal', green: true },
          { val: stats.total_players, lbl: 'Giocatori' },
        ].map(({ val, lbl, green }) => (
          <div key={lbl} className="bg-white/5 border border-white/7 rounded-xl p-3 text-center">
            <div className={`text-3xl font-black leading-none ${green ? 'text-brand' : ''}`}>{val}</div>
            <div className="text-[10px] text-white/35 mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Next match */}
      {nextMatch && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">Prossima partita</div>
          <Link href={`/matches/${nextMatch.id}`}>
            <div className="relative rounded-2xl overflow-hidden mb-4 p-4"
              style={{ background: 'linear-gradient(135deg,#14532d,#166534)' }}>
              <div className="absolute inset-0"
                style={{ background: 'repeating-linear-gradient(90deg,transparent,transparent 8%,rgba(0,0,0,.06) 8%,rgba(0,0,0,.06) 16%)' }} />
              <div className="relative">
                <span className="inline-block bg-white/15 text-white/80 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full mb-2">📅 In programma</span>
                <div className="text-lg font-black capitalize">{nextMatchDate}</div>
              </div>
            </div>
          </Link>
        </>
      )}

      {/* Last match */}
      {lastMatch && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">Ultima partita</div>
          <Link href={`/matches/${lastMatch.id}`}>
            <div className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-2xl p-4 mb-4 hover:border-brand/25 transition-colors">
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-black tracking-tight">
                  <span className={(lastMatch.score_a ?? 0) > (lastMatch.score_b ?? 0) ? 'text-brand' : 'text-white/60'}>{lastMatch.score_a}</span>
                  <span className="text-white/20 mx-1">–</span>
                  <span className={(lastMatch.score_b ?? 0) > (lastMatch.score_a ?? 0) ? 'text-brand' : 'text-white/60'}>{lastMatch.score_b}</span>
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{lastMatch.team_a_name} vs {lastMatch.team_b_name}</div>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-white/35 mb-1">{lastMatchDate}</div>
                <div className="text-sm font-bold text-brand">🏆 {lastMatchWinner}</div>
              </div>
              <span className="text-white/20 text-lg">›</span>
            </div>
          </Link>
        </>
      )}

      {/* Top scorers leaderboard */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">Classifica marcatori</div>
      <div className="flex flex-col gap-1.5">
        {topScorers.map((p, i) => (
          <div key={p.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${i === 0 ? 'bg-brand/8 border-brand/15' : 'bg-white/3 border-white/5'}`}>
            <span className={`text-sm font-black w-5 text-center ${i === 0 ? 'text-yellow-400' : 'text-white/25'}`}>
              {i === 0 ? '🥇' : i + 1}
            </span>
            <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={32} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <span className="text-xs text-white/40">
              <strong className="text-brand font-bold">{p.total_goals}</strong> ⚽ · {p.total_appearances} pres
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Go to `http://localhost:3000` — should show stats, next/last match cards, leaderboard. If no data yet, sections show nothing (handled via conditional renders).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build Home page"
```

---

## Task 12: Matches list page

**Files:**
- Create: `app/matches/page.tsx`

- [ ] **Step 1: Write matches list page**

```tsx
// app/matches/page.tsx
import { getAllMatches } from '@/lib/queries/matches'
import MatchCard from '@/components/MatchCard'

export const revalidate = 60

export default async function MatchesPage() {
  const matches = await getAllMatches()
  const upcoming = matches.filter((m) => m.is_upcoming)
  const played = matches.filter((m) => !m.is_upcoming)

  return (
    <main className="px-4 pb-4">
      <div className="pt-7 pb-4">
        <h1 className="text-2xl font-black">⚽ Partite</h1>
        <div className="text-xs text-white/35 mt-1">{played.length} partite giocate</div>
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">In programma</div>
          <div className="flex flex-col gap-2 mb-5">
            {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </>
      )}

      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">Storico</div>
      <div className="flex flex-col gap-2">
        {played.length === 0 && (
          <p className="text-white/30 text-sm py-4 text-center">Nessuna partita ancora.</p>
        )}
        {played.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Go to `http://localhost:3000/matches` — should show list of matches (or empty state).

- [ ] **Step 3: Commit**

```bash
git add app/matches/page.tsx
git commit -m "feat: build Matches list page"
```

---

## Task 13: Match detail page

**Files:**
- Create: `app/matches/[id]/page.tsx`

- [ ] **Step 1: Write match detail page**

```tsx
// app/matches/[id]/page.tsx
import { getMatchById } from '@/lib/queries/matches'
import FieldView from '@/components/FieldView'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  let match
  try { match = await getMatchById(params.id) } catch { notFound() }

  const date = new Date(match.played_at).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const aWins = (match.score_a ?? 0) > (match.score_b ?? 0)
  const bWins = (match.score_b ?? 0) > (match.score_a ?? 0)

  const teamAPlayers = match.match_players.filter((mp) => mp.team === 'a')
  const teamBPlayers = match.match_players.filter((mp) => mp.team === 'b')

  const topScorerA = teamAPlayers.reduce((top, mp) => mp.goals > (top?.goals ?? -1) ? mp : top, teamAPlayers[0])
  const topScorerB = teamBPlayers.reduce((top, mp) => mp.goals > (top?.goals ?? -1) ? mp : top, teamBPlayers[0])

  if (match.is_upcoming) {
    return (
      <main className="px-4 pb-4">
        <div className="pt-7 pb-2 text-center">
          <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2">{date}</div>
          <span className="inline-block bg-white/10 text-white/60 text-sm font-bold px-4 py-1.5 rounded-full">
            📅 Partita in programma
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 pb-4">
      {/* Hero score */}
      <div className="pt-7 pb-3 text-center">
        <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2 capitalize">{date}</div>
        <div className="flex items-center justify-center gap-5 mb-2">
          <div className="text-sm font-bold text-white/70 w-20 text-right">{match.team_a_name}</div>
          <div className="flex items-center gap-2.5 text-5xl font-black leading-none">
            <span className={aWins ? 'text-brand' : 'text-white/60'}>{match.score_a}</span>
            <span className="text-white/20 text-3xl font-light">–</span>
            <span className={bWins ? 'text-brand' : 'text-white/60'}>{match.score_b}</span>
          </div>
          <div className="text-sm font-bold text-white/70 w-20 text-left">{match.team_b_name}</div>
        </div>
        <span className="inline-block bg-brand/15 border border-brand/30 text-brand text-[11px] font-bold px-3 py-1 rounded-full">
          🏆 {aWins ? match.team_a_name : match.team_b_name} vince
        </span>
      </div>

      {/* Top scorers */}
      <div className="flex gap-2.5 mb-3">
        {[
          { label: `Top scorer · ${match.team_a_name}`, scorer: topScorerA },
          { label: `Top scorer · ${match.team_b_name}`, scorer: topScorerB },
        ].map(({ label, scorer }) => (
          <div key={label}
            className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl p-2.5">
            <span className="text-lg">🥇</span>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] tracking-wider uppercase text-white/35">{label}</div>
              <div className="text-sm font-bold truncate">{scorer?.player?.name ?? '—'}</div>
            </div>
            <span className="bg-brand/15 text-brand text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap">
              {scorer?.goals ?? 0} ⚽
            </span>
          </div>
        ))}
      </div>

      {/* Field */}
      <div className="mb-3">
        <FieldView match={match} />
      </div>

      {/* Scorers */}
      <div className="flex gap-2.5">
        {[
          { label: `⚽ ${match.team_a_name}`, players: teamAPlayers },
          { label: `⚽ ${match.team_b_name}`, players: teamBPlayers },
        ].map(({ label, players }) => (
          <div key={label} className="flex-1 bg-white/4 border border-white/6 rounded-xl p-3">
            <div className="text-[9px] tracking-wider uppercase text-white/35 mb-2">{label}</div>
            {players.filter((mp) => mp.goals > 0).map((mp) => (
              <div key={mp.player_id} className="flex items-center text-sm mb-1.5">
                <span className="flex-1 text-white/80">{mp.player.name}</span>
                <span className="bg-brand/12 text-brand text-[11px] font-bold px-2 py-0.5 rounded-full">{mp.goals}</span>
              </div>
            ))}
            {players.filter((mp) => mp.goals > 0).length === 0 && (
              <div className="text-xs text-white/25">Nessun goal</div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Insert a test match in Supabase (via Table Editor), then go to `http://localhost:3000/matches/[id]`.

- [ ] **Step 3: Commit**

```bash
git add app/matches/[id]/page.tsx
git commit -m "feat: build Match detail page with field view"
```

---

## Task 14: Players page with Podium

**Files:**
- Create: `components/PodiumView.tsx`
- Create: `app/players/page.tsx`

- [ ] **Step 1: Write PodiumView**

```tsx
// components/PodiumView.tsx
'use client'
import PlayerCard from './PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

export default function PodiumView({ players }: { players: PlayerWithStats[] }) {
  const [first, second, third] = players
  return (
    <div>
      <div className="flex items-end justify-center gap-2.5 mb-2.5">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-base">🥈</span>
          {second && <PlayerCard player={second} width={78} className="opacity-90 shadow-xl" />}
          <div className="text-[11px] font-bold text-white/80">{second?.name}</div>
          <span className="bg-accent/20 border border-accent/35 text-accent text-xs font-black px-2.5 py-0.5 rounded-full">
            {second?.total_goals} ⚽
          </span>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xl">🥇</span>
          {first && (
            <PlayerCard player={first} width={100}
              className="shadow-2xl ring-2 ring-accent/40" />
          )}
          <div className="text-[13px] font-bold text-white">{first?.name}</div>
          <span className="bg-accent/30 border border-accent/40 text-accent text-[13px] font-black px-3 py-0.5 rounded-full">
            {first?.total_goals} ⚽
          </span>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-base">🥉</span>
          {third && <PlayerCard player={third} width={78} className="opacity-90 shadow-xl" />}
          <div className="text-[11px] font-bold text-white/80">{third?.name}</div>
          <span className="bg-accent/20 border border-accent/35 text-accent text-xs font-black px-2.5 py-0.5 rounded-full">
            {third?.total_goals} ⚽
          </span>
        </div>
      </div>
      {/* Podium bases */}
      <div className="flex items-end justify-center gap-2.5 px-2">
        <div className="flex-1 h-6 rounded-t-lg bg-white/8 flex items-center justify-center text-lg font-black text-white/40">2</div>
        <div className="flex-1 h-9 rounded-t-lg flex items-center justify-center text-xl font-black text-accent"
          style={{ background: 'linear-gradient(180deg,rgba(139,92,246,.4),rgba(139,92,246,.2))' }}>1</div>
        <div className="flex-1 h-5 rounded-t-lg bg-white/5 flex items-center justify-center text-base font-black text-white/30">3</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write Players page**

```tsx
// app/players/page.tsx
'use client'
import { useState } from 'react'
import PodiumView from '@/components/PodiumView'
import PlayerCard from '@/components/PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

// This is a Client Component wrapper; data is fetched in a parent Server Component
// We split into a server data-fetcher and a client renderer

// Server component in same file using RSC pattern:
import { getPlayersWithStats } from '@/lib/queries/players'

export default async function PlayersPage() {
  const players = await getPlayersWithStats()
  return <PlayersClient initialPlayers={players} />
}

// Client sub-component for interactivity
function PlayersClient({ initialPlayers }: { initialPlayers: PlayerWithStats[] }) {
  const [sort, setSort] = useState<'goals' | 'appearances' | 'name'>('goals')

  const sorted = [...initialPlayers].sort((a, b) => {
    if (sort === 'goals') return b.total_goals - a.total_goals
    if (sort === 'appearances') return b.total_appearances - a.total_appearances
    return a.name.localeCompare(b.name)
  })

  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <main style={{ background: '#0d0d1a' }} className="min-h-screen px-4 pb-4">
      <div className="pt-7 pb-3 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black">👥 Giocatori</h1>
          <div className="text-xs text-white/35 mt-1">Stagione 2025/26</div>
        </div>
        <span className="bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1 rounded-full">
          {initialPlayers.length} players
        </span>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([['goals', '⚽ Più goal'], ['appearances', '👟 Più presenze'], ['name', '🔤 A–Z']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setSort(key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] border transition-all ${
              sort === key
                ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                : 'bg-white/6 border-white/10 text-white/55'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-3 font-bold">🏆 Classifica</div>
      <PodiumView players={podium} />

      {/* Rest list */}
      {rest.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mt-5 mb-2 font-bold">Altri giocatori</div>
          <div className="flex flex-col gap-2">
            {rest.map((p, i) => (
              <div key={p.id}
                className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-3 py-2.5 hover:border-accent/25 transition-colors">
                <span className="text-sm font-black text-white/25 w-5 text-center">{i + 4}</span>
                <div className="w-9 h-12 rounded overflow-hidden flex-shrink-0">
                  <PlayerCard player={p} width={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  {p.position && <div className="text-[11px] text-white/35">{p.position}</div>}
                </div>
                <div className="flex gap-3.5 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-accent leading-none">{p.total_goals}</div>
                    <div className="text-[9px] uppercase text-white/30">Goal</div>
                  </div>
                  <div className="w-px bg-white/7 self-stretch" />
                  <div className="text-right">
                    <div className="text-base font-black leading-none">{p.total_appearances}</div>
                    <div className="text-[9px] uppercase text-white/30">Pres</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
```

> Note: Next.js 14 App Router allows mixing `async` server component exports with client sub-components in the same file. The default export is the server component; `PlayersClient` is a regular (non-async) component marked with `'use client'` implicitly via hooks. To avoid a lint error, put `PlayersClient` in a separate file `components/PlayersClient.tsx` with `'use client'` at the top and import it here.

- [ ] **Step 3: Refactor: move PlayersClient to its own file**

```tsx
// components/PlayersClient.tsx
'use client'
import { useState } from 'react'
import PodiumView from './PodiumView'
import PlayerCard from './PlayerCard'
import type { PlayerWithStats } from '@/lib/types'

export default function PlayersClient({ initialPlayers }: { initialPlayers: PlayerWithStats[] }) {
  const [sort, setSort] = useState<'goals' | 'appearances' | 'name'>('goals')

  const sorted = [...initialPlayers].sort((a, b) => {
    if (sort === 'goals') return b.total_goals - a.total_goals
    if (sort === 'appearances') return b.total_appearances - a.total_appearances
    return a.name.localeCompare(b.name)
  })

  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <main style={{ background: '#0d0d1a' }} className="min-h-screen px-4 pb-4">
      <div className="pt-7 pb-3 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black">👥 Giocatori</h1>
          <div className="text-xs text-white/35 mt-1">Stagione 2025/26</div>
        </div>
        <span className="bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1 rounded-full">
          {initialPlayers.length} players
        </span>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([['goals', '⚽ Più goal'], ['appearances', '👟 Più presenze'], ['name', '🔤 A–Z']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setSort(key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] border transition-all ${
              sort === key
                ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                : 'bg-white/6 border-white/10 text-white/55'
            }`}>
            {label}
          </button>
        ))}
      </div>
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-3 font-bold">🏆 Classifica</div>
      <PodiumView players={podium} />
      {rest.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mt-5 mb-2 font-bold">Altri giocatori</div>
          <div className="flex flex-col gap-2">
            {rest.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-3 py-2.5 hover:border-accent/25 transition-colors">
                <span className="text-sm font-black text-white/25 w-5 text-center">{i + 4}</span>
                <div className="w-9 h-12 rounded overflow-hidden flex-shrink-0">
                  <PlayerCard player={p} width={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  {p.position && <div className="text-[11px] text-white/35">{p.position}</div>}
                </div>
                <div className="flex gap-3.5 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-accent leading-none">{p.total_goals}</div>
                    <div className="text-[9px] uppercase text-white/30">Goal</div>
                  </div>
                  <div className="w-px bg-white/7 self-stretch" />
                  <div className="text-right">
                    <div className="text-base font-black leading-none">{p.total_appearances}</div>
                    <div className="text-[9px] uppercase text-white/30">Pres</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
```

```tsx
// app/players/page.tsx  (clean server component)
import { getPlayersWithStats } from '@/lib/queries/players'
import PlayersClient from '@/components/PlayersClient'

export const revalidate = 60

export default async function PlayersPage() {
  const players = await getPlayersWithStats()
  return <PlayersClient initialPlayers={players} />
}
```

- [ ] **Step 4: Verify**

Go to `http://localhost:3000/players` — should show podium with player cards and rest list. Sort pills should work.

- [ ] **Step 5: Commit**

```bash
git add app/players/ components/PodiumView.tsx components/PlayersClient.tsx
git commit -m "feat: build Players page with podium"
```

---

## Task 15: Stats page

**Files:**
- Create: `components/BarChart.tsx`
- Create: `app/stats/page.tsx`

- [ ] **Step 1: Write BarChart component**

```tsx
// components/BarChart.tsx
'use client'
import type { MatchGoalPoint } from '@/lib/queries/stats'

export default function BarChart({ data }: { data: MatchGoalPoint[] }) {
  const max = Math.max(...data.map((d) => d.total_goals), 1)
  const reversed = [...data].reverse()

  return (
    <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
      <div className="flex items-end gap-1.5 h-20">
        {reversed.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-white/40">{d.total_goals}</span>
            <div className="w-full rounded-t"
              style={{
                height: `${(d.total_goals / max) * 100}%`,
                minHeight: 4,
                background: d.total_goals === max ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.25)',
              }} />
            <span className="text-[8px] text-white/25 whitespace-nowrap">
              {new Date(d.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write Stats page**

```tsx
// app/stats/page.tsx
import { getPlayersWithStats } from '@/lib/queries/players'
import { getGlobalStats, getRecentGoalsPerMatch } from '@/lib/queries/stats'
import BarChart from '@/components/BarChart'
import PlayerCard from '@/components/PlayerCard'

export const revalidate = 60

export default async function StatsPage() {
  const [globalStats, recentGoals, players] = await Promise.all([
    getGlobalStats(),
    getRecentGoalsPerMatch(8),
    getPlayersWithStats(),
  ])

  const byGoals = [...players].sort((a, b) => b.total_goals - a.total_goals)
  const byAppearances = [...players].sort((a, b) => b.total_appearances - a.total_appearances)
  const maxGoals = byGoals[0]?.total_goals ?? 1
  const maxAppearances = byAppearances[0]?.total_appearances ?? 1

  const globalBoxes = [
    { val: globalStats.total_goals, lbl: 'Goal totali', sub: `Media ${globalStats.avg_goals_per_match} a partita`, green: true },
    { val: globalStats.total_matches, lbl: 'Partite giocate', sub: `${globalStats.total_players} giocatori attivi` },
    { val: globalStats.wins_a, lbl: 'Vittorie Team A', sub: `su ${globalStats.total_matches} partite` },
    { val: globalStats.wins_b, lbl: 'Vittorie Team B', sub: `su ${globalStats.total_matches} partite` },
  ]

  return (
    <main className="px-4 pb-4">
      <div className="pt-7 pb-4">
        <h1 className="text-2xl font-black">📊 Statistiche</h1>
        <div className="text-xs text-white/35 mt-1">Stagione 2025/26 · {globalStats.total_matches} partite</div>
      </div>

      {/* Global boxes */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">Riepilogo stagione</div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {globalBoxes.map(({ val, lbl, sub, green }) => (
          <div key={lbl} className={`rounded-2xl p-3.5 border ${green ? 'bg-brand/7 border-brand/20' : 'bg-white/4 border-white/7'}`}>
            <div className={`text-4xl font-black leading-none ${green ? 'text-brand' : ''}`}>{val}</div>
            <div className="text-[11px] text-white/40 mt-1">{lbl}</div>
            <div className="text-[10px] text-white/25 mt-1.5 pt-1.5 border-t border-white/6">{sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {recentGoals.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">Goal per partita (ultime 8)</div>
          <div className="mb-5"><BarChart data={recentGoals} /></div>
        </>
      )}

      {/* Top scorers */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">🥇 Classifica marcatori</div>
      <div className="flex flex-col gap-1.5 mb-5">
        {byGoals.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2">
            <span className="text-xs font-black text-white/25 w-4">{i + 1}</span>
            <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={28} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <div className="w-20 h-1.5 bg-white/7 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full" style={{ width: `${(p.total_goals / maxGoals) * 100}%` }} />
            </div>
            <span className="text-sm font-black text-brand w-6 text-right">{p.total_goals}</span>
          </div>
        ))}
      </div>

      {/* Presenze */}
      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">👟 Più presenze</div>
      <div className="flex flex-col gap-1.5">
        {byAppearances.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2">
            <span className="text-xs font-black text-white/25 w-4">{i + 1}</span>
            <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={28} />
            </div>
            <span className="flex-1 text-sm font-semibold">{p.name}</span>
            <div className="w-20 h-1.5 bg-white/7 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(p.total_appearances / maxAppearances) * 100}%`, background: '#818cf8' }} />
            </div>
            <span className="text-sm font-black w-6 text-right" style={{ color: '#818cf8' }}>{p.total_appearances}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Go to `http://localhost:3000/stats`.

- [ ] **Step 4: Commit**

```bash
git add app/stats/ components/BarChart.tsx
git commit -m "feat: build Stats page with bar chart"
```

---

## Task 16: Admin form components

**Files:**
- Create: `components/admin/PlayerSelector.tsx`
- Create: `components/admin/ScorerEntry.tsx`

- [ ] **Step 1: Write PlayerSelector**

```tsx
// components/admin/PlayerSelector.tsx
'use client'
import { useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import type { Player } from '@/lib/types'

type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type Props = {
  players: Player[]
  value: SelectedPlayer[]
  onChange: (v: SelectedPlayer[]) => void
}

export default function PlayerSelector({ players, value, onChange }: Props) {
  const toggle = (playerId: string, team: 'a' | 'b') => {
    const exists = value.find((v) => v.player_id === playerId)
    if (exists) {
      if (exists.team === team) {
        onChange(value.filter((v) => v.player_id !== playerId))
      } else {
        onChange(value.map((v) => v.player_id === playerId ? { ...v, team } : v))
      }
    } else {
      onChange([...value, { player_id: playerId, team }])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((p) => {
        const sel = value.find((v) => v.player_id === p.id)
        return (
          <div key={p.id} className={`flex items-center gap-2 rounded-xl p-2.5 border cursor-pointer transition-all ${
            sel ? 'border-brand/40 bg-brand/10' : 'border-white/8 bg-white/4'
          }`}>
            <div className="w-6 h-8 rounded overflow-hidden flex-shrink-0">
              <PlayerCard player={p} width={24} />
            </div>
            <span className="flex-1 text-xs font-semibold truncate">{p.name}</span>
            <div className="flex gap-1">
              {(['a', 'b'] as const).map((team) => (
                <button key={team} type="button" onClick={() => toggle(p.id, team)}
                  className={`w-7 h-7 rounded-lg text-xs font-black border transition-all ${
                    sel?.team === team
                      ? 'bg-brand text-black border-brand'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                  {team.toUpperCase()}
                </button>
              ))}
            </div>
            {sel && <span className="text-brand text-sm">✓</span>}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Write ScorerEntry**

```tsx
// components/admin/ScorerEntry.tsx
'use client'
import type { Player } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number }

type Props = {
  players: Player[]
  value: ScorerRow[]
  onChange: (v: ScorerRow[]) => void
  label: string
}

export default function ScorerEntry({ players, value, onChange, label }: Props) {
  const add = () => {
    if (players.length === 0) return
    onChange([...value, { player_id: players[0].id, goals: 1 }])
  }

  const update = (index: number, field: keyof ScorerRow, val: string | number) => {
    onChange(value.map((row, i) => i === index ? { ...row, [field]: val } : row))
  }

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">{label}</div>
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <select value={row.player_id} onChange={(e) => update(i, 'player_id', e.target.value)}
            className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
            {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-xl px-2 py-1.5">
            <button type="button" onClick={() => update(i, 'goals', Math.max(0, row.goals - 1))}
              className="text-white/50 text-lg w-6 h-6 flex items-center justify-center">−</button>
            <span className="text-sm font-bold w-5 text-center">{row.goals}</span>
            <button type="button" onClick={() => update(i, 'goals', row.goals + 1)}
              className="text-white/50 text-lg w-6 h-6 flex items-center justify-center">+</button>
          </div>
          <button type="button" onClick={() => remove(i)}
            className="text-white/25 hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center">×</button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-brand/70 text-xs flex items-center gap-1 mt-1 hover:text-brand transition-colors">
        ＋ Aggiungi marcatore
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/
git commit -m "feat: add admin form sub-components"
```

---

## Task 17: Admin MatchForm component

**Files:**
- Create: `components/admin/MatchForm.tsx`

- [ ] **Step 1: Write MatchForm**

```tsx
// components/admin/MatchForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlayerSelector from './PlayerSelector'
import ScorerEntry from './ScorerEntry'
import type { Player, MatchWithPlayers } from '@/lib/types'

type ScorerRow = { player_id: string; goals: number }
type SelectedPlayer = { player_id: string; team: 'a' | 'b' }

type Props = {
  players: Player[]
  existing?: MatchWithPlayers
  onSave: (data: {
    played_at: string
    team_a_name: string
    team_b_name: string
    score_a: number | null
    score_b: number | null
    is_upcoming: boolean
    players: { player_id: string; team: 'a' | 'b'; goals: number }[]
  }) => Promise<void>
}

export default function MatchForm({ players, existing, onSave }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isUpcoming, setIsUpcoming] = useState(existing?.is_upcoming ?? false)
  const [date, setDate] = useState(existing?.played_at ?? new Date().toISOString().split('T')[0])
  const [teamAName, setTeamAName] = useState(existing?.team_a_name ?? 'Team A')
  const [teamBName, setTeamBName] = useState(existing?.team_b_name ?? 'Team B')
  const [scoreA, setScoreA] = useState<number>(existing?.score_a ?? 0)
  const [scoreB, setScoreB] = useState<number>(existing?.score_b ?? 0)

  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(
    existing?.match_players.map((mp) => ({ player_id: mp.player_id, team: mp.team })) ?? []
  )

  const [scorersA, setScorersA] = useState<ScorerRow[]>(
    existing?.match_players.filter((mp) => mp.team === 'a' && mp.goals > 0)
      .map((mp) => ({ player_id: mp.player_id, goals: mp.goals })) ?? []
  )
  const [scorersB, setScorersB] = useState<ScorerRow[]>(
    existing?.match_players.filter((mp) => mp.team === 'b' && mp.goals > 0)
      .map((mp) => ({ player_id: mp.player_id, goals: mp.goals })) ?? []
  )

  const teamAPlayers = players.filter((p) => selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'a'))
  const teamBPlayers = players.filter((p) => selectedPlayers.find((sp) => sp.player_id === p.id && sp.team === 'b'))

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

  const inputClass = "w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand/40"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Upcoming toggle */}
      <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
        <label className="flex-1 text-sm text-white/70">Partita futura (senza risultato)</label>
        <button type="button" onClick={() => setIsUpcoming(!isUpcoming)}
          className={`w-11 h-6 rounded-full transition-colors ${isUpcoming ? 'bg-brand' : 'bg-white/15'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${isUpcoming ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Data</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
      </div>

      {/* Score */}
      {!isUpcoming && (
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Punteggio</label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input className={inputClass + ' mb-1.5'} value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)} placeholder="Nome team A" />
              <input type="number" min={0} value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'} />
            </div>
            <span className="text-white/20 text-2xl font-light">–</span>
            <div className="flex-1">
              <input className={inputClass + ' mb-1.5'} value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)} placeholder="Nome team B" />
              <input type="number" min={0} value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
                className={inputClass + ' text-center text-2xl font-black'} />
            </div>
          </div>
        </div>
      )}

      {/* Players */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">
          Giocatori presenti (seleziona team A/B)
        </label>
        <PlayerSelector players={players} value={selectedPlayers} onChange={setSelectedPlayers} />
      </div>

      {/* Scorers */}
      {!isUpcoming && (
        <div className="grid grid-cols-2 gap-4">
          <ScorerEntry players={teamAPlayers} value={scorersA} onChange={setScorersA} label={`Marcatori ${teamAName}`} />
          <ScorerEntry players={teamBPlayers} value={scorersB} onChange={setScorersB} label={`Marcatori ${teamBName}`} />
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-brand text-black font-black py-4 rounded-2xl text-base hover:bg-green-400 transition-colors disabled:opacity-50">
        {loading ? 'Salvataggio…' : '💾 Salva partita'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/MatchForm.tsx
git commit -m "feat: add MatchForm admin component"
```

---

## Task 18: Admin new match page

**Files:**
- Create: `app/admin/matches/new/page.tsx`
- Create: `app/admin/matches/new/actions.ts`

- [ ] **Step 1: Write server action**

```ts
// app/admin/matches/new/actions.ts
'use server'
import { createMatch } from '@/lib/queries/matches'

export async function saveNewMatch(data: Parameters<typeof createMatch>[0]) {
  return createMatch(data)
}
```

- [ ] **Step 2: Write new match page**

```tsx
// app/admin/matches/new/page.tsx
import { getAllPlayers } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import { saveNewMatch } from './actions'

export default async function NewMatchPage() {
  const players = await getAllPlayers()

  return (
    <main className="px-4 pb-8">
      <div className="pt-7 pb-5">
        <h1 className="text-2xl font-black">➕ Nuova partita</h1>
      </div>
      <MatchForm players={players} onSave={saveNewMatch} />
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Go to `http://localhost:3000/admin/matches/new` (must be logged in). Fill and submit form. Check Supabase Table Editor for the new match and match_players rows.

- [ ] **Step 4: Commit**

```bash
git add app/admin/matches/new/
git commit -m "feat: add new match admin page"
```

---

## Task 19: Admin dashboard + edit match page

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/matches/[id]/page.tsx`
- Create: `app/admin/matches/[id]/actions.ts`

- [ ] **Step 1: Write admin dashboard**

```tsx
// app/admin/page.tsx
import Link from 'next/link'
import { getAllMatches } from '@/lib/queries/matches'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const matches = await getAllMatches()
  const played = matches.filter((m) => !m.is_upcoming)
  const upcoming = matches.filter((m) => m.is_upcoming)

  async function logout() {
    'use server'
    cookies().delete('calc_admin')
    redirect('/admin/login')
  }

  return (
    <main className="px-4 pb-8">
      <div className="pt-7 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">⚙️ Admin</h1>
          <div className="text-xs text-white/35 mt-1">{played.length} partite · {upcoming.length} in programma</div>
        </div>
        <form action={logout}>
          <button className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            Logout
          </button>
        </form>
      </div>

      <Link href="/admin/matches/new"
        className="flex items-center justify-center gap-2 w-full bg-brand text-black font-black py-4 rounded-2xl text-base hover:bg-green-400 transition-colors mb-6">
        ➕ Nuova partita
      </Link>

      {upcoming.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">In programma</div>
          <div className="flex flex-col gap-2 mb-5">
            {upcoming.map((m) => {
              const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
              return (
                <div key={m.id} className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-4 py-3">
                  <div className="flex-1">
                    <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full mr-2">📅</span>
                    <span className="text-sm font-semibold">{date}</span>
                  </div>
                  <Link href={`/admin/matches/${m.id}`}
                    className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1 rounded-lg">
                    Modifica
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">Storico partite</div>
      <div className="flex flex-col gap-2">
        {played.map((m) => {
          const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
          const aWins = (m.score_a ?? 0) > (m.score_b ?? 0)
          return (
            <div key={m.id} className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-4 py-3">
              <div className="flex-1">
                <span className="text-sm font-black">
                  <span className={aWins ? 'text-brand' : 'text-white/60'}>{m.score_a}</span>
                  <span className="text-white/20 mx-1">–</span>
                  <span className={!aWins ? 'text-brand' : 'text-white/60'}>{m.score_b}</span>
                </span>
                <span className="text-xs text-white/35 ml-2">{date}</span>
              </div>
              <Link href={`/admin/matches/${m.id}`}
                className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1 rounded-lg">
                Modifica
              </Link>
            </div>
          )
        })}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Write edit actions**

```ts
// app/admin/matches/[id]/actions.ts
'use server'
import { updateMatch, deleteMatch } from '@/lib/queries/matches'
import { redirect } from 'next/navigation'

export async function saveEditMatch(
  id: string,
  data: Parameters<typeof updateMatch>[1]
) {
  await updateMatch(id, data)
}

export async function deleteMatchAction(id: string) {
  await deleteMatch(id)
  redirect('/admin')
}
```

- [ ] **Step 3: Write edit match page**

```tsx
// app/admin/matches/[id]/page.tsx
import { getMatchById } from '@/lib/queries/matches'
import { getAllPlayers } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import { saveEditMatch, deleteMatchAction } from './actions'
import { notFound } from 'next/navigation'

export default async function EditMatchPage({ params }: { params: { id: string } }) {
  let match, players
  try {
    [match, players] = await Promise.all([getMatchById(params.id), getAllPlayers()])
  } catch { notFound() }

  const onSave = async (data: Parameters<typeof saveEditMatch>[1]) => {
    'use server'
    await saveEditMatch(params.id, data)
  }

  return (
    <main className="px-4 pb-8">
      <div className="pt-7 pb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black">✏️ Modifica partita</h1>
        <form action={async () => { 'use server'; await deleteMatchAction(params.id) }}>
          <button className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            🗑 Elimina
          </button>
        </form>
      </div>
      <MatchForm players={players} existing={match} onSave={onSave} />
    </main>
  )
}
```

- [ ] **Step 4: Verify full admin flow**

1. Login at `/admin/login`
2. Create a new match at `/admin/matches/new` with players and scorers
3. Verify it appears in `/admin` dashboard
4. Edit the match at `/admin/matches/[id]`
5. Delete the match — should redirect to `/admin` and disappear
6. Check `/matches` and `/` reflect the new data

- [ ] **Step 5: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin dashboard and edit match page"
```

---

## Task 20: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USER/calcetto.git
git push -u origin main
```

- [ ] **Step 2: Create Vercel project**

1. Go to [vercel.com](https://vercel.com), click "Add New Project"
2. Import the GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Click "Deploy" (first deploy will fail — env vars not set yet)

- [ ] **Step 3: Add environment variables in Vercel**

In Vercel project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL      = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR_ANON_KEY
ADMIN_PASSWORD                = your_secret_password
ADMIN_SECRET                  = a_random_32_char_string_for_jwt
```

- [ ] **Step 4: Redeploy**

In Vercel dashboard → Deployments → click "Redeploy" on the latest deployment.

- [ ] **Step 5: Verify production**

Open the Vercel deployment URL:
- `/` — Home loads with data
- `/matches` — Matches list
- `/players` — Players with podium and FIFA cards
- `/stats` — Stats with bar chart
- `/admin/login` — Login form works
- `/admin` — Dashboard shows matches

- [ ] **Step 6: Add `.env.local` to `.gitignore`**

```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored"
git push
```

---

## Self-Review Checklist

### Spec coverage

| Requirement | Task |
|---|---|
| Track players with goals and appearances | Task 5, 14, 15 |
| Track all matches (date, players, goals, winner) | Task 6, 12, 13 |
| Insert past and future matches | Task 17, 18 |
| Soccer field with player cards | Task 10 (FieldView), 13 |
| Top scorer per team on match page | Task 13 |
| Home with stats, next/last match, leaderboard | Task 11 |
| Players page with FIFA cards | Task 14 |
| Stats page (charts, rankings) | Task 15 |
| Admin password auth | Task 8 |
| Deploy on Vercel | Task 20 |

All requirements covered. ✓

### Type consistency check

- `PlayerWithStats` defined in Task 3, used in Tasks 5, 11, 14, 15 ✓
- `MatchWithPlayers` defined in Task 3, used in Tasks 6, 13, 17 ✓
- `createMatch` signature in Task 6, called in Task 18 ✓
- `updateMatch` signature in Task 6, called in Task 19 ✓
- `match.team` is `'a' | 'b'` throughout ✓
