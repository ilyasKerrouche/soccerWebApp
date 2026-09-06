# Rendimento dei giocatori e bilanciamento delle squadre

Data: 2026-09-06

## Problema

Il database sa chi ha vinto ogni partita — `match_players.team` insieme a
`matches.score_a` / `score_b` lo determina — ma l'app non lo dice mai. Le
classifiche esistenti sono marcatori, presenze e portieri: un difensore che non
perde mai è invisibile.

Da qui tre funzionalità che condividono lo stesso calcolo:

1. **Record e win rate** per ogni giocatore
2. **Form recente**, gli ultimi risultati come pallini
3. **Shuffle bilanciato** nella creazione partita, al posto del sorteggio casuale

## Decisioni prese

| Scelta | Decisione | Perché |
| --- | --- | --- |
| Metrica di bilanciamento | Win rate calcolato | Si aggiorna da solo, nessuna manutenzione manuale. Il campo `ovr` resta com'è, non viene usato dal bilanciatore |
| Pochi dati | Media pesata verso il gruppo | Nessuna soglia arbitraria, nessuno scalino |
| Portieri | Uno per squadra | Rispecchia come si gioca davvero |
| Sede del calcolo | Estensione di `getPlayersWithStats()` | Una sola query, un solo punto di verità |
| Shuffle | Casuale ma bilanciato | Ripremendo deve dare squadre diverse, altrimenti non è più uno shuffle |

## Il rating

Un pareggio vale mezza vittoria. Il valore grezzo viene tirato verso la media
del gruppo in proporzione a quanto pochi dati abbiamo sul giocatore:

```
grezzo  = (vittorie + 0.5 · pareggi) / partite
rating  = (vittorie + 0.5 · pareggi + K · mediaGruppo) / (partite + K)
```

con `K = 5`. Chi ha 2 partite pesa quasi come un giocatore medio, chi ne ha 30
pesa per quel che vale. `mediaGruppo` è la media dei valori grezzi di chi ha
almeno una presenza; se non ha giocato nessuno vale `0.5`.

Un giocatore senza presenze riceve esattamente `mediaGruppo`, quindi entra nel
bilanciamento come un giocatore medio invece di essere trattato come il peggiore.

Il rating è usato **solo** per bilanciare. Le classifiche mostrano il win rate
reale, non quello pesato: un giocatore deve vedere il proprio 100% se ha vinto
tutto, anche su 2 partite.

## Architettura

### `lib/rating.ts` — modulo puro, nuovo

Nessun import da Supabase o da React. Contiene:

- `type PlayerRecord = { wins, draws, losses, played, win_rate, form }`
  dove `form` è un array di `'W' | 'D' | 'L'` dalla più recente alla più vecchia,
  massimo 5 elementi.
- `computeRecord(rows)` — da righe `{ team, score_a, score_b, played_at }` al
  record. Una partita con punteggio `null` su uno dei due lati non viene
  conteggiata: è una partita registrata ma senza risultato.
- `groupAverage(records)` — la media dei valori grezzi.
- `balancingRating(record, groupAvg, K = 5)` — la formula sopra.

Isolato così è testabile con lo stesso metodo Node già usato per `RankDelta`:
compilare il file singolo con `tsc` ed eseguirlo.

### `lib/teamBalancer.ts` — modulo puro, nuovo

`balanceTeams(players, ratings, attempts = 200)` restituisce `{ teamA, teamB }`
come array di id.

Algoritmo:

1. Separa i giocatori con `position === 'GK'` dal resto.
2. Se ci sono almeno due portieri, ne assegna uno per squadra (scelti a caso tra
   loro) e toglie quei due dal pool. Con zero o un portiere non fa nulla di
   speciale e il portiere singolo torna nel pool normale.
3. Genera `attempts` divisioni casuali del pool rimanente, sempre rispettando la
   differenza di dimensione massima di un giocatore.
4. Tiene la divisione con la minor differenza tra somma dei rating delle due
   squadre.

Il numero di tentativi è la ragione per cui questo resta uno shuffle: 200
divisioni casuali su un gruppo tipico da 10-14 giocatori producono molte
soluzioni quasi equivalenti, quindi ripremendo il pulsante si ottengono squadre
diverse ma tutte equilibrate. Un greedy ottimale darebbe sempre la stessa
identica divisione e il pulsante diventerebbe inutile alla seconda pressione.

### `lib/queries/players.ts` — modificato

