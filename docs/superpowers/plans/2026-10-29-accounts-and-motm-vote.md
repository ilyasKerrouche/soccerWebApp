# Account giocatori e voto MOTM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Account personali collegati ai giocatori (con approvazione admin e card provvisoria), e voto del Man of the Match di 3 giorni riservato a chi era in campo.

**Architecture:** Supabase Auth (email+password) per l'identità; una tabella `player_accounts` lega utente e giocatore. Le nuove tabelle hanno RLS attivo senza policy e si toccano solo col client service role, dopo che il server ha ricavato il giocatore dalla sessione. Le regole del voto (apertura, validità, conteggio, timer) vivono in un modulo puro testato con `node --test`.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr` 0.10, `@supabase/supabase-js` 2, Tailwind, TypeScript, Node 24 (`node --test` con type stripping nativo).

**Spec:** `docs/superpowers/specs/2026-10-29-accounts-and-motm-vote-design.md`

## Global Constraints

- Tutto il testo UI è in italiano, nello stile visivo esistente (glass, viola `#1e1b4b → #4c1d95`, `text-white/xx`).
- Il `player_id` dell'utente si ricava **sempre** dalla sessione lato server, mai da un parametro del client.
- `player_accounts` e `motm_votes`: RLS attivo, nessuna policy, accesso solo con `createAdminClient()`.
- Chi ha votato chi non viene mai mostrato, né esposto ad API pubbliche.
- Durata voto: `3` giorni (`MOTM_DURATION_MS = 3 * 24 * 60 * 60 * 1000`), contati dal salvataggio del risultato.
- Card caricata: solo `image/png`, `image/jpeg`, `image/webp`, max `5 * 1024 * 1024` byte.
- Il pannello `/admin` mantiene il suo login a password (`calc_admin` JWT) invariato.
- L'app resta navigabile senza login.
- Le partite giocate prima della migrazione non hanno mai voto né sezione MOTM.
- Fuso di visualizzazione: `Europe/Rome`.

## Review Focus

1. **Lineup cambiata dopo voti** — l'admin toglie un giocatore dalla partita: i voti dati *da* o *per* lui non contano nel conteggio né in "N su M". (Test in Task 1: `tallyMotm` riceve i lineup ids.)
2. **Timer allo scadere con la pagina aperta** — il countdown arriva a zero: mostra "Votazione chiusa" e ricarica la sezione, non numeri negativi. (Test in Task 1: `formatCountdown(0)` e negativi.)
3. **Modifica di una vecchia partita** — correggere il punteggio di una partita pre-esistente non apre un voto. (Test in Task 1: `shouldOpenVote` con `motm_eligible=false`.)
4. **Utente con richiesta pending o rifiutata** prova a votare o caricare la card: rifiutato lato server con messaggio chiaro. (Test in Task 1: `voteError` con `account=null`.)
5. **Due utenti reclamano lo stesso giocatore** — la seconda approvazione fallisce per l'indice unico parziale: l'admin vede un errore leggibile, non un crash. (Verifica manuale in Task 5.)

---

## File Structure

| File | Responsabilità |
| --- | --- |
| `lib/motm.ts` | Modulo puro: stato del voto, apertura, validità, conteggio, countdown |
| `lib/motm.test.ts` | Test `node --test` del modulo puro |
| `lib/cardFile.ts` + `.test.ts` | Validazione file della card |
| `supabase/migrations/005_accounts_and_motm.sql` | Schema nuovo |
| `lib/supabase/server.ts` | Client server con cookie scrivibili |
| `middleware.ts` | Refresh sessione Supabase + guard admin esistente |
| `lib/session.ts` | `getSessionAccount()` — chi è l'utente e quale giocatore |
| `lib/queries/accounts.ts` | Query su `player_accounts` (service role) |
| `lib/queries/motm.ts` | Query su `motm_votes` (service role) |
| `app/(auth)/registrati`, `accedi`, `password-dimenticata`, `reimposta-password`, `app/auth/callback/route.ts` | Flussi auth |
| `app/profilo/` | Profilo, upload card, logout |
| `app/admin/accounts/` | Richieste, approva/rifiuta/scollega, reset password |
| `components/PlaceholderCard.tsx` | Card provvisoria stile FUT |
| `components/motm/` | `MotmSection`, `MotmCountdown`, `MotmVoteGrid`, `MotmBadge` |

