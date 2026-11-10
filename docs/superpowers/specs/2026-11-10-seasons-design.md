# Stagioni

Data: 2026-11-10

## Perché

Oggi tutte le statistiche contano le partite di sempre, e "Stagione 2025/26" è solo un'etichetta scritta nel
codice (`app/stats/page.tsx`, `app/matches/page.tsx`, `components/PlayersClient.tsx`, più la sezione
"Stagione" in `components/HomeClient.tsx`). L'utente vuole che l'app ragioni davvero per stagioni:
ogni anno si riparte da zero, si possono rivedere le stagioni passate e resta disponibile una vista "di sempre".
In `TODO.md` corrisponde alla voce "Stagioni: archivio della stagione chiusa e ripartenza da zero".

## Regole della stagione (decise dall'utente)

- Una stagione è un **anno solare**: dal 1° gennaio al 31 dicembre.
- **Eccezione per la prima:** le partite di ottobre–dicembre 2025 fanno parte della **stagione 2026**.
  La stagione 2026 comprende quindi tutto ciò che è stato giocato fino al 31/12/2026.
- Eventuali partite precedenti a ottobre 2025 contano anch'esse come 2026: tutto ciò che è prima del 2026 è 2026
  (scelta di Claude).
- La stagione nuova parte da sola il 1° gennaio: nessuna azione da parte dell'admin, niente da "chiudere".
- L'elenco delle stagioni si ricava dalle date delle partite, non va mantenuto a mano.
- Il nome della stagione è l'anno ("2026"), non più "2025/26".

## Cosa segue la stagione

Tutto quello che mostra numeri è legato alla stagione (deciso dall'utente):

- **Statistiche:** podio, i tre numeri (partite, gol, a partita), tutte le classifiche (marcatori, presenze,
  portieri, MOTM…), tab Record, coppie d'oro.
- **Giocatori:** lista con gol, presenze, pallini della forma e fiamma della striscia di gol; pagina del singolo
  giocatore (`app/players/[id]`) con i suoi numeri e le sue partite.
- **Partite:** la lista dei risultati mostra solo le partite della stagione scelta.
- **Home:** sezione "Stagione" e classifica marcatori riguardano la stagione in corso. Il blocco dell'**ultima
  partita** (risultato, campo 3D con le card, marcatori, scritta LED) mostra sempre l'ultima partita giocata, anche
  se è della stagione precedente, e **le card sul campo usano i numeri della stagione di quella partita** (deciso
  dall'utente: a inizio gennaio si vede la partita di dicembre con i suoi numeri). Se la stagione in corso non ha
  ancora partite, i risultati e la classifica della Home mostrano un messaggio che lo fa capire (es. "Stagione 2027
  al via: ancora nessuna partita") invece di zeri o liste vuote (deciso dall'utente).
- **Dettaglio partita** (`app/matches/[id]`): le card sul campo usano i numeri della stagione a cui appartiene
  quella partita, indipendentemente dal selettore (scelta di Claude, coerente con la Home).
- **MOTM:** i conteggi MOTM sono per stagione (ipotesi di Claude, confermata dall'utente).
- **Forma e fiamma dei gol ripartono da zero** con la stagione: alla prima partita di gennaio contano solo le
  partite della stagione nuova (deciso dall'utente).

## Giocatori senza presenze e partite in programma (scelte di Claude)

- In una stagione, classifiche, podio e lista Giocatori mostrano **solo chi ha giocato almeno una partita in quella
  stagione**. Se nessuno ha giocato (inizio gennaio), al posto della lista compare un messaggio di stagione appena
  iniziata. Il numero di giocatori mostrato segue la stessa regola.
- La pagina di un giocatore senza partite nella stagione scelta mostra card e nome con il messaggio "Nessuna
  partita in questa stagione" al posto dei numeri.
- In Partite, "In programma" compare solo quando è scelta la stagione in corso, e lì mostra tutte le partite in
  programma, anche quelle già fissate per gennaio dell'anno dopo. Con una stagione passata o "Sempre" si vedono
  solo i risultati.

## Selettore

- In **Statistiche, Giocatori e Partite** c'è un bottone a pillola accanto al titolo (lo slot `aside` di
  `PageHeader`) con l'anno scelto, es. "2027 ▾". Toccandolo si apre un piccolo menu: la stagione in corso in cima
  (con "in corso"), poi le precedenti dalla più recente, infine **"Sempre"** (deciso dall'utente, opzione A del
  mockup `selettore.html` in `.superpowers/brainstorm/57694-1794313723/content/`, non versionato).
- **Di default** si vede la stagione in corso (deciso dall'utente).
- **"Sempre"** mostra tutti i numeri di sempre, record compresi (deciso dall'utente).
- **La scelta vale per tutta l'app** finché non la si cambia: se in Statistiche passo al 2026, anche Giocatori e
  Partite mostrano il 2026. Riaprendo l'app si riparte dalla stagione in corso (ipotesi di Claude, confermata).
- La **Home non ha selettore** e mostra sempre la stagione in corso (ipotesi di Claude, confermata).
- Il sottotitolo sotto il titolo smette di dire "Stagione 2025/26"; il resto del testo resta (es. "12 giocate").

## Obiettivi

1. Concetto di stagione (anno solare, eccezione 2025→2026) in un modulo puro e testato.
2. Tutte le pagine elencate sopra filtrano per la stagione scelta.
3. Selettore come da mockup in Statistiche, Giocatori e Partite, condiviso tra le pagine.
4. Nessun anno scritto a mano nel codice.

## Fuori scopo

- Premi o riepilogo di fine stagione, "campione della stagione", archivio con pagina dedicata.
- Confronto tra stagioni.
- Stagioni configurabili dall'admin (date diverse dall'anno solare).

## Anti-obiettivi

- Perdere o alterare dati: le partite non vengono toccate, la stagione si deduce dalla data.
- Che a gennaio l'app sembri rotta: con zero partite nella stagione nuova le pagine devono mostrare uno stato
  vuoto chiaro, non errori o numeri strani.
- Un'etichetta o un numero della stagione sbagliata in qualche angolo dell'app (es. Home sulla stagione in corso
  ma card del campo con i numeri di sempre).

## Cosa resta al builder

- Come portare la scelta tra le pagine (parametro nell'URL propagato dai link, cookie di sessione, ecc.), purché
  rispetti "condivisa tra le pagine, si riparte dalla stagione in corso riaprendo l'app". Le pagine oggi sono
  server component con `revalidate = 60`: la soluzione non deve rompere la cache in modo costoso.
- Se filtrare per data nelle query Supabase o in memoria dopo il caricamento (i dati sono pochi).
- Fuso orario per decidere a quale anno appartiene una partita: usare l'ora di Roma, come il resto dell'app
  (`formatRomeDay`).