`getPlayersWithStats()` estende la `select` esistente da
`match:matches(played_at, is_upcoming)` a
`match:matches(played_at, is_upcoming, score_a, score_b)` e aggiunge `team` alle
colonne di `match_players`. Da lì delega a `computeRecord()` e allega il record
a ogni giocatore.

Nessuna query aggiuntiva: la stessa riga che già serviva per gol e presenze
porta anche il risultato.

`getPlayerProfile()` calcola il proprio record dalle partite che già carica —
ha già `playerTeam`, `score_a` e `score_b`, sono gli stessi dati che usa per le
statistiche del portiere.

### `lib/types.ts` — modificato

`PlayerWithStats` guadagna `record?: PlayerRecord`, opzionale come i campi
`prev_*` già presenti: fuori dalle classifiche non serve.

## Interfaccia

### Form come pallini — `components/FormDots.tsx`, nuovo

Fino a cinque pallini, dal più recente al più vecchio: verde vittoria, giallo
pareggio, rosso sconfitta. Chi ha meno di cinque partite mostra solo i pallini
che ha. Ogni pallino ha un `title` con data e risultato, perché il colore da
solo non basta.

Sta accanto alle frecce di movimento già presenti, che rispondono a una domanda
diversa: le frecce dicono come ti sei mosso, la form dice come stai giocando.

### Classifica rendimento

Una quarta chip `⚡ Rendimento` in `StatsRankings.tsx`, ordinata per win rate
reale decrescente, con le presenze come spareggio. Ogni riga mostra nome,
pallini della form, percentuale grande e `12V 3N 5P` sotto.

Chi ha zero presenze finisce in fondo con un trattino al posto della
percentuale, non con uno 0% che sembrerebbe un giudizio.

### Profilo giocatore

Nella fascia di intestazione, accanto a gol / presenze / media, si aggiunge un
blocco con la percentuale di vittorie e sotto il record `12V 3N 5P`. I pallini
della form vanno subito sotto.

### Shuffle nell'admin

`MatchForm` oggi riceve `players: Player[]`, senza statistiche. Passa a
`PlayerWithStats[]`, e le due pagine che lo montano —
`app/admin/matches/new/page.tsx` e `app/admin/matches/[id]/page.tsx` — passano da
`getAllPlayers()` a `getPlayersWithStats()`.

Il pulsante resta uno solo e mantiene l'etichetta di shuffle, ma sotto usa
`balanceTeams()`. Dopo la generazione compare una riga discreta con l'equilibrio
raggiunto, ad esempio `Equilibrio: 68% vs 66%`, così è chiaro che la divisione
non è casuale e si può ripremere se non convince.

Quando nessuno ha ancora giocato, tutti i rating valgono `mediaGruppo` e il
bilanciatore degrada naturalmente in un sorteggio casuale — che è esattamente il
comportamento attuale. Nessun caso speciale da scrivere.

## Cosa non facciamo

- Nessuna migration. Ogni dato necessario è già nello schema.
- Il campo `ovr` non viene toccato né usato per bilanciare.
- Nessun rendimento specifico per i portieri nel bilanciamento: mescolare media
  gol subiti e win rate significherebbe sommare due scale diverse. I portieri
  entrano con il loro win rate come tutti.
- Nessuna storicizzazione del rating.

## Verifica

Non esiste framework di test nel repo — nessuno script `test` in
`package.json`. La verifica segue il metodo già usato per `RankDelta`:
compilazione del modulo puro con `tsc` ed esecuzione su Node.

Casi da coprire su `lib/rating.ts`:

- vittoria, pareggio e sconfitta riconosciuti da entrambi i lati del campo
- partita senza punteggio esclusa dal conteggio
- giocatore senza presenze riceve `mediaGruppo`
- la media pesata avvicina alla media chi ha poche partite
- la form si ferma a cinque elementi ed è ordinata dal più recente

Casi su `lib/teamBalancer.ts`:

- squadre di dimensione uguale con numero pari di giocatori, differenza di uno
  con numero dispari
- due portieri finiscono in squadre diverse
- un solo portiere non produce errori
- chiamate ripetute producono divisioni diverse
- la differenza di rating resta sotto una soglia ragionevole su un gruppo campione

Infine `npx tsc --noEmit` e `npx eslint` sui file toccati. Il `next build`
completo va lanciato ma in questo ambiente viene ucciso dal sandbox nella fase
di lint, quindi le due verifiche separate sono l'evidenza affidabile.