---

### Task 1: Modulo puro del voto + test runner

**Files:**
- Create: `lib/motm.ts`, `lib/motm.test.ts`
- Modify: `package.json` (script `test`), `tsconfig.json` (`exclude` aggiunge `"**/*.test.ts"`)

**Interfaces:**
- Produces:
  ```ts
  export const MOTM_DURATION_MS: number
  export type MotmStatus = 'none' | 'open' | 'closed'
  export function motmStatus(closesAt: string | null, now: Date): MotmStatus
  export function shouldOpenVote(m: { motm_eligible: boolean; motm_closes_at: string | null; is_upcoming: boolean; score_a: number | null; score_b: number | null }): boolean
  export function closesAtFrom(now: Date): string // ISO
  export type VoteRow = { voter_player_id: string; voted_player_id: string }
  export type Tally = { winners: string[]; topVotes: number; votersCount: number }
  export function tallyMotm(votes: VoteRow[], lineupIds: string[]): Tally
  export type VoteCheck = { account: { player_id: string; status: string } | null; votedId: string; lineupIds: string[]; closesAt: string | null; now: Date }
  export function voteError(c: VoteCheck): string | null
  export function formatCountdown(msLeft: number): string
  ```

- [ ] **Step 1: Write the failing tests** in `lib/motm.test.ts` (`import { test } from 'node:test'`, `import assert from 'node:assert/strict'`, `import {...} from './motm.ts'`):
  - `motmStatus(null, now) === 'none'`; closesAt 1 min in futuro → `'open'`; 1 ms nel passato → `'closed'`.
  - `shouldOpenVote`: eligible, closes null, not upcoming, scores `2,1` → `true`; stesso con `motm_eligible:false` → `false`; con `motm_closes_at` già valorizzato → `false`; `is_upcoming:true` → `false`; `score_b:null` → `false`; scores `0,0` → `true`.
  - `closesAtFrom(new Date('2026-10-29T20:00:00Z')) === '2026-11-01T20:00:00.000Z'`.
  - `tallyMotm([], ['a','b'])` → `{ winners: [], topVotes: 0, votersCount: 0 }`.
  - `a→b, c→b, b→a` con lineup `a,b,c` → winners `['b']`, topVotes `2`, votersCount `3`.
  - pareggio `a→b, b→a` → winners `['a','b']` (ordinati), topVotes `1`.
  - voto di `x` (fuori lineup) per `b` e voto di `a` per `y` (fuori lineup) vengono ignorati in winners **e** votersCount.
  - `voteError`: `account:null` → `'Accedi con un account approvato per votare'`; status `'pending'` → stesso messaggio; voter non in lineup → `'Puoi votare solo le partite in cui hai giocato'`; votedId === voter → `'Non puoi votare per te stesso'`; votedId fuori lineup → `'Giocatore non presente in questa partita'`; closesAt null o passato → `'La votazione è chiusa'`; caso valido → `null`.
  - `formatCountdown`: `(2*86400 + 14*3600 + 3*60) * 1000` → `'2g 14h 03m'`; `(5*3600 + 7*60) * 1000` → `'5h 07m'`; `59_000` → `'meno di 1m'`; `0` e `-5000` → `'chiusa'`.

- [ ] **Step 2: Add `"test": "node --test \"lib/**/*.test.ts\""` to `package.json`, exclude `**/*.test.ts` in `tsconfig.json`. Run `npm test`** — Expected: FAIL (module `./motm.ts` not found).

- [ ] **Step 3: Implement `lib/motm.ts`** — no imports at all (stesso principio di `lib/rating.ts`, header comment uguale). `tallyMotm` scarta i voti con voter o voted fuori da `lineupIds`, prima di contare.

