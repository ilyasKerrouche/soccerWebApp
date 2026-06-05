# Collapsible Stats Sections — Design Spec
**Date:** 2026-06-05

## Overview

Rendere le sezioni di classifica nella pagina Stats collassabili tramite chip filtro, per ridurre lo scrolling. Solo "Marcatori" è attivo di default.

---

## 1. Struttura componenti

La `app/stats/page.tsx` rimane un server component. Continua a fetchare tutti i dati server-side. Le sezioni di classifica (marcatori, presenze, portieri) vengono estratte in un nuovo client component:

**Nuovo file:** `components/StatsRankings.tsx` (`'use client'`)

**Props:**
```ts
type StatsRankingsProps = {
  players: PlayerWithStats[]       // già ordinati per goal
  goalkeepers: PlayerWithGoalkeeperStats[]
}
```

`app/stats/page.tsx` rimuove il JSX delle tre sezioni di classifica e le sostituisce con:
```tsx
<StatsRankings players={players} goalkeepers={goalkeepers} />
```

La sezione hero, i box "Stagione" e il podio rimangono server-rendered in `page.tsx`.

---

## 2. Stato e chip

**Stato:** `const [active, setActive] = useState(new Set(['marcatori']))`

Inizializzato con solo `'marcatori'` attivo. Non persiste tra sessioni (nessun localStorage).

**Chip disponibili:**

| Key | Label | Visibile quando |
|-----|-------|-----------------|
| `'marcatori'` | 🥇 Marcatori | sempre |
| `'presenze'` | 👟 Presenze | sempre |
| `'portieri'` | 🥅 Portieri | `goalkeepers.some(g => g.appearances > 0)` |

**Comportamento toggle:**
- Click su chip attivo → lo rimuove da `active` (sezione sparisce)
- Click su chip inattivo → lo aggiunge a `active` (sezione appare)
- Tutti i chip possono essere spenti contemporaneamente (stato valido)

---

## 3. Visual design chip

**Chip attivo:**
```
background: rgba(167,139,250,0.15)
border: 1px solid rgba(167,139,250,0.35)
color: #a78bfa
border-radius: 999px
padding: 4px 12px
font-size: 10px, font-weight: 700
```

**Chip inattivo:**
```
background: rgba(255,255,255,0.04)
border: 1px solid rgba(255,255,255,0.08)
color: rgba(255,255,255,0.35)
```

**Posizione:** riga di chip orizzontale, `gap: 8px`, `flex-wrap: wrap`, posizionata sopra le sezioni di classifica.

---

## 4. Sezioni

Le tre sezioni di classifica (marcatori, presenze, portieri) vengono mostrate/nascoste condizionalmente in base allo stato `active`. Il loro JSX è identico a quello attuale in `page.tsx`, semplicemente spostato in `StatsRankings.tsx`.

L'ordine delle sezioni rimane fisso: Marcatori → Presenze → Portieri.

Nessuna animazione di apertura/chiusura (fuori scope).

---

## 5. File modificati

| File | Azione |
|------|--------|
| `components/StatsRankings.tsx` | Crea nuovo client component |
| `app/stats/page.tsx` | Rimuove le 3 sezioni classifica, aggiunge `<StatsRankings />` |
