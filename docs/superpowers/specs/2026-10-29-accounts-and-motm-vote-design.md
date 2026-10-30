# Account giocatori e voto Man of the Match

Data: 2026-10-29

## Problema

Il gruppo vuole votare il Man of the Match dopo ogni partita. Oggi però l'app
non sa chi sta usando il telefono: l'unico login è la password condivisa
dell'admin, e il voto di disponibilità si basa su un nome scritto a mano
(`availability_votes.voter_name`). Con un sistema così chiunque può votare al
posto di un altro, quindi un voto del MOTM non sarebbe affidabile.

Servono due cose, in quest'ordine:

1. **Account personali**: ogni giocatore ha un login collegato al suo profilo
   giocatore e alla sua card.
2. **Voto MOTM**: sotto ogni partita giocata, chi era in campo vota il migliore.

L'obiettivo di fondo è rendere l'app "super figa" per il gruppo. Questo lavoro
prepara le animazioni e la grafica che arriveranno dopo, a partire dal badge
del MOTM.

## Fuori scopo (progetti successivi)

- Animazioni e restyling della homepage
- Highlights dai video GoPro
- Login con Google e notifiche push
- Migrazione del voto di disponibilità agli account. Resta com'è.

## Anti-obiettivi

- Che qualcuno riesca a prendersi il profilo, la card o le statistiche di un
  altro.
- Che qualcuno voti due volte, voti per sé stesso o voti per una partita in cui
  non ha giocato.
- Che il login diventi un muro: l'app deve restare consultabile senza account,
  come oggi.

## Decisioni prese

Le righe segnate *(mia scelta)* sono scelte mie che l'utente ha visto nel
riepilogo e non ha contestato. Le altre le ha prese l'utente.

| Scelta | Decisione |
| --- | --- |
| Chi carica la card vera | Il giocatore stesso, dal suo profilo |
| Card iniziale | Card provvisoria disegnata dall'app in stile FUT, con nome, ruolo, sagoma e "??" al posto delle statistiche |
| Registrazione di chi è già in squadra | Sceglie il suo nome dalla lista, l'admin conferma il collegamento |
| Registrazione di un nuovo giocatore | Crea un nuovo giocatore con la card provvisoria |
| Metodo di login | Email e password con Supabase Auth *(mia scelta)* |
| Senza login | Tutta l'app resta visibile. Il login serve solo per votare e per il proprio profilo *(mia scelta)* |
| Ruolo e OVR | Li controlla l'admin. L'OVR nel DB non dipende dall'immagine della card *(mia scelta)* |
| Pannello admin | Resta con la sua password attuale, in più ha la lista delle richieste da approvare *(mia scelta)* |
| Chi vota | Solo i giocatori in `match_players` di quella partita, con account approvato |
| Voto per sé stessi | Vietato |
| Durata del voto | 3 giorni, con un timer a conto alla rovescia visibile sotto la partita |
| Risultati durante il voto | Nascosti. Si vede solo quanti hanno votato *(mia scelta)* |
| Cambio voto | Consentito finché il voto è aperto *(mia scelta)* |
| Pareggio | Co-MOTM: vincono tutti i giocatori a pari voti *(mia scelta)* |
| Nessun voto | La partita resta senza MOTM *(mia scelta)* |
| Riconoscimento | Badge sulla partita, contatore "MOTM ×N" nel profilo e nelle statistiche *(mia scelta)* |
| Conferma email | Disattivata: l'identità la garantisce già l'approvazione dell'admin *(mia scelta)* |
| Password dimenticata | Recupero via email di Supabase, più reset da parte dell'admin come piano B *(mia scelta)* |
| "N su M hanno votato" | M = giocatori in campo con account approvato, cioè chi può votare davvero *(mia scelta)* |
| Richiesta rifiutata | La riga viene cancellata, l'utente può riprovare *(mia scelta)* |
| Collegamento sbagliato | L'admin può scollegare un account approvato *(mia scelta)* |

## Parte 1 — Account

### Modello dati

Si usa Supabase Auth (`auth.users`) per email e password. Una nuova tabella
collega l'utente al giocatore:

```sql
create table player_accounts (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_new_player boolean not null default false,
  created_at  timestamptz default now()
);
-- un giocatore può avere al massimo un account approvato
create unique index on player_accounts(player_id) where status = 'approved';
```