- [ ] **Step 4: Run `npm test`** — Expected: all pass. Run `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 5: Commit** `feat: pure MOTM vote rules with node tests`

---

### Task 2: Migrazione e tipi

**Files:**
- Create: `supabase/migrations/005_accounts_and_motm.sql`
- Modify: `lib/types.ts`

**Interfaces:**
- Produces: tipi `PlayerAccount = { user_id: string; player_id: string; status: 'pending'|'approved'|'rejected'; is_new_player: boolean; created_at: string }`, `MotmVote = { id, match_id, voter_player_id, voted_player_id, created_at, updated_at }` (string); `Player` guadagna `is_active: boolean`; `Match` guadagna `motm_eligible: boolean; motm_closes_at: string | null`.

- [ ] **Step 1: Write the migration** — esattamente gli schemi della spec (`player_accounts` con indice unico parziale, `motm_votes` con unique e check, `matches.motm_closes_at`), più:
  ```sql
  alter table players add column is_active boolean not null default true;
  alter table matches add column motm_eligible boolean not null default true;
  update matches set motm_eligible = false where is_upcoming = false;
  alter table player_accounts enable row level security;
  alter table motm_votes enable row level security;
  ```
- [ ] **Step 2: Update `lib/types.ts`** come da Interfaces.
- [ ] **Step 3: Apply** — `supabase db push`, oppure incollare il file nel SQL Editor della dashboard (stessa procedura del piano autogoal). **Passo manuale dell'utente** se la CLI non è collegata.
- [ ] **Step 4: Verify** — `npx tsc --noEmit` nessun errore; nel SQL Editor `select count(*) from matches where motm_eligible` restituisce solo le partite in programma.
- [ ] **Step 5: Supabase dashboard (manuale utente)** — Authentication → Providers → Email: disattivare "Confirm email". Authentication → URL Configuration: aggiungere `<site-url>/auth/callback` ai Redirect URLs.
- [ ] **Step 6: Commit** `feat: schema for player accounts and MOTM votes`

---

### Task 3: Sessione Supabase Auth

**Files:**
- Modify: `lib/supabase/server.ts`, `middleware.ts`
- Create: `lib/session.ts`, `lib/queries/accounts.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/supabase/server.ts
  export function createClient(): SupabaseClient // invariata per le letture
  export function createAuthClient(): SupabaseClient // cookie get/set/remove via next/headers (set/remove in try/catch: nei server component sono no-op)
  // lib/queries/accounts.ts  (tutte con createAdminClient)
  export async function getAccountByUser(userId: string): Promise<PlayerAccount | null>
  export async function listPendingAccounts(): Promise<(PlayerAccount & { email: string; player: Player })[]>
  export async function listApprovedAccounts(): Promise<(PlayerAccount & { email: string; player: Player })[]>
  export async function getApprovedPlayerIds(playerIds: string[]): Promise<string[]>
  // lib/session.ts
  export type SessionAccount = { userId: string; email: string; account: PlayerAccount | null; player: Player | null }
  export async function getSessionAccount(): Promise<SessionAccount | null> // null se non loggato; usa auth.getUser(), non getSession()
  ```

- [ ] **Step 1: `createAuthClient`** in `lib/supabase/server.ts`, cookie con `@supabase/ssr` `createServerClient`.
- [ ] **Step 2: Middleware** — prima crea il client SSR sulla `NextResponse` e chiama `supabase.auth.getUser()` per rinfrescare i cookie; poi la logica admin attuale invariata. Matcher: tutte le rotte tranne `_next/static`, `_next/image`, `favicon.ico` e file immagine.
- [ ] **Step 3: `lib/queries/accounts.ts` e `lib/session.ts`.** Le email in `list*Accounts` vengono da `supabase.auth.admin.getUserById` (o `listUsers`) col service role.
- [ ] **Step 4: Verify** — `npx tsc --noEmit` ok; `npm run dev`, aprire `/` e `/admin` (login admin funziona come prima).
- [ ] **Step 5: Commit** `feat: supabase auth session plumbing`

---

### Task 4: Registrazione, login, recupero password

**Files:**
- Create: `app/registrati/page.tsx`, `app/registrati/actions.ts`, `app/accedi/page.tsx`, `app/accedi/actions.ts`, `app/password-dimenticata/page.tsx` (+ action), `app/reimposta-password/page.tsx` (+ action), `app/auth/callback/route.ts`
- Modify: `lib/queries/players.ts`

**Interfaces:**
- Consumes: `createAuthClient`, `getSessionAccount`
- Produces:
  ```ts
  export async function getClaimablePlayers(): Promise<Player[]> // attivi, senza account approved o pending
  export async function signUpAction(formData: FormData): Promise<{ error?: string }>
  // campi: email, password (min 8), mode: 'existing'|'new', player_id (se existing), name + position (se new)
  export async function signInAction(formData: FormData): Promise<{ error?: string }>
  export async function signOutAction(): Promise<void>
  ```

- [ ] **Step 1: `getClaimablePlayers`** in `lib/queries/players.ts`.
- [ ] **Step 2: `/registrati`** — form email/password + scelta "Sono già in squadra" (select dei claimable) / "Sono nuovo" (nome, ruolo: stesse opzioni di `NewPlayerForm`). Action: `auth.signUp`; se `mode=new` inserisce `players` con `is_active:false` e `player_accounts` con `is_new_player:true`; se `existing`, ricontrolla lato server che il giocatore sia ancora claimable. Status `pending`. Se l'insert fallisce dopo il signUp, elimina l'utente auth con il service role. Redirect a `/profilo`.
- [ ] **Step 3: `/accedi`** — `signInWithPassword`, errore "Email o password errati", redirect a `?next=` o `/profilo`. Link a registrati e password dimenticata.
- [ ] **Step 4: Recupero** — `/password-dimenticata` chiama `resetPasswordForEmail` con `redirectTo: <origin>/auth/callback?next=/reimposta-password`; `/auth/callback` fa `exchangeCodeForSession` e redirige a `next`; `/reimposta-password` chiama `updateUser({ password })`. Messaggio finale sempre neutro ("Se l'email esiste, ti abbiamo scritto").
- [ ] **Step 5: Verify (manuale, dev server)** — registrazione "nuovo" → riga pending + giocatore inattivo; login/logout funzionano; il giocatore inattivo **non** compare in `/players` (dopo Task 5). `npx tsc --noEmit` e `npm run lint` ok.
- [ ] **Step 6: Commit** `feat: player sign-up, sign-in and password recovery`

---

### Task 5: Pannello admin account + giocatori inattivi nascosti

**Files:**
- Create: `app/admin/accounts/page.tsx`, `app/admin/accounts/actions.ts`
- Modify: `app/admin/page.tsx` (link "Richieste account" con contatore pending), `lib/queries/players.ts` (`getPlayersWithStats`, `getGoalkeeperRanking`, `getAllPlayers` filtrano `is_active = true`)

**Interfaces:**
- Produces (server actions, ognuna verifica il cookie `calc_admin` con `verifyAdminToken` prima di agire):
  ```ts
  export async function approveAccount(userId: string): Promise<{ error?: string }> // status approved; se is_new_player: players.is_active = true
  export async function rejectAccount(userId: string): Promise<void> // cancella la riga; se is_new_player: cancella anche il giocatore inattivo
  export async function unlinkAccount(userId: string): Promise<void> // cancella la riga
  export async function resetAccountPassword(userId: string): Promise<{ tempPassword: string }> // 12 caratteri random, auth.admin.updateUserById
  ```

- [ ] **Step 1: Filtri `is_active`** nelle tre query.
- [ ] **Step 2: Actions** come da Interfaces. `approveAccount` traduce la violazione dell'indice unico (codice `23505`) in `'Questo giocatore ha già un account collegato'`.
- [ ] **Step 3: Pagina** — due liste: "In attesa" (nome, email, badge Nuovo/Esistente, Approva/Rifiuta) e "Collegati" (Scollega, Reimposta password, con la password temporanea mostrata una volta).
- [ ] **Step 4: Verify (manuale)** — approvare un esistente; approvare un nuovo e vederlo comparire in `/players`; rifiutare un nuovo e verificare che il giocatore sparisca; due richieste sullo stesso giocatore → la seconda approvazione mostra l'errore (Review Focus 5). `npx tsc --noEmit`, `npm run lint` ok.
- [ ] **Step 5: Commit** `feat: admin approval of player accounts`

---

### Task 6: Card provvisoria

**Files:**
- Create: `components/PlaceholderCard.tsx`
- Modify: `components/PlayerCard.tsx` (il ramo `!player.card_url` rende `<PlaceholderCard player={player} width={width} className={className} />`)

**Interfaces:**
- Produces: `PlaceholderCard({ player, width, className }: { player: Pick<Player,'name'|'position'>; width: number; className?: string })`

- [ ] **Step 1: Implement** — SVG con `viewBox` in rapporto 0.72, che scala con `width`: sagoma scudo con cornice chiara, gradiente viola, "??" in alto a sinistra, ruolo sotto (o "—"), sagoma testa+spalle generica, nome in basso (troncato se lungo), riga "SPD SHO PAS DRI DEF PHY" con "??". Testo leggibile anche a `width=56`.
- [ ] **Step 2: Verify (visivo)** — `npm run dev`; in `/players` e nel `FieldView` di una partita la card provvisoria sta allineata alle card reali. Confronto con `Card players/*.jpeg`.
- [ ] **Step 3: Commit** `feat: FUT-style placeholder card`

---

### Task 7: Profilo, caricamento card, ingresso nell'header

**Files:**
- Create: `lib/cardFile.ts`, `lib/cardFile.test.ts`, `app/profilo/page.tsx`, `app/profilo/actions.ts`
- Modify: `components/BottomTabBar.tsx` (ingresso Accedi / miniatura card), `app/admin/players/actions.ts` (estrarre l'upload in `lib/queries/players.ts` come `storePlayerCard(playerId: string, file: File): Promise<string>` e usarlo da entrambe le parti)

**Interfaces:**
- Produces: `export function cardFileError(f: { type: string; size: number }): string | null`; `uploadMyCard(formData: FormData): Promise<{ error?: string }>`

- [ ] **Step 1: Failing tests** in `lib/cardFile.test.ts`: png 1 MB → `null`; `image/gif` → `'Formato non supportato (usa PNG, JPG o WEBP)'`; jpeg di `5*1024*1024 + 1` → `'File troppo grande (max 5 MB)'`; size `0` → `'Nessun file selezionato'`.
- [ ] **Step 2: Run `npm test`** — FAIL. **Step 3:** implement. **Step 4:** `npm test` PASS.
- [ ] **Step 5: `uploadMyCard`** — `getSessionAccount()`, richiede `status === 'approved'` (altrimenti `'Il tuo account non è ancora stato approvato'`), `cardFileError`, `storePlayerCard(account.player_id, file)`, revalida `/`, `/players`, `/players/[id]`, `/profilo`.
- [ ] **Step 6: `/profilo`** — non loggato → redirect `/accedi?next=/profilo`. Pending → card + "In attesa di conferma dall'admin". Approved → card grande, "Carica la tua card", link al proprio `/players/[id]`, contatore MOTM (dopo Task 10), Esci.
- [ ] **Step 7: Header** — `BottomTabBar` è client: riceve `sessionCard?: { name: string; card_url: string | null } | null` da `app/layout.tsx` (che chiama `getSessionAccount`). Non loggato → link "Accedi"; loggato → miniatura che porta a `/profilo`.
- [ ] **Step 8: Verify** — upload da profilo approvato aggiorna la card ovunque; utente pending riceve l'errore (Review Focus 4). `npx tsc --noEmit`, `npm run lint`, `npm test` ok.
- [ ] **Step 9: Commit** `feat: player profile with card upload`

---

### Task 8: Apertura del voto al salvataggio del risultato

**Files:**
- Modify: `lib/queries/matches.ts` (`createMatch`, `updateMatch`), `app/admin/matches/[id]/actions.ts` (`duplicateMatchAction` resta eligible di default)

**Interfaces:**
- Consumes: `shouldOpenVote`, `closesAtFrom` (Task 1)

- [ ] **Step 1: `updateMatch`** — prima dell'update legge `motm_eligible, motm_closes_at` della partita; se `shouldOpenVote({ ...quelli, ...nuovi is_upcoming/score })` aggiunge `motm_closes_at: closesAtFrom(new Date())` all'update. **`createMatch`** — stesso controllo con `motm_eligible:true, motm_closes_at:null`.
- [ ] **Step 2: Verify (manuale)** — salvare il risultato di una partita in programma imposta `motm_closes_at` ~3 giorni avanti; risalvarla non lo sposta; correggere una vecchia partita lo lascia `null` (Review Focus 3). `npx tsc --noEmit` ok.
- [ ] **Step 3: Commit** `feat: open MOTM vote when a result is saved`

---

### Task 9: Sezione MOTM nella pagina partita

**Files:**
- Create: `lib/queries/motm.ts`, `app/matches/[id]/motmActions.ts`, `components/motm/MotmSection.tsx` (server), `components/motm/MotmCountdown.tsx` (client), `components/motm/MotmVoteGrid.tsx` (client)
- Modify: `app/matches/[id]/page.tsx`

**Interfaces:**
- Consumes: `motmStatus`, `tallyMotm`, `voteError`, `formatCountdown`, `getSessionAccount`, `getApprovedPlayerIds`
- Produces:
  ```ts
  // lib/queries/motm.ts
  export async function getVotesForMatch(matchId: string): Promise<VoteRow[]>
  export async function getMyVote(matchId: string, voterPlayerId: string): Promise<string | null>
  export async function upsertVote(matchId: string, voterPlayerId: string, votedPlayerId: string): Promise<void>
  export async function getMotmWinnersByMatch(matchIds: string[]): Promise<Record<string, string[]>> // solo partite chiuse
  // motmActions.ts
  export async function castVote(matchId: string, votedPlayerId: string): Promise<{ error?: string }>
  ```

- [ ] **Step 1: Queries** con `createAdminClient`. `getMotmWinnersByMatch` legge le partite con `motm_closes_at < now()`, i loro voti e lineup, e applica `tallyMotm`.
- [ ] **Step 2: `castVote`** — sessione → `voteError(...)` con lineup e `motm_closes_at` riletti dal DB → `upsertVote` → `revalidatePath('/matches/' + id)`.
- [ ] **Step 3: Componenti** — `MotmSection({ match })` decide lo stato come in spec (5 casi). M = `getApprovedPlayerIds(lineupIds).length`, N = `tallyMotm(...).votersCount`. `MotmCountdown({ closesAt })` aggiorna ogni 30 s con `formatCountdown`; a zero mostra "Votazione chiusa" e chiama `router.refresh()` (Review Focus 2). `MotmVoteGrid` mostra le `PlayerCard` della lineup tranne sé, evidenzia il voto corrente, ottimistico con `useTransition`, mostra l'errore restituito.
- [ ] **Step 4: Pagina** — `export const dynamic = 'force-dynamic'` (sostituisce `revalidate = 60`: la sezione dipende dall'utente e dall'ora); `<MotmSection>` sotto il campo.
- [ ] **Step 5: Verify (manuale, due account)** — votare, cambiare voto, tentare per sé (bottone assente; chiamata forzata → errore), utente non in campo vede il messaggio, "N su M" corretto; impostare a mano `motm_closes_at` nel passato → appare il vincitore; pareggio → due card. Togliere un votante dalla lineup → N scende (Review Focus 1). `npx tsc --noEmit`, `npm run lint`, `npm test` ok.
- [ ] **Step 6: Commit** `feat: MOTM vote on match page`

---

### Task 10: Badge, contatore e classifica MOTM

**Files:**
- Create: `components/motm/MotmBadge.tsx`
- Modify: `components/MatchCard.tsx` (prop opzionale `motmNames?: string[]`), le pagine che rendono `MatchCard` (passano i vincitori da `getMotmWinnersByMatch`), `app/players/[id]/page.tsx` ("MOTM ×N"), `components/StatsRankings.tsx` + `app/stats/page.tsx` (sezione "Man of the Match")

**Interfaces:**
- Consumes: `getMotmWinnersByMatch`
- Produces: `export async function getMotmCounts(): Promise<Record<string, number>>` in `lib/queries/motm.ts` (player_id → MOTM, co-MOTM conta 1); `MotmBadge({ names }: { names: string[] })`.

- [ ] **Step 1: `getMotmCounts`** costruita su `getMotmWinnersByMatch` su tutte le partite chiuse.
- [ ] **Step 2: Badge** in `MatchCard` e in testa alla sezione MOTM chiusa; contatore nella pagina giocatore e in `/profilo` (nascosto se 0); nuova sezione in `StatsRankings` con lo stesso pattern collassabile delle altre, ordinata per MOTM desc poi nome, solo giocatori con ≥1.
- [ ] **Step 3: Verify** — con una partita chiusa e votata: badge in lista, contatore nel profilo, riga in statistiche. `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` ok.
- [ ] **Step 4: Commit** `feat: MOTM badge, profile counter and stats ranking`
