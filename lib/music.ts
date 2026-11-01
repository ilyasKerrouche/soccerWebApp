// lib/music.ts
// Modulo puro: regole della musica di sottofondo (components/MusicButton.tsx).

export type MusicPref = 'on' | 'off'

export const MUSIC_PREF_KEY = 'calcetto:music'
export const MUSIC_SRC = '/music/menu.mp3'
/** Volume del sottofondo (0–1). */
export const MUSIC_VOLUME = 0.15

/** Solo una pausa esplicita spegne la musica; senza preferenza salvata e' accesa. */
export function parseMusicPref(raw: string | null): MusicPref {
  return raw === 'off' ? 'off' : 'on'
}

/** Partenza automatica al primo tocco: non se l'utente l'ha spenta, mai nell'area admin. */
export function shouldAutostart(pref: MusicPref, pathname: string): boolean {
  return pref === 'on' && !(pathname === '/admin' || pathname.startsWith('/admin/'))
}