I nuovi giocatori hanno bisogno di un'approvazione *(mia scelta)*. Un
giocatore creato da "Sono nuovo" esiste subito nella tabella `players`, ma non
compare nelle liste pubbliche né nella creazione delle partite finché l'admin
non approva la richiesta. Serve a evitare che degli sconosciuti riempiano la
rosa. Se ne occupa una nuova colonna `players.is_active boolean not null default
true`. La registrazione da nuovo inserisce il giocatore con `false`, e
l'approvazione lo porta a `true`. Le query pubbliche esistenti filtrano su
`is_active`.

### Flusso

1. `/registrati`: l'utente inserisce email e password, poi sceglie fra due
   strade:
   - **"Sono già in squadra"**: sceglie il suo nome da un elenco. L'elenco
     esclude i giocatori che hanno già un account approvato o una richiesta in
     attesa.
   - **"Sono nuovo"**: inserisce il nome e un ruolo indicativo. L'admin può
     cambiare il ruolo in seguito.
2. Si crea una riga in `player_accounts` con `status = 'pending'`. Finché è in
   attesa, l'utente vede un messaggio "In attesa di conferma" nel profilo.
3. L'admin, in `/admin`, vede le richieste con nome, email e tipo
   (esistente/nuovo) e le approva o le rifiuta. Rifiutare un nuovo giocatore
   elimina anche il giocatore inattivo che era stato creato.
   Rifiutare cancella la riga di `player_accounts`, così l'utente può fare una
   nuova richiesta. L'admin può anche **scollegare** un account già
   approvato, se ha collegato la persona sbagliata: la riga viene cancellata e
   l'utente torna senza profilo. I voti già dati restano legati al giocatore.
4. `/accedi`: login con email e password. La conferma dell'email in Supabase è
   disattivata, quindi la registrazione apre subito la sessione. Il recupero
   password usa il flusso email standard di Supabase, che richiede la rotta
   `/auth/callback`. Poiché senza SMTP personalizzato il mailer di Supabase è
   molto limitato, nel pannello admin c'è anche "Reimposta password", che
   imposta una password temporanea con
   `auth.admin.updateUserById` (service role) da comunicare al giocatore.
5. `/profilo`: mostra la card, lo stato dell'account, il caricamento della card
   e il logout.

Nell'header compare un ingresso discreto: "Accedi" se l'utente non è loggato,
la miniatura della sua card se lo è.

### Card provvisoria

Il fallback di `components/PlayerCard.tsx`, oggi un riquadro grigio con
l'iniziale, diventa una card disegnata in CSS/SVG nello stile delle card reali
(vedi la cartella `Card players/`). Ha la forma con la cornice sagomata, uno
sfondo viola con gradiente, il nome, il ruolo, una sagoma generica al posto
della foto e "??" al posto di OVR e statistiche. Mantiene il rapporto 0.72
delle card reali, così si allinea con le altre in ogni griglia. Vale per tutti
i giocatori senza `card_url`, non solo per i nuovi.

### Caricamento card dal profilo

Riusa la logica di `uploadPlayerCard` (`app/admin/players/actions.ts`, bucket
`player-cards`) in una nuova server action che:

- legge l'utente dalla sessione Supabase;
- verifica che abbia un account `approved` e ricava da lì il `player_id`, senza
  mai accettarlo dal client;
- accetta solo immagini (png/jpeg/webp) fino a 4 MB;
- aggiorna `players.card_url`.

### Sessione

Oggi `lib/supabase/server.ts` ha `set`/`remove` vuoti e il middleware gestisce
solo `/admin`. Per Supabase Auth i cookie di sessione vanno scritti e
rinfrescati. Bisogna quindi estendere il middleware con il refresh della
sessione su tutte le rotte, senza cambiare il comportamento dell'admin, e dare
al client server dei cookie scrivibili dove serve (server actions e route
handler).

## Parte 2 — Voto Man of the Match

### Modello dati

```sql
alter table matches add column motm_closes_at timestamptz;

create table motm_votes (
  id                uuid primary key default uuid_generate_v4(),
  match_id          uuid not null references matches(id) on delete cascade,
  voter_player_id   uuid not null references players(id) on delete cascade,
  voted_player_id   uuid not null references players(id) on delete cascade,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(match_id, voter_player_id),
  check (voter_player_id <> voted_player_id)
);
create index on motm_votes(match_id);
```

### Apertura e chiusura

