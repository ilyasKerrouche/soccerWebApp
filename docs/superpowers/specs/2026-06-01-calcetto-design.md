# Calcetto Web App — Design Spec

**Data:** 2026-06-01  
**Stack:** Next.js 14 (App Router) + Supabase (PostgreSQL) + Tailwind CSS  
**Deploy:** Vercel

---

## 1. Obiettivo

Web app pubblica per tracciare le partite di calcetto di un gruppo amici. Chiunque può visualizzare dati e statistiche; solo l'admin può inserire e modificare i dati.

---

## 2. Stack tecnico

| Layer | Scelta |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| ORM | Supabase JS Client |
| Styling | Tailwind CSS |
| Deploy | Vercel |
| Auth admin | Password singola via variabile d'ambiente (`ADMIN_PASSWORD`) confrontata server-side, sessione gestita con cookie httpOnly |

---

## 3. Autenticazione admin

- Pagina `/admin/login` con campo password
- Se corretta, viene settato un cookie httpOnly firmato con `ADMIN_SECRET`
- Tutte le route `/admin/*` verificano il cookie via middleware Next.js
- Nessun sistema di registrazione — un solo admin

---

## 4. Data model (Supabase / PostgreSQL)

### Tabella `players`
```
id          uuid PK
name        text NOT NULL
position    text          -- es. CAM, CM, CB, ST...
ovr         integer       -- rating FIFA della card
card_url    text          -- URL immagine card (storage Supabase)
created_at  timestamptz
```

### Tabella `matches`
```
id           uuid PK
played_at    date NOT NULL
team_a_name  text DEFAULT 'Team A'
team_b_name  text DEFAULT 'Team B'
score_a      integer       -- NULL per partite future
score_b      integer       -- NULL per partite future
is_upcoming  boolean DEFAULT false
created_at   timestamptz
```

### Tabella `match_players`
```
id          uuid PK
match_id    uuid FK → matches.id
player_id   uuid FK → players.id
team        text NOT NULL  -- 'a' | 'b'
goals       integer DEFAULT 0
```

Le presenze totali e i goal totali sono calcolati aggregando `match_players` — non stored separatamente.

---

## 5. Pagine e routing

```
/                     → Home (pubblica)
/matches              → Lista partite (pubblica)
/matches/[id]         → Dettaglio partita (pubblica)
/players              → Lista giocatori (pubblica)
/stats                → Statistiche stagione (pubblica)
/admin/login          → Login admin
/admin                → Dashboard admin (protetta)
/admin/matches/new    → Inserisci nuova partita (protetta)
/admin/matches/[id]   → Modifica partita (protetta)
```

---

## 6. Design visivo

**Tema generale:** dark, sfondo `#0a0f0a`, accenti verde `#4ade80`  
**Font:** system-ui / Segoe UI  
**Navigation:** bottom tab bar fissa (Home, Partite, Giocatori, Stats)

### Home (`/`)
- Header con logo e stagione
- 3 stat globali: partite totali, goal totali, giocatori attivi
- Card "prossima partita" (sfondo verde effetto campo)
- Card "ultima partita" cliccabile → `/matches/[id]`
- Classifica marcatori con mini card FIFA e barra laterale

### Lista partite (`/matches`)
- Lista cronologica inversa di tutte le partite giocate
- Ogni riga: data, punteggio, nome team vincitore, cliccabile → `/matches/[id]`
- Le partite future appaiono in cima con badge "In programma" e senza punteggio

### Partita (`/matches/[id]`)
- Hero con punteggio grande, data, badge vincitore
- Due blocchetti "Top scorer" (uno per team)
- Campo da calcio SVG verde con le card FIFA dei giocatori posizionate per metà campo (Team A sinistra, Team B destra)
- Sezione marcatori per team (nome + goal)

### Giocatori (`/players`)
- **Sfondo:** `#0d0d1a` (indigo scuro), **accento:** viola `#a78bfa`
- Pill per ordinare (più goal / più presenze / A–Z)
- Podio top 3: card grande al centro (1°), due più piccole ai lati (2° e 3°) con base del podio
- Lista compatta per i restanti giocatori (rank, mini card, nome, goal, presenze)

### Stats (`/stats`)
- 4 box globali (goal totali, partite, vittorie team A, vittorie team B)
- Bar chart goal per partita (ultime 8)
- Classifica marcatori con barra di progressione verde
- Classifica presenze con barra di progressione viola

### Admin (`/admin`)
- Badge rosso "Admin" in header
- Form inserimento partita:
  - Data (date picker)
  - Nome team A e team B + score per team
  - Grid giocatori presenti (card cliccabili, toggle selected)
  - Marcatori per team: select giocatore + contatore goal +/−
  - Possibilità di aggiungere più marcatori per team
  - Pulsante "Salva partita"
- Sezione "Prossima partita programmata" con modifica/elimina
- Le partite future (`is_upcoming: true`) non hanno punteggio

### Partite futura (inserimento)
- Stesso form admin ma con flag "Partita futura"
- Campi punteggio e marcatori disabilitati
- Appare in Home come "Prossima partita"

---

## 7. Card giocatori FIFA

- Le immagini delle card sono già fornite dall'utente (JPEG)
- Vengono caricate su **Supabase Storage** (bucket pubblico `player-cards`)
- La URL pubblica viene salvata in `players.card_url`
- Nell'app vengono mostrate come `<img>` semplice — nessuna modifica
- Il caricamento delle card avviene una volta sola tramite upload manuale nell'admin Supabase (non serve UI di upload nell'app)

---

## 8. Statistiche calcolate

Tutte derivate da query Supabase, nessun campo precalcolato:

- **Goal totali giocatore:** `SUM(match_players.goals)` per `player_id`
- **Presenze totali:** `COUNT(match_players.id)` per `player_id`
- **Vittorie per team:** `COUNT(matches)` dove `score_a > score_b` (o viceversa)
- **Media goal per partita:** `SUM(score_a + score_b) / COUNT(matches)`
- **Top scorer partita:** `MAX(match_players.goals)` per `match_id` e `team`

---

## 9. Fuori scope

- Autenticazione per i giocatori (solo admin)
- Notifiche push per le partite
- Chat o commenti
- Storico stagioni multiple (la stagione è un'etichetta testuale, non una struttura dati separata)
- Upload card nell'app (gestito manualmente via Supabase dashboard)
