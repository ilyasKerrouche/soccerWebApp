# Changelog

Le versioni seguono [Semantic Versioning](https://semver.org/lang/it/):
il primo numero cambia con un restyling o un cambiamento grosso, il secondo con nuove funzioni, il terzo con correzioni.

## [Da pubblicare]

### Novità
- Momento MOTM nuovo: la card arriva come sagoma nera con un punto di domanda, poi un lampo dorato la svela; nome e voti compaiono solo dopo
- Avviso record: se l'ultima partita batte o eguaglia un record (vittoria più larga, partita con più gol, più gol di un giocatore, serie di gol, serie di vittorie), in Home scende una fascia dorata che porta alla bacheca dei record
- Annuncio delle formazioni: quando escono le squadre della prossima partita, alla prima apertura della Home parte una presentazione (sigla, una squadra alla volta a ventaglio, formazioni schierate). Una volta sola per partita, tocco per saltare, e si rivede da "Rivedi formazioni"
- Simbolo LIVE: mentre si gioca, il riquadro "Da giocare" mostra un pallino rosso al posto del conto alla rovescia. Serve l'orario di fine, che ora si può inserire nella partita futura dall'admin

## [2.8.0] — 2026-11-16

### Novità
- Man of the Match: il vincitore è sempre uno solo. A pari voti vince chi era nella squadra vincente, poi chi ha preso più voti dagli avversari, poi chi ha raggiunto per primo quel numero di voti. Vale anche per le partite già giocate
- Man of the Match: a voto aperto si vede chi non ha ancora votato; a voto chiuso, i voti presi da ogni giocatore (chi ha votato chi resta privato)

### Correzioni
- Modificando una partita gli autogol già inseriti non spariscono più
- Nel form partita, chi cambia squadra o viene tolto perde le sue righe marcatore (prima i gol potevano finire sotto un nome diverso da quello mostrato)
- Classifiche e statistiche giuste anche oltre le 1000 presenze totali (prima le righe in più venivano ignorate)
- Il conteggio MOTM si aggiorna appena un voto si chiude, senza il ritardo di circa un minuto
- Selettore della stagione: usa la stagione del server (niente sorprese a Capodanno) e si attenua mentre carica
- "1 giocatore", "1 giocata", "1 presenza" al singolare
- Voto MOTM senza rete: la card non resta più bloccata su "Invio…"
- La card ingrandita sul campo si chiude con Esc; sponsor e ingrandimento seguono "riduci movimento" anche se cambia ad app aperta
- Admin: errori visibili quando nome, ruolo o card di un giocatore non si salvano; data di oggi in ora italiana per le partite nuove e duplicate; un pareggio non colora più di verde la seconda squadra
- Statistiche: a pari merito podio e lista usano lo stesso ordine
- Approvare o rifiutare un account aggiorna subito elenchi e classifiche

### Sotto il cofano
- La Home legge solo le 3 partite che mostra, non tutto lo storico con le formazioni

## [2.7.1] — 2026-11-10

### Correzioni
- La pubblicazione dell'app non andava a buon fine per via della pagina admin "Nuova partita": ora le pagine admin e la Home si generano sempre a ogni visita

## [2.7.0] — 2026-11-10

### Novità
- **Stagioni** da gennaio a dicembre: la prima è la 2026 e comprende anche le partite di ottobre–dicembre 2025
- Selettore della stagione accanto al titolo in Statistiche, Giocatori e Partite, con le stagioni passate e **Sempre** (tutti i numeri e i record di sempre); la scelta resta passando da una pagina all'altra
- Classifiche, record, MOTM, forma e fiamma dei gol ripartono da zero a ogni stagione
- La Home parla della stagione in corso; finché la stagione nuova non ha partite, Risultati e Classifica lo dicono

## [2.6.0] — 2026-11-05

### Novità
- Nelle Statistiche la scheda Rendimento lascia il posto a **Record**
- Bacheca dei record: vittoria più larga, partita con più gol, serie di gol e di vittorie più lunghe, più gol in una partita
- Bomber seriali: chi ha fatto più doppiette, triplette, poker e manite
- Coppie d'oro: i compagni di squadra che vincono di più insieme (almeno 5 partite insieme)

## [2.5.0] — 2026-11-04

### Novità
- Punteggi e statistiche con un font sportivo condensato (Barlow Condensed), un po' più grandi
- Torna la fiamma 🔥 per chi segna in almeno 3 partite giocate di fila, con il numero della serie: nei marcatori della home, nelle classifiche, nell'elenco giocatori e nella pagina del giocatore

### Correzioni
- La pagina del giocatore ora calcola la serie di gol

## [2.4.0] — 2026-11-04

### Novità
- Mentre una pagina carica si vede la sua sagoma (risultato, campo, podio, card, elenchi), che poi si riempie senza far saltare niente
- Nuove sagome anche per dettaglio partita, elenco giocatori e profilo
- Le sagome compaiono solo se il caricamento dura più di un attimo, e restano ferme con "riduci movimento"

## [2.3.0] — 2026-11-01

### Novità
- Cambio pagina con una breve dissolvenza
- Nelle schede di home e Statistiche l'evidenziatore scivola sulla scheda scelta
- I numeri nei riquadri e i gol del podio salgono da zero quando si apre la pagina
- Le card del podio arrivano una dopo l'altra

## [2.2.0] — 2026-11-01

### Novità
- Dettaglio partita con il campo 3D della home: card dei giocatori, MOTM in oro, cartellone LED con risultato e marcatori, tocco su una card per le statistiche
- Marcatori della partita in un unico elenco, con i migliori di ogni squadra evidenziati
- Momento MOTM: a voto chiuso, la prima volta che si apre la home la card del vincitore entra girandosi e si illumina d'oro

## [2.1.0] — 2026-11-01

### Novità
- Musica di sottofondo: parte al primo tocco, continua tra le pagine, pulsante 🔊/🔇 nella barra in alto (la pausa viene ricordata)
- Nuovo profilo personale: card grande, gol, presenze, vittorie e MOTM, caricamento della card e link alle statistiche complete

## [2.0.1] — 2026-10-31

### Modifiche
- Il voto del Man of the Match dura 2 ore dall'inserimento del risultato (prima 3 giorni)
- Quando voti si vede chiaramente: riquadro "Hai votato …" e card scelta in oro con la spunta; mentre il voto viene inviato la card mostra "Invio…"

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