- Una nuova colonna `matches.motm_eligible boolean not null default true`
  distingue le partite che possono avere un voto. La migrazione la imposta a
  `false` per tutte le partite già giocate (`is_upcoming = false`): niente
  voto retroattivo, e lì la sezione MOTM non compare *(mia scelta)*.
- `motm_closes_at` viene impostato a `now() + 3 giorni`, contati dal momento
  del salvataggio, la prima volta che una partita con `motm_eligible = true`
  diventa "giocata" (`is_upcoming = false` e punteggi non nulli). Vale sia per
  la modifica admin sia per una partita creata già giocata. Le modifiche
  successive del risultato non lo spostano, perché `motm_closes_at` non è più
  nullo.
- Non serve un job pianificato. Lo stato si calcola alla lettura: il voto è
  aperto se `now() < motm_closes_at`, chiuso altrimenti.

### Regole del voto (verificate sul server)

Un voto è valido solo se:

- l'utente ha un account `approved`. Il votante è il suo `player_id`, ricavato
  dalla sessione;
- il votante è in `match_players` di quella partita;
- il votato è in `match_players` di quella partita ed è diverso dal votante;
- il voto è ancora aperto.

Il voto si salva con un upsert su `(match_id, voter_player_id)`, così cambiare
idea sovrascrive il voto precedente.

### Pagina partita (`app/matches/[id]`)

Sotto il campo compare una sezione "Man of the Match":

- **Voto aperto, utente votante**: timer a conto alla rovescia (giorni, ore,
  minuti, aggiornato lato client), griglia delle card dei giocatori in campo
  escluso sé stesso, con il voto attuale evidenziato, e "N su M hanno votato".
- **Voto aperto, utente non votante** (non loggato, non approvato o non in
  campo): timer, "N su M hanno votato" e un messaggio che spiega perché non può
  votare, con il link ad "Accedi" se non è loggato.
- **Voto chiuso con vincitore**: la card del MOTM (o delle card a pari merito)
  in evidenza, con il numero di voti. Chi ha votato chi resta privato *(mia
  scelta)*.
- **Voto chiuso senza voti**: "Nessun MOTM per questa partita".
- **Partita senza `motm_closes_at`** (vecchia o non ancora giocata): sezione
  assente.

In "N su M hanno votato", M è il numero di giocatori in campo che hanno un
account approvato, cioè quelli che possono votare davvero.

La pagina oggi ha `revalidate = 60`. La sezione del voto deve riflettere subito
il voto appena dato e lo scadere del timer, quindi va resa dinamica o
rinvalidata dopo il voto.

### Riconoscimento

- **Lista partite e dettaglio**: badge MOTM con il nome del vincitore.
- **Pagina giocatore**: contatore "MOTM ×N".
- **Statistiche**: una nuova sezione "Man of the Match" nello stesso stile
  delle sezioni esistenti, con la classifica per numero di MOTM. In caso di
  pareggio, ogni co-MOTM conta 1.

## Lasciato al builder

- La struttura delle query (`lib/queries/motm.ts`, `lib/queries/accounts.ts` o
  simili) e il calcolo del vincitore in SQL o in TS.
- Il disegno esatto della card provvisoria, purché stia bene accanto alle card
  reali.
- Cosa fare dei voti già dati se l'admin toglie un giocatore dalla formazione
  di una partita: la scelta ragionevole è non conteggiarli.
- Il fuso orario di visualizzazione è Europe/Rome. Il timer usa
  `motm_closes_at` assoluto.
- Nient'altro sulla sicurezza: è deciso qui sotto.

## Sicurezza delle nuove tabelle *(mia scelta)*

Oggi le letture passano dalla chiave pubblica `anon`, e le tabelle esistenti
non hanno RLS. Se `player_accounts` e `motm_votes` nascessero allo stesso modo,
chiunque potrebbe scriverci direttamente con la chiave del browser, saltando
tutti i controlli: approvarsi da solo o votare più volte. Quindi:

- `player_accounts` e `motm_votes` hanno **RLS attivo e nessuna policy**. Sono
  inaccessibili alla chiave `anon`, e tutte le letture e le scritture passano
  dal client service role (`lib/supabase/admin.ts`) dentro server action e
  server component, dopo le verifiche d'identità. In questo modo resta
  privato anche chi ha votato chi.
- Le tabelle esistenti senza RLS restano come sono. È un problema già
  esistente, fuori dallo scopo di questo lavoro, e lo segnaliamo all'utente.
