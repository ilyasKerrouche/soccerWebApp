// lib/safeNext.ts
// Valida un percorso di redirect arrivato dall'utente: solo percorsi relativi del sito.
export function safeNext(next: unknown, fallback: string): string {
  if (typeof next !== 'string' || !next.startsWith('/')) return fallback
  // Niente caratteri di controllo (tab/newline vengono rimossi dal parser URL e aprono "//host")
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback
  try {
    const u = new URL(next, 'http://x')
    if (u.origin !== 'http://x') return fallback
    return u.pathname + u.search + u.hash
  } catch {
    return fallback
  }
}
