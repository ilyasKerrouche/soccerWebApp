# Changelog

Le versioni seguono [Semantic Versioning](https://semver.org/lang/it/):
il primo numero cambia con un restyling o un cambiamento grosso, il secondo con nuove funzioni, il terzo con correzioni.

## [Unreleased] — 2.0.0

Restyling completo dell'app (in corso).

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
