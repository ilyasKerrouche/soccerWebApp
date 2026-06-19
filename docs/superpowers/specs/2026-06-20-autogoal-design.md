# Design: Autogoal (Own Goals)

**Date:** 2026-06-20

## Obiettivo

Permettere all'admin di registrare autogoal per ogni partita. Gli autogoal contano nel punteggio della squadra avversaria ma non nelle statistiche personali del giocatore.

## Approccio scelto

Colonna `own_goals` su `match_players` (Opzione A).

---

## 1. Database

**Migrazione:** `004_add_own_goals.sql`

```sql
alter table match_players
  add column own_goals integer not null default 0;
```

Nessun dato esistente viene modificato (default 0). La colonna `goals` rimane per i gol regolari.

---

## 2. Tipi TypeScript

`lib/types.ts` — aggiornare `MatchPlayer`:

```ts
export type MatchPlayer = {
  id: string
  match_id: string
  player_id: string
  team: 'a' | 'b'
  goals: number
  own_goals: number  // nuovo
}
```

---

## 3. Form Admin — ScorerEntry

**File:** `components/admin/ScorerEntry.tsx`

- Aggiungere `is_own_goal: boolean` al tipo `ScorerRow`
- Ogni riga mostra un toggle "OG" — quando attivo, bordo/sfondo rosso tenue
- Il toggle non cambia la struttura della riga, solo il flag
- Un giocatore può avere righe separate per gol regolari e autogoal nella stessa partita

---

## 4. Form Admin — MatchForm

**File:** `components/admin/MatchForm.tsx`

Nel tipo `SaveData.players`, aggiungere `own_goals: number`.

Nel `handleSubmit`, costruire due mappe separate:
- `goalsMap`: somma dei `goals` per `player_id` (righe con `is_own_goal = false`)
- `ownGoalsMap`: somma dei `goals` per `player_id` (righe con `is_own_goal = true`)

Passare entrambi nel payload `players`.

---

## 5. Azioni di salvataggio

**File:** `app/admin/matches/new/actions.ts` e `app/admin/matches/[id]/actions.ts`

Scrivere il campo `own_goals` nel DB insieme a `goals` per ogni `match_players` row.

---

## 6. Query — Statistiche

**File:** `lib/queries/players.ts`

- `getPlayersWithStats`: nessuna modifica — `total_goals` usa già solo `goals`
- `getPlayerProfile`: aggiungere `own_goals` nel select di `match_players`, includerlo nel risultato per ogni partita

---

## 7. Profilo Giocatore

**File:** `app/players/[id]/page.tsx`

Nella cronologia partite, se `own_goals > 0` mostrare un badge rosso:

```
2 ⚽   1 🔴 OG
```

I due badge appaiono affiancati. Il badge OG è sempre distinto da quello gol regolari.

---

## Vincoli

- Un autogoal da team A conta per team B e viceversa — questa logica è solo visuale, il punteggio nel DB resta invariato (già corretto dalla fonte)
- Gli autogoal non modificano `total_goals`, `scoring_streak`, né `avg goals`
- Nessuna modifica alle statistiche portiere
