# TODO

In ordine di priorità.

- [ ] Creatore di card FUT direttamente dall'app (in pausa, da ripensare)
  - Ognuno sceglie i propri valori (valutazione e statistiche), come su fifarosters.com
  - Grafiche nostre, non quelle EA; si parte dalla card provvisoria
  - Nodo aperto: oggi i selfie vengono trasformati in "calciatore" a mano con strumenti di GenAI. Da decidere se farlo fare all'app (costo per foto, selfie inviati a un servizio esterno) o tenerlo manuale
- [x] Bellezza: dettaglio partita con il campo 3D della home e le card di quella partita
- [x] Bellezza: momento MOTM alla chiusura del voto (la card del vincitore si gira e si illumina d'oro, una volta sola)
- [x] Bellezza: transizioni tra pagine e micro-animazioni (pillola che scorre, numeri che salgono, podio che arriva)
- [x] Bellezza: schermate di caricamento con la forma delle pagine nuove
- [x] Bellezza: annuncio delle formazioni all'apertura della Home quando escono le squadre (stile "ventaglio", una volta sola per partita e per telefono)
  - [ ] Stacco musicale sulla sigla
- [x] Bellezza: simbolo LIVE rosso sul riquadro "Da giocare" mentre si gioca, tra orario di inizio e di fine inseriti dall'admin
- [x] Bellezza: avviso dorato in Home quando l'ultima partita batte o eguaglia un record
- [ ] Bellezza: icona dell'app e piccolo logo del gruppo
- [x] Bellezza: font più sportivo (condensato, sobrio) per punteggi e statistiche
- [ ] Squadre bilanciate automatiche per la prossima partita (in base a gol, vittorie e forma)
- [ ] Testa a testa tra due giocatori (gol, vittorie, MOTM, insieme e contro)
- [x] Stagioni: stagione ad anno solare, selettore con le stagioni passate e "Sempre", ripartenza da zero a gennaio
- [ ] Performance (ramo dopo le stagioni): card dei giocatori ridimensionate invece che a grandezza piena (oggi `unoptimized`, fino a 4 MB anche a 32 px; verificare la scena 3D su Safari); letture Supabase non ripetute nella stessa pagina; la Home in realtà non è in cache (le letture col client a cookie la rendono dinamica)
  - [x] La Home non carica più tutte le partite per mostrarne 3
- [x] Stagioni, rifiniture (dalla revisione del ramo stagioni): selettore con la stagione del server, segnale di caricamento al cambio stagione, singolari ("1 giocatore", "1 giocata"), conteggio MOTM aggiornato appena un voto si chiude, cache delle stagioni svuotata quando si approva o rifiuta un account, Home e dettaglio partita con la stessa regola per la stagione, commento di `lib/supabase/public.ts`
- [ ] Lista partite: scroll invece di una lista infinita
- [x] Correzioni minori: la card ingrandita in home si chiude con Esc; l'animazione del campo segue il cambio di "riduci movimento" anche ad app aperta
- [ ] Highlights dai video GoPro
- [x] Musica di sottofondo stile menu FC (royalty-free, parte con un tocco)
- [ ] Palette "verde campo" da valutare
- [ ] Stile del campo 3D personalizzabile
- [ ] Promemoria per il voto MOTM e il giorno della partita (sull'iPhone le notifiche richiedono l'app installata)
- [ ] App installabile sul telefono (icona sulla schermata Home, schermo intero)
- [ ] Da tenere d'occhio (dal controllo bug di novembre 2026)
  - Pagina giocatore e classifica portieri passano l'elenco delle partite nell'indirizzo della richiesta (`.in('id', …)`): oltre qualche centinaio di partite per giocatore l'indirizzo diventa troppo lungo, serve una join
  - `components/AvailabilityPoll.tsx`, `ScoreCount.tsx`, `BarChart.tsx` e `app/availability/actions.ts` non sono usati da nessuna pagina; se il sondaggio disponibilità torna, la action scrive senza controllare chi chiama
  - Modificare una partita cancella e reinserisce le formazioni in due passi: se il secondo fallisce la partita resta senza giocatori (servirebbe una funzione SQL unica)
