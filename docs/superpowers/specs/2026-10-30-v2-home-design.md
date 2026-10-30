# v2 — Nuova homepage con il campo 3D

Data: 2026-10-30
Versione: parte della **v2.0.0** (restyling completo dell'app; questa è la prima pagina)

## Perché

L'app sembra piatta e troppo scura. L'utente vuole un'app che faccia effetto ma resti
**professionale**: niente aria da videogioco (gradienti accesi ovunque, corsivi maiuscoli, neon).
Si procede un pezzo alla volta, partendo dalla homepage e dal suo elemento principale, un campo 3D
con le card dei giocatori.

Riferimenti visivi (mockup approvati, nella sessione di brainstorming):
- campo: `campo-c-fermo.html` → poi `cartelloni.html` variante "LED con i dati" → `pubblicita.html` variante B;
- pagina: `home-layout1-v2.html` (giocatore loggato / visitatore).
Si trovano in `.superpowers/brainstorm/59685-1793365679/content/` (non versionati).

## Obiettivi

1. Un campo 3D realistico in cima alla home, con l'ultima partita giocata e le card vere.
2. La home riorganizzata con le stesse informazioni di oggi, più due aggiunte: il voto MOTM in evidenza e "Il tuo riepilogo".
3. Un aspetto sobrio e professionale: colori neutri, un solo colore di accento, oro solo per il MOTM.

## Fuori scopo (vengono dopo, sempre nella v2)

- Restyling delle altre pagine (Partite, Statistiche, profilo giocatore, admin) e della barra in alto.
- Palette definitiva dell'intera app (la variante "verde campo" è ancora in valutazione).
- Musica di sottofondo stile menu FC.
- Stile del campo personalizzabile (nel `TODO.md`).
- Scroll della lista partite e highlights GoPro (nel `TODO.md`).

## Anti-obiettivi

- Il campo non deve mai coprire o confondere le card: niente tribune alte, niente camera che si muove.
- Niente testo sgranato: cartelloni e card devono essere nitidi su telefono.
- Niente marchi reali nelle pubblicità finte.
- La home non deve rompersi se mancano dati (nessuna partita, nessun MOTM, utente non loggato).

## Decisioni prese

Le righe *(mia scelta)* sono state decise da me durante il brainstorming e non contestate; le altre dall'utente.

| Tema | Decisione |
| --- | --- |
| Partita mostrata sul campo | **Sempre l'ultima partita giocata**; la prossima va nella scheda Riepilogo |
| Tipo di campo | Campo realistico (prato a strisce, linee bianche, aree), **non** ologramma, **non** stadio con tribune |
| Movimento | **Fermo**: nessuna rotazione, nessun movimento di camera |
| Entrata | Le card salgono dal prato una dopo l'altra, una volta per sessione *(proposta mia, approvata)* |
| Card | Le card vere dei giocatori, in piedi sulla loro posizione, con ombra a terra |
| Targhette | Sotto ogni card una targhetta con il nome; dorata con ★ per il MOTM |
| Cartellone in fondo | LED scuro (trama a puntini) con testo nitido che scorre: risultato, ★ MOTM in oro, marcatori, prossima partita |
| Cartelloni laterali | Sponsor **inventati** a rotazione: ogni lato è un LED che cambia sponsor ogni ~3,5 s con effetto tendina |
| Cartellone verso la camera | Assente (si vedrebbe da dietro) |
| Nitidezza | Campo disegnato a dimensione doppia e rimpicciolito con la prospettiva *(mia scelta tecnica, verificata nei mockup)* |
| Tocco su una card | La card si gira e si ingrandisce con gol, presenze, % vittorie, MOTM, forma e "Vedi profilo" |
| Layout della pagina | Layout "schede ordinate": campo, poi selettore a pillola con tre schede |
| Nomi delle schede | **Riepilogo · Risultati · Classifica** (non ripetono la barra in alto) *(proposta mia, approvata)* |
| Intestazione della home | Si toglie l'intestazione "Stagione 2025/26 · Calcetto": era ridondante *(mia lettura di "togliere l'header ridondante")* |
| Voto MOTM | Riquadro dorato sotto il campo mentre il voto dell'ultima partita è aperto |
| Il tuo riepilogo | In cima alla scheda Riepilogo, solo per chi è loggato con account approvato |
| Sondaggio disponibilità | Tolto dalla home (già fatto sul branch) |
| Colori della home | Fondo blu-notte neutro `#0d1420`, superfici `#141d2b`/`#1a2536`, testo `#e8ecf2`, secondario `#8a96a8`, accento `#5b9cff`, oro MOTM `#f5c451` (palette dei mockup approvati) |
| Movimento ridotto | Con `prefers-reduced-motion` niente entrata e niente scorrimento/rotazione dei LED *(mia scelta)* |

## Il campo

### Contenuto
- **Sopra il campo**: data dell'ultima partita, le due squadre con il risultato, "Vince X" o "Pareggio", e "★ MOTM nome" se c'è.
- **Sul campo**: i giocatori di `match_players` dell'ultima partita. Squadra A nella metà vicina, squadra B in quella lontana.
  Posizioni da `holoSlots()` (`lib/holoLayout.ts`, già esistente e testato): portiere in porta se il ruolo è GK/POR/Portiere/P, gli altri in file da due.
- **Card**: l'immagine della card del giocatore ritagliata a forma di scudo (le immagini caricate hanno un fondo bianco); chi non ha la card usa `PlaceholderCard`.
- **MOTM**: alone dorato e targhetta dorata con ★. Più vincitori in caso di pareggio.

### Cartelloni
- **In fondo (LED dati)**: testo che scorre, composto dai dati reali:
  `{Squadra A} {gol} – {gol} {Squadra B} · ★ MOTM {nomi} · {marcatore} ×{gol} … · PROSSIMA PARTITA · {giorno} · ORE {hh:mm}`.
  Parti assenti (niente MOTM, niente marcatori, niente prossima partita) si omettono.
- **Lati (sponsor)**: Pizzeria Il Rigore 🍕, Bar Sport da Pino ☕, Palestra Fuorigioco 💪, Ottica VAR 👓 "vediamoci chiaro",
  Gelateria Il Pallonetto 🍦, Autofficina Tripletta 🔧. Ogni lato ruota sullo stesso elenco con partenza sfalsata.
  Elenco in un file di configurazione, facile da cambiare.
- Cartelloni più alti di prima e inclinati all'indietro come quelli veri, così quelli laterali si leggono.

### Interazione
- Tocco su una card → sovrapposizione a tutto schermo con la card grande che si gira, le statistiche e "Vedi profilo" (`/players/[id]`); tocco ovunque per chiudere.
- Le statistiche vengono da `getPlayersWithStats()` e `getMotmCounts()` (già usati dal componente attuale).

### Base di partenza
Esiste già `components/HoloPitch.tsx` (versione ologramma, ruotante): va trasformato o sostituito secondo questo documento.
Gli stili `.holo-*` in `app/globals.css` vanno sostituiti di conseguenza.

## La pagina

Dall'alto:
1. **Ultima partita + campo** (sopra).
2. **Riquadro voto MOTM** — solo se il voto dell'ultima partita è aperto (`motmStatus(...) === 'open'`):
   titolo, squadre, "chiude tra …" (conto alla rovescia). Il pulsante dipende da chi guarda *(mia scelta)*:
   - non loggato → "Accedi" verso `/accedi?next=/matches/{id}`;
   - loggato, in campo, non ha ancora votato → "Vota" verso `/matches/{id}`;
   - loggato, in campo, ha già votato → "Hai votato" e "Cambia" verso `/matches/{id}`;
   - loggato ma non in campo (o non approvato) → riquadro informativo con "Vedi" verso `/matches/{id}`.
3. **Selettore a pillola**: Riepilogo · Risultati · Classifica.
4. **Scheda Riepilogo**:
   - *Il tuo riepilogo* (solo loggato e approvato): card, nome, ruolo, presenze, gol, % vittorie, MOTM, pallini della forma; link "Profilo".
   - *Prossima partita* (se c'è): giorno e ora, conto alla rovescia in giorni/ore/minuti, "Aggiungi al calendario" (componente esistente).
   - *Marcatori ultima partita*: elenco con squadra e gol.
5. **Scheda Risultati**: ultime 3 partite giocate (data, squadre con il vincitore evidenziato, risultato), link "Tutte" verso `/matches`.
6. **Scheda Classifica**: 4 numeri della stagione (partite, gol, vittorie squadra A, vittorie squadra B), top 5 marcatori, link "Classifiche" verso `/stats`.

Stati vuoti: senza partite giocate la home mostra un messaggio al posto di campo e schede Risultati/Classifica vuote;
senza prossima partita la sezione non compare.

## Vincoli

- Next.js 14 app router, Tailwind, nessuna nuova dipendenza per il campo (CSS 3D, niente Three.js: lo stadio WebGL è stato scartato).
- I dati del giocatore loggato si leggono come già fa l'header (azione server lato client), per non rendere la home dinamica per tutti; il riepilogo personale e lo stato del voto ("hai votato") sono caricati lato client dopo il primo render. *(mia scelta)*
- Nessun dato privato dei voti (chi ha votato chi) arriva al client: solo "hai votato sì/no" per l'utente corrente.
- Deve funzionare bene su iPhone (Safari): prestazioni del 3D con 10 card e 3 cartelloni animati da verificare su dispositivo.
- Aggiornare `CHANGELOG.md` sotto *Unreleased — 2.0.0*.

## Chiarimenti dopo la revisione *(tutte scelte mie)*

- **Chi sta guardando.** Una nuova azione server, separata da `getHeaderCard` (che gira su ogni pagina),
  per esempio `getHomeViewer(matchId)`, restituisce solo: tipo di visitatore (`anon` / `pending` / `player` / `admin`),
  `playerId` se giocatore approvato, `inLineup` per l'ultima partita, `voted` (sì/no).
  Le statistiche del riepilogo si prendono dalla mappa delle statistiche già passata al client, indicizzata per `playerId`.
  Lo stato "hai votato" non entra mai nell'HTML in cache (la home resta `revalidate = 60`).
- **Admin e account in attesa.** Il riquadro del voto per loro è informativo con "Vedi" (mai "Accedi");
  "Il tuo riepilogo" compare solo per giocatori approvati. Se la stessa persona ha sia la sessione giocatore sia il cookie admin,
  per il voto e il riepilogo conta la sessione giocatore.
- **Pagina in cache e voto.** Il conto alla rovescia del riquadro gira nel client; arrivato a zero il riquadro sparisce.
  Che il riquadro compaia con fino a 60 s di ritardo dopo l'apertura del voto è accettabile. Il server rifiuta comunque i voti tardivi.
- **MOTM sul campo.** Oro, ★ e "MOTM" nel LED solo a voto **chiuso** (come oggi con `getMotmWinnersByMatch`),
  coerente con la regola che i risultati restano nascosti finché il voto è aperto.
- **Ritaglio delle card.** `clip-path` a scudo applicato all'immagine caricata; la `PlaceholderCard` (già trasparente) non si ritaglia.
  Ombra e alone dorato con `filter: drop-shadow` su un contenitore esterno.
- **Orari.** Fuso fisso `Europe/Rome` per data, ora della partita e testo del LED.
  I conti alla rovescia (voto e prossima partita) girano nel client con un timer; formato in giorni/ore/minuti.
- **Sponsor.** In `lib/sponsors.ts`, emoji ammesse. Non modificabili dall'admin per ora.
- **Vecchi componenti.** `HomeClient.tsx` si riscrive; `HoloPitch.tsx` e gli stili `.holo-*` si sostituiscono.
  `PageHeader` e `ScoreCount` si tolgono dalla home ma restano nel progetto se usati altrove (verificare prima di cancellare).

## Lasciato al builder

- Come dividere i componenti (campo, cartelloni, sovrapposizione card, riquadro voto, riepilogo personale).
- Il ritaglio esatto a scudo delle card caricate e le dimensioni precise (partire dai mockup).
- La durata e la curva dell'entrata delle card.
- Come comporre il testo del LED quando è molto lungo o molto corto.
