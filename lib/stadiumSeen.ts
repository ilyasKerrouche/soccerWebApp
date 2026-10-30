// lib/stadiumSeen.ts
// Chiave di sessione per l'entrata delle card sul campo della home, condivisa con lo script inline del layout.
export const STADIUM_SEEN_KEY = 'stadium-entry-seen'

/** Script eseguito prima del primo disegno: se l'entrata e' gia' stata vista in questa sessione la disattiva. */
export const STADIUM_SEEN_SCRIPT = `try{if(sessionStorage.getItem('${STADIUM_SEEN_KEY}')==='1')document.documentElement.dataset.stadiumSeen='1'}catch(e){}`
