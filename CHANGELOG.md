# Changelog

Le versioni seguono [Semantic Versioning](https://semver.org/lang/it/):
il primo numero cambia con un restyling o un cambiamento grosso, il secondo con nuove funzioni, il terzo con correzioni.

## [2.0.0] — 2026-10-30

Restyling completo: tutta l'app nello stile della nuova home.

### Nuovo aspetto
- Partite: prossima partita con conto alla rovescia, risultati raggruppati per mese con MOTM in oro, formazioni e marcatori al tocco
- Statistiche: podio con le card, numeri della stagione nei riquadri, classifiche con selettore a pillola
- Profilo giocatore: card grande, numeri nei riquadri, grafico dei gol e storico con vittorie/pareggi/sconfitte
- Barra in alto, dettaglio partita, accesso, area personale e admin con i colori della home (blu notte, accento blu, oro per il MOTM)

### Correzioni
- In home la classifica marcatori non mostra più chi non ha segnato
- Marcatori a pari gol nello stesso ordine nel cartellone LED e nella lista

## [1.1.3] — 2026-10-30

### Correzioni
- Il dettaglio partita e le pagine admin mostrano sempre i dati aggiornati (prima potevano restare fermi a una versione vecchia)

## [1.1.2] — 2026-10-30

### Correzioni
- Le richieste di account in attesa ora compaiono sempre nel pannello admin (prima la lista poteva restare ferma a una versione vecchia)
- Voti e Man of the Match letti sempre aggiornati dal database

## [1.1.1] — 2026-10-30

### Correzioni
- Le card dei giocatori sul campo della home ora si vedono anche su Safari (iPhone e Mac)

## [1.1.0] — 2026-10-30

Prima parte del restyling: la nuova homepage.

### Nuova homepage
- Ultima partita su un campo 3D realistico con le card vere dei giocatori e targhette con i nomi (dorata per il MOTM)
- Cartellone LED con risultato, MOTM, marcatori e prossima partita; sponsor inventati a rotazione sui lati
- Tocco su una card per vedere gol, presenze, vittorie, MOTM e forma
- Riquadro per votare il Man of the Match mentre il voto è aperto
- "Il tuo riepilogo" per chi ha fatto login
- Schede Riepilogo · Risultati · Classifica con conto alla rovescia della prossima partita
- Rimosso il sondaggio sulle disponibilità dalla home

## [1.0.0] — 2026-10-30

Prima versione numerata: lo stato dell'app in produzione a questa data.

### Partite e statistiche
- Registro delle partite con squadre, risultato, marcatori e autogol
- Classifiche: marcatori, presenze, rendimento (vittorie, win rate, forma recente) e portieri
- Profilo giocatore con storico partite, statistiche da portiere e card FUT
- Shuffle bilanciato delle squadre nella creazione partita
- Orario della partita, conto alla rovescia e aggiunta al calendario

### Account dei giocatori
- Registrazione e login con email e password, recupero password
- Collegamento a un giocatore esistente o creazione di un nuovo giocatore, con approvazione dell'admin
- Card provvisoria in stile FUT e caricamento della propria card dal profilo
- Header con "Accedi", il nome del giocatore o "Admin"

### Man of the Match
- Voto di 3 giorni dopo ogni partita, riservato a chi era in campo, senza voto per se stessi
- Risultati nascosti fino alla chiusura, co-MOTM in caso di pareggio
- Badge sulle partite, contatore "MOTM ×N" nel profilo e classifica MOTM nelle statistiche

### Admin
- Pannello protetto da password per partite, giocatori e richieste di account
