# v2 — Il resto dell'app nello stile della home

Data: 2026-10-30
Versione: chiude la **v2.0.0** (restyling completo dell'app; la home è uscita nella v1.1.0)

## Perché

La nuova home (spec `2026-10-30-v2-home-design.md`) ha un aspetto sobrio e professionale, ma le altre pagine
sono ancora nel vecchio stile: fondo quasi nero `#06060f`, accento viola `#a78bfa`, liste piatte con filetti.
Passando dalla home a Partite o Statistiche sembra di cambiare app. L'utente usa **tutto** quello che c'è
nelle pagine: si cambia solo l'aspetto, non il contenuto.

Riferimento visivo approvato dall'utente ("mi piace così"): `pagine-stile-home.html`
in `.superpowers/brainstorm/59685-1793365679/content/` (non versionato; tre telefoni: Partite, Statistiche, Profilo).

## Obiettivi

1. Partite, Statistiche e profilo giocatore ridisegnati come nel mockup approvato.
2. Tutta l'app (barra in alto, sfondo, accesso, area personale, admin) con la palette della home: nessun viola rimasto.
3. Stessi contenuti e stesse funzioni di oggi in ogni pagina.

## Fuori scopo

- Creatore di card FUT nell'app (progetto successivo).
- Musica di sottofondo, stile campo personalizzabile, highlights GoPro, palette "verde campo".
- Nuove funzioni o dati nuovi nelle pagine.

## Anti-obiettivi

- Togliere informazioni che oggi ci sono (l'utente le usa tutte).
- Look da videogioco: niente gradienti accesi, corsivi, neon. Una sola luce blu leggera dietro podio e card del profilo.
- Cambiare l'aspetto della home già approvata, campo 3D compreso.
- Rompere le pagine quando mancano dati (nessuna partita, nessun MOTM, giocatore senza partite, nessun portiere).

## Palette e pezzi comuni (dalla home)

| Elemento | Valore |
| --- | --- |
| Fondo | `#0d1420` |
| Superfici | `#141d2b` (riquadro), `#1a2536` (dentro un riquadro / elemento attivo) |
| Bordo riquadri e separatori | `rgba(255,255,255,.08)` |
| Testo / secondario | `#e8ecf2` / `#8a96a8` |
| Accento (unico) | `#5b9cff` |
| Oro, solo MOTM | `#f5c451` |
| Vittoria / sconfitta / pareggio | verde `#4ade80`, rosso `#f87171`, grigio `#64748b` (pallini forma, esiti V/N/S, autogol) |

Pezzi che si riusano: riquadro arrotondato (16px), titolo di sezione 15px semibold con link blu a destra,
riquadri numerici (numero grande + etichetta grigia), selettore a pillola, riquadro "Prossima partita" con conto alla rovescia.

## Pagine ridisegnate (come nel mockup)

### Partite (`/matches`)
- Titolo "Partite" con sotto "{n} giocate · stagione 2025/26".
- **In programma**: per ogni partita futura il riquadro "Prossima partita" identico a quello della home
  (giorno, ora, conto alla rovescia, "Aggiungi al calendario"); tocco → dettaglio partita.
- **Risultati**: partite giocate raggruppate per mese (etichetta del mese in maiuscoletto grigio), un riquadro per mese.
  Ogni riga: giorno + giorno della settimana a sinistra, le due squadre una sotto l'altra con i gol a destra
  (vincitore in bianco grassetto, perdente grigio, pareggio entrambi grigi), "★ MOTM nome" in oro se c'è.
- Tocco sulla riga → si apre sotto: formazioni nei due riquadrini (squadra vincente con titolo bianco),
  marcatori con squadra e gol, autogol in rosso, "Vedi dettaglio →" in blu.
- Stato vuoto: messaggio come oggi.

### Statistiche (`/stats`)
- Titolo "Statistiche", sotto "Stagione 2025/26".
- Podio dei 3 migliori marcatori con le card vere (1° più grande, gol in blu), luce blu leggera dietro.
- Tre riquadri: partite, gol, gol a partita.
- Selettore a pillola con le cinque classifiche di oggi (Marcatori, Presenze, Rendimento, Portieri, MOTM),
  stesse regole di oggi per nascondere Portieri e MOTM; scorre in orizzontale se non ci sta.
- Ogni classifica in un riquadro; righe con posizione (la prima in blu), nome, valore a destra con nota piccola grigia,
  pallini della forma in Rendimento, ★ in oro nella classifica MOTM. Tocco → profilo.

### Profilo giocatore (`/players/[id]`)
- "‹ Statistiche" in blu in alto (e il gesto indietro di oggi).
- Card grande centrata con luce blu leggera, nome, ruolo, "★ N volte MOTM" a pillola dorata (se ≥1), pallini della forma.
- Riquadri numerici 2×2: gol, presenze, gol a partita, % vittorie con "xV yN zP" (l'ultimo solo se ha giocato).
- Portieri: un secondo gruppo di riquadri (subiti a partita, gol subiti, porta inviolata) con i numeri in verde.
- "Gol per partita": il grafico di oggi dentro un riquadro, barre blu, zero come moncone grigio.
- "Storico partite": un riquadro con righe esito (V verde / N grigio / S rosso), risultato, data, gol in blu e autogol in rosso; tocco → partita.

## Pagine allineate alla palette *(mia scelta: niente mockup, stesso linguaggio)*

Contenuto e struttura invariati; si cambiano colori, riquadri e pulsanti:
- **Barra in alto** (`BottomTabBar`) e **sfondo dell'app** (`app/layout.tsx`, `globals.css`): fondo `#0d1420`, barra come nel mockup
  (sfocata, bordo sotto, voce attiva bianca, nome utente in blu). Ai lati su desktop un blu-notte più scuro.
- **Dettaglio partita** (`/matches/[id]`, con la sezione MOTM e la griglia di voto): riquadri arrotondati, accento blu, oro per il MOTM.
- **Accesso**: accedi, registrati, password dimenticata, reimposta password. Modulo in un riquadro, campi su `#1a2536`, pulsante pieno blu.
- **Area personale** (`/profilo`, caricamento card): stesso trattamento.
- **Elenco giocatori** (`/players`).
- **Admin**: tutte le pagine (`/admin`, login, account, giocatori, nuova/modifica partita e i componenti `components/admin/*`).
  Solo palette e riquadri, nessun ridisegno.
- **Caricamento** (`loading.tsx`, `Skeleton`), `PullToRefresh`, `AddToCalendar`, `BarChart`, `AvailabilityPoll` se ancora usati.

## Vincoli

- Next.js 14 app router, Tailwind; nessuna nuova dipendenza.
- La palette va nei token di Tailwind (`tailwind.config.ts`: `brand` → `#5b9cff`, `bg` → `#0d1420`, `bg-card`/superfici della home)
  e nelle classi; i colori viola scritti a mano nei file (`167,139,250`, `#a78bfa`, `#6366f1`, `99,102,241`, `#06060f`, `#0d0d1f`)
  vanno sostituiti. Alla fine nessuna di queste stringhe deve restare in `app/` e `components/`,
  tranne `PlaceholderCard` (vedi sotto).
- **`PlaceholderCard` non cambia** *(mia scelta)*: è la grafica della card provvisoria, compare anche sul campo della home già approvato.
- Le pagine restano con la stessa cache di oggi (`revalidate = 60`, il dettaglio partita e l'admin senza cache).
- Date nel fuso `Europe/Rome` con le funzioni di `lib/homeText.ts` (`formatRomeDay`, `formatRomeTime`) dove servono.
- Il raggruppamento per mese delle partite è logica pura in `lib/` con test (`node --test`), come gli altri moduli.
- Verifica visiva su telefono (Chrome stretto e Safari vero) prima del rilascio.
- `CHANGELOG.md`: voce **2.0.0** con il restyling completo; versione 2.0.0 in `package.json`, tag `v2.0.0`.

## Decisioni prese *(mie, durante la stesura; l'utente ha approvato il mockup)*

| Tema | Decisione |
| --- | --- |
| Più partite in programma | Un riquadro "Prossima partita" per ciascuna, in ordine di data |
| Riquadro "Prossima partita" | Si estrae dalla home in un componente condiviso, così è identico nelle due pagine |
| Iniziali nelle classifiche | Il mockup mostra un cerchietto con le iniziali: si tiene, è solo decorazione |
| `PageHeader` | Si aggiorna allo stile nuovo (titolo 26px, sottotitolo grigio) e resta condiviso |
| Ordine del rilascio | Un solo rilascio 2.0.0 quando tutte le pagine sono pronte |

## Lasciato al builder

- Come dividere i componenti e se aggiornare `MatchCard`/`PodiumView`/`StatsRankings` o riscriverli.
- Le misure esatte (partire dal mockup) e l'animazione di apertura delle partite.
- Come rendere gli stati di caricamento coerenti con le nuove pagine.
